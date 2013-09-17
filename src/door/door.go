package door

import(
  "appengine"
  ds "appengine/datastore"
  "appengine/urlfetch"
  "appengine/user"
  "encoding/json"
  "github.com/alexjlockwood/gcm"
  "html/template"
  "net/http"
)

func RegisterHandlers() {
  http.HandleFunc("/door", handleDoorClient)
  http.HandleFunc("/api/door/open", handleApiDoorOpen)
  http.HandleFunc("/api/door/apply", handleApiDoorApply)
  http.HandleFunc("/api/door/authorize", handleApiDoorAuthorize)
  http.HandleFunc("/api/door/create", handleApiDoorCreate)
  //http.HandleFunc("/api/door/update", handleApiDoorUpdate)
  //http.HandleFunc("/api/door/list", handleApiDoorList)
  // TODO(robert): Add API to delete a door.
  // TODO(robert): Add API to revoke access to a door.
}

// Common externally facing errors.
var (
  ErrMethodNotAllowed = Err{"Method not allowed.", http.StatusMethodNotAllowed}
  ErrNoLogin = Err{"Login required.", http.StatusForbidden}
  ErrNoUserKey = Err{"'user_key' required.", http.StatusBadRequest}
  ErrNoDoorKey = Err{"'door_key' required.", http.StatusBadRequest}
  ErrNoConf =
      Err{"Service configuration uninitialized.", http.StatusServiceUnavailable}
)

// Web UI client of the door service.
func handleDoorClient(w http.ResponseWriter, r *http.Request) {
  c := appengine.NewContext(r)
  u := user.Current(c)
  if u == nil {
    url, _ := user.LoginURL(c, "/door")
    http.Redirect(w, r, url, http.StatusTemporaryRedirect)
    return
  }

  clientData := ClientData{Admin: u.Admin}

  // Load all the openable doors.
  openerAccesses := []Access{}
  if _, err := ds.NewQuery("Access").
      Filter("UserKey=", ds.NewKey(c, "User", u.ID, 0, nil)).
      Filter("Level>=", LevelOpener).
      GetAll(c, &openerAccesses); err != nil {
    writeErr(w, err)
    return
  }
  doorKeys := make([]*ds.Key, len(openerAccesses))
  clientData.Doors = make([]ClientDoor, len(openerAccesses))
  for i, a := range openerAccesses {
    doorKeys[i] = a.DoorKey
    clientData.Doors[i] = ClientDoor{
      Key: a.DoorKey.Encode(),
      Openable: true,
      Own: a.Level == LevelOwner,
    }
  }
  doors := make([]Door, len(clientData.Doors))
  if err := ds.GetMulti(c, doorKeys, doors); err != nil {
    writeErr(w, err)
    return
  }

  for i, dKey := range doorKeys {
    clientData.Doors[i].DisplayName = doors[i].DisplayName

    // Load door owner display name.
    a := Access{}
    if _, err := ds.NewQuery("Access").
        Filter("DoorKey=", dKey).
        Filter("Level=", LevelOwner).
        Run(c).
        Next(&a); err != nil {
      if err == ds.Done {
        c.Errorf("Door (%s) has no owner.", dKey.Encode())
      }
      writeErr(w, err)
      return
    }
    owner := User{}
    if err := ds.Get(c, a.UserKey, &owner); err != nil {
      if err == ds.ErrNoSuchEntity {
        c.Errorf("Door's (%s) owner (%s) doesn't exist.", dKey.Encode(),
            a.UserKey.Encode())
      }
      writeErr(w, err)
      return
    }
    clientData.Doors[i].OwnerDisplayName = owner.DisplayName

    // Load pending users.
    pendingAccesses := []Access{}
    if _, err := ds.NewQuery("Access").
        Filter("DoorKey=", dKey).
        Filter("Level=", LevelPending).
        GetAll(c, &pendingAccesses); err != nil {
      writeErr(w, err)
      return
    }
    pendingUserKeys := make([]*ds.Key, len(pendingAccesses))
    clientData.Doors[i].PendingUsers = make([]ClientUser, len(pendingAccesses))
    for j, a := range pendingAccesses {
      pendingUserKeys[j] = a.UserKey
      clientData.Doors[i].PendingUsers[j].Key = a.UserKey.Encode()
    }
    if err := ds.GetMulti(c, pendingUserKeys, clientData.Doors[i].PendingUsers);
        err != nil {
      writeErr(w, err)
      return
    }

    // Load opener users.
    openerAccesses := []Access{}
    if _, err := ds.NewQuery("Access").
        Filter("DoorKey=", dKey).
        Filter("Level=", LevelOpener).
        GetAll(c, &openerAccesses); err != nil {
      writeErr(w, err)
      return
    }
    openerUserKeys := make([]*ds.Key, len(openerAccesses))
    clientData.Doors[i].OpenerUsers = make([]ClientUser, len(openerAccesses))
    for j, a := range openerAccesses {
      openerUserKeys[j] = a.UserKey
      clientData.Doors[i].OpenerUsers[j].Key = a.UserKey.Encode()
    }
    if err := ds.GetMulti(c, openerUserKeys, clientData.Doors[i].OpenerUsers);
        err != nil {
      writeErr(w, err)
      return
    }
  }

  tpl, err := template.ParseFiles("templates/door.html")
  if err != nil {
    writeErr(w, err)
    return
  }
  if err = tpl.ExecuteTemplate(w, "door", clientData); err != nil {
    c.Errorf("Error while executing door template: %s", err.Error())
    writeErr(w, err)
    return
  }
}

// API to open a door. Requires "door_id" of the door to open.
// TODO(robert): Protect against XSRF attack.
var (
  ErrNoOpenerAccess = Err{
      "Either the door doesn't exist or you don't have opener access.",
      http.StatusBadRequest}
  ErrGcmFail = Err{"Failed to open door.", http.StatusInternalServerError}
)
func handleApiDoorOpen(w http.ResponseWriter, r *http.Request) {
  if r.Method != "POST" {
    writeErr(w, ErrMethodNotAllowed)
    return
  }
  dKey, err := ds.DecodeKey(r.FormValue("door_key"))
  if err != nil {
    writeErr(w, ErrNoDoorKey)
    return
  }
  c := appengine.NewContext(r)
  u := getUser(c)
  if u == nil {
    writeErr(w, ErrNoLogin)
    return
  }

  cnt := 0
  if cnt, err = ds.NewQuery("Access").
      Filter("UserKey=", ds.NewKey(c, "User", u.ID, 0, nil)).
      Filter("DoorKey=", dKey).
      Filter("Level>=", LevelOpener).
      Count(c); err != nil {
    writeErr(w, err)
    return
  }
  if cnt == 0 {
    writeErr(w, ErrNoOpenerAccess)
    return
  }

  config := getConfig(c)
  if config == nil {
    writeErr(w, ErrNoConf)
    return
  }

  door := getDoor(c, dKey)
  if door == nil {
    writeErr(w, ErrNoOpenerAccess)
    return
  }

  client := urlfetch.Client(c)
  sender := gcm.Sender{config.ApiKey, client}
  msg := &gcm.Message{
      RegistrationIDs: []string{door.RegId},
      Data: map[string]string{"action":"OPEN"}}

  var response *gcm.Response
  response, err = sender.SendNoRetry(msg)
  if err != nil {
    c.Errorf("Error while sending message to GCM service: %s", err.Error())
    writeErr(w, ErrGcmFail)
    return
  }

  w.Header().Set("Content-type", "text/json; charset=utf-8")
  jsonEncoder := json.NewEncoder(w)
  jsonEncoder.Encode(response)
}

// API that allows a user to apply for access to a door. Requires "door_id" of
// the door to apply for access to.
// TODO(robert): Protect against XSRF attack.
var (
  // TODO(robert): This error leaks whether a door exists.
  ErrApplyReject = Err{
      "Either you have already applied, already have access, or the door doesn't exist.",
      http.StatusBadRequest}
)
func handleApiDoorApply(w http.ResponseWriter, r *http.Request) {
  if r.Method != "POST" {
    writeErr(w, ErrMethodNotAllowed)
    return
  }
  dKey, err := ds.DecodeKey(r.FormValue("door_key"))
  if err != nil {
    writeErr(w, ErrNoDoorKey)
    return
  }
  c := appengine.NewContext(r)
  u := getUser(c)
  if u == nil {
    writeErr(w, ErrNoLogin)
    return
  }

  uKey := ds.NewKey(c, "User", u.ID, 0, nil)
  var cnt int; cnt, err = ds.NewQuery("Access").
      Filter("UserKey=", uKey).
      Filter("DoorKey=", dKey).
      Count(c)
  if err != nil {
    writeErr(w, err)
    return
  }
  if cnt > 0 {
    writeErr(w, ErrApplyReject)
    return
  }
  if getDoor(c, dKey) == nil {
    writeErr(w, ErrApplyReject)
    return
  }

  // Create user if doesn't already exist.
  if err := getOrCreateUser(c, uKey, &User{u.String()}); err != nil {
    writeErr(w, err)
    return
  }

  // Create pending access to door.
  if _, err = ds.Put(c, ds.NewIncompleteKey(c, "Access", nil),
       &Access{uKey, dKey, LevelPending}); err != nil {
    writeErr(w, err)
    return
  }
}

// API that authorizes a pending user for access to a door. Only available to
// door owners. Requires "user_id" of the user to authorize and "door_id" of the
// door to access.
var (
  ErrAuthorizeReject = Err{"User is already authorized or has not applied.",
      http.StatusBadRequest}
)
func handleApiDoorAuthorize(w http.ResponseWriter, r *http.Request) {
  if r.Method != "POST" {
    writeErr(w, ErrMethodNotAllowed)
    return
  }
  uKey, err := ds.DecodeKey(r.FormValue("user_key"))
  if err != nil {
    writeErr(w, ErrNoUserKey)
    return
  }
  var dKey *ds.Key; dKey, err = ds.DecodeKey(r.FormValue("door_key"))
  if err != nil {
    writeErr(w, ErrNoDoorKey)
    return
  }
  c := appengine.NewContext(r)
  u := getUser(c)
  if u == nil {
    writeErr(w, ErrNoLogin)
    return
  }

  access := Access{}
  k, err := ds.NewQuery("Access").
      Filter("UserKey=", uKey).
      Filter("DoorKey=", dKey).
      Filter("Level=", LevelPending).
      Run(c).
      Next(&access)
  if err != nil {
    if err == ds.Done {
      writeErr(w, ErrAuthorizeReject)
    } else {
      writeErr(w, err)
    }
    return
  }

  access.Level = LevelOpener
  if _, err = ds.Put(c, k, &access); err != nil {
    writeErr(w, err)
    return
  }
}

// API to create a new door. Requires "reg_id" and "device_id" of the device.
// Only admin can execute this API at the moment.
var (
  ErrNoRegId = Err{"'reg_id' required.", http.StatusBadRequest}
  ErrNoDeviceId = Err{"'device_id' required.", http.StatusBadRequest}
)
func handleApiDoorCreate(w http.ResponseWriter, r *http.Request) {
  if r.Method != "POST" {
    writeErr(w, ErrMethodNotAllowed)
    return
  }
  regId := r.FormValue("reg_id")
  if regId == "" {
    writeErr(w, ErrNoRegId)
    return
  }
  deviceId := r.FormValue("device_id")
  if deviceId == "" {
    writeErr(w, ErrNoDeviceId)
    return
  }
  c := appengine.NewContext(r)
  u := getUser(c)
  if u == nil {
    writeErr(w, ErrNoLogin)
    return
  }
  if !u.Admin {
    writeErr(w, Err{"You are not an admin.", http.StatusForbidden})
    return
  }

  uKey := ds.NewKey(c, "User", u.ID, 0, nil)
  if err := getOrCreateUser(c, uKey, &User{u.String()}); err != nil {
    writeErr(w, err)
    return
  }

  dKey, err := ds.Put(c, ds.NewIncompleteKey(c, "Door", nil),
      &Door{"Robert's Door", regId, deviceId})
  if err != nil {
    writeErr(w, err)
    return
  }
  if _, err = ds.Put(c, ds.NewIncompleteKey(c, "Access", nil),
      &Access{uKey, dKey, LevelOwner}); err != nil {
    // TODO(robert): Consider fixing with cross entity txn.
    c.Errorf(
        "Created door (%s) but owner access creation failed.", dKey.Encode())
    writeErr(w, err)
    return
  }
}

// Gets the singleton configuration of the door service. If the configuration
// doesn't exist (e.g. new server), a new one is created.
// TODO(robert): Return err instead of nil.
func getConfig(c appengine.Context) *Config {
  k := ds.NewKey(c, "Config", "singleton", 0, nil)
  config := new(Config)
  if err := ds.Get(c, k, config); err != nil {
    if err != ds.ErrNoSuchEntity {
      c.Errorf("Error loading configuration: %s", err.Error())
      return nil
    }
    if _, err := ds.Put(c, k, config); err != nil {
      c.Errorf("Unable to create server config: %s", err.Error())
      return nil
    }
  }

  if config.ApiKey == "" {
    return nil
  }

  return config
}

// Gets user first from cookies, then checks OAuth. If no credentials are
// available, returns nil.
func getUser(c appengine.Context) *user.User {
  u := user.Current(c)
  if u == nil {
    u, _ =
        user.CurrentOAuth(c, "https://www.googleapis.com/auth/userinfo.email");
  }
  return u
}

// Gets a door.
// TODO(robert): Return err instead of nil.
func getDoor(c appengine.Context, k *ds.Key) *Door {
  door := new(Door)
  if err := ds.Get(c, k, door); err != nil {
    if err != ds.ErrNoSuchEntity {
      c.Errorf("Error loading door: %s", err.Error())
    }
    return nil
  }
  return door
}

func getOrCreateUser(c appengine.Context, k *ds.Key, user *User) error {
  err := ds.Get(c, k, user);
  if err == ds.ErrNoSuchEntity {
    _, err = ds.Put(c, k, user)
  }
  return err
}

// Writes an HTTP error to the writer.
func writeErr(w http.ResponseWriter, err error) {
  if e, ok := err.(*Err); ok {
    http.Error(w, e.Message, e.Status)
  } else {
    http.Error(w, err.Error(), http.StatusInternalServerError)
  }
}
