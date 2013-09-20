package door

import(
  "appengine"
  ds "appengine/datastore"
  "appengine/user"
  "html/template"
  "net/http"
)

// Data given to the Door client template.
type ClientData struct {
  // Whether the user is an admin of the service.
  Admin bool

  // All doors openable by the user.
  Doors []ClientDoor
}

// Door used for rendering in the client.
type ClientDoor struct {
  // Encoded key of the door.
  Key string

  // Display name of the door.
  DisplayName string

  // Display name of the owner of the door.
  OwnerDisplayName string

  // Whether the door is owned by the user.
  Own bool

  // Whether the door is openable by the user.
  Openable bool

  // Users awaiting permission to use the door. Only available to owners.
  PendingUsers []ClientUser

  // Users that can open the door. Only available to owners.
  OpenerUsers []ClientUser
}

// User used for rendering in the client.
type ClientUser struct {
  // Encoded key of the user.
  Key string

  // Human readable name of the user.
  DisplayName string
}

// Web UI client of the door service.
func handleClient(w http.ResponseWriter, r *http.Request) {
  c := appengine.NewContext(r)
  u := user.Current(c)
  if u == nil {
    url, _ := user.LoginURL(c, "/door")
    http.Redirect(w, r, url, http.StatusTemporaryRedirect)
    return
  }

  clientData := ClientData{Admin: u.Admin}

  // Load all the openable doors.
  openerPermissions := []Permission{}
  if _, err := ds.NewQuery("Permission").
      Filter("userKey=", ds.NewKey(c, "User", u.ID, 0, nil)).
      Filter("level>=", LevelOpener).
      GetAll(c, &openerPermissions); err != nil {
    writeErr(w, err, c)
    return
  }
  doorKeys := make([]*ds.Key, len(openerPermissions))
  clientData.Doors = make([]ClientDoor, len(openerPermissions))
  for i, p := range openerPermissions {
    doorKeys[i] = p.DoorKey
    clientData.Doors[i] = ClientDoor{
      Key: p.DoorKey.Encode(),
      Openable: true,
      Own: p.Level == LevelOwner,
    }
  }
  doors := make([]Door, len(clientData.Doors))
  if err := ds.GetMulti(c, doorKeys, doors); err != nil {
    writeErr(w, err, c)
    return
  }

  for i, dKey := range doorKeys {
    clientData.Doors[i].DisplayName = doors[i].DisplayName

    // Load door owner display name.
    p := Permission{}
    if _, err := ds.NewQuery("Permission").
        Filter("doorKey=", dKey).
        Filter("level=", LevelOwner).
        Run(c).
        Next(&p); err != nil {
      if err == ds.Done {
        c.Errorf("Door (%s) has no owner.", dKey.Encode())
      }
      writeErr(w, err, c)
      return
    }
    owner := User{}
    if err := ds.Get(c, p.UserKey, &owner); err != nil {
      if err == ds.ErrNoSuchEntity {
        c.Errorf("Door's (%s) owner (%s) doesn't exist.", dKey.Encode(),
            p.UserKey.Encode())
      }
      writeErr(w, err, c)
      return
    }
    clientData.Doors[i].OwnerDisplayName = owner.DisplayName

    // Load pending users.
    pendingPermissions := []Permission{}
    if _, err := ds.NewQuery("Permission").
        Filter("doorKey=", dKey).
        Filter("level=", LevelPending).
        GetAll(c, &pendingPermissions); err != nil {
      writeErr(w, err, c)
      return
    }
    pendingUserKeys := make([]*ds.Key, len(pendingPermissions))
    clientData.Doors[i].PendingUsers =
        make([]ClientUser, len(pendingPermissions))
    for j, p := range pendingPermissions {
      pendingUserKeys[j] = p.UserKey
      clientData.Doors[i].PendingUsers[j].Key = p.UserKey.Encode()
    }
    if err := ds.GetMulti(c, pendingUserKeys, clientData.Doors[i].PendingUsers);
        err != nil {
      writeErr(w, err, c)
      return
    }

    // Load opener users.
    openerPermissions := []Permission{}
    if _, err := ds.NewQuery("Permission").
        Filter("doorKey=", dKey).
        Filter("level=", LevelOpener).
        GetAll(c, &openerPermissions); err != nil {
      writeErr(w, err, c)
      return
    }
    openerUserKeys := make([]*ds.Key, len(openerPermissions))
    clientData.Doors[i].OpenerUsers = make([]ClientUser, len(openerPermissions))
    for j, p := range openerPermissions {
      openerUserKeys[j] = p.UserKey
      clientData.Doors[i].OpenerUsers[j].Key = p.UserKey.Encode()
    }
    if err := ds.GetMulti(c, openerUserKeys, clientData.Doors[i].OpenerUsers);
        err != nil {
      writeErr(w, err, c)
      return
    }
  }

  tpl, err := template.ParseFiles("templates/door.html")
  if err != nil {
    writeErr(w, err, c)
    return
  }
  if err = tpl.ExecuteTemplate(w, "door", clientData); err != nil {
    c.Errorf("Error while executing door template: %s", err.Error())
    writeErr(w, err, c)
    return
  }
}
