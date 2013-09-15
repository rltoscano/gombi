package gombi

import(
  "appengine"
  "appengine/datastore"
  "appengine/urlfetch"
  "appengine/user"
  "encoding/json"
  "github.com/alexjlockwood/gcm"
  "html/template"
  "net/http"
)

// TODO(robert): Create an "access" table that maps users to doors and contains
// the permissions each user has for a door.
// TODO(robert): Add ability to revoke access.

func RegisterDoorHandlers() {
  http.HandleFunc("/door", handleDoorClient)
  http.HandleFunc("/api/door/open", handleApiDoorOpen)
  http.HandleFunc("/api/door/join", handleApiDoorJoin)
  http.HandleFunc("/api/door/authorize", handleApiDoorAuthorize)
  http.HandleFunc("/api/door/create", handleApiDoorCreate)
}

// Data given to the Door client template.
type DoorClientData struct {
  // Whether the user is authorized to use the service.
  IsAuthorized bool

  // Whether the user is an admin of the service.
  IsAdmin bool

  // Users awaiting permission to use the service. Only available to admins.
  PendingUsers []DoorUser

  // Authorized users of the service. Only available to admins.
  AuthorizedUsers []DoorUser
}

// Door. Currently, this is a singleton object in the database.
type Door struct {
  // Human readable name of the door.
  DisplayName string

  // GCM registration ID of the door device.
  RegId string
}

// A user of this service.
type DoorUser struct {
  // ID of the user.
  Id string

  // Human readable name of the user.
  DisplayName string

  // Whether the user is authorized to use the service.
  IsAuthorized bool
}

// Service configuration information. Singleton object.
type Config struct {
  // API key used when contacting GCM service.
  ApiKey string
}

// Web UI client of the door service.
func handleDoorClient(w http.ResponseWriter, r *http.Request) {
  c := appengine.NewContext(r)
  u := user.Current(c)
  if u == nil {
    url, _ := user.LoginURL(c, "/door")
    http.Redirect(w, r, url, http.StatusTemporaryRedirect)
    return
  }
  doorClientData := DoorClientData{
    IsAuthorized: isAuthorized(c, u),
    IsAdmin: u.Admin,
  }
  if u.Admin {
    q := datastore.NewQuery("DoorUser").Filter("IsAuthorized =", false)
    q.GetAll(c, &doorClientData.PendingUsers)
    q = datastore.NewQuery("DoorUser").Filter("IsAuthorized =", true)
    q.GetAll(c, &doorClientData.AuthorizedUsers)
  }
  tpl, err := template.ParseFiles("templates/door.html")
  if err = tpl.ExecuteTemplate(w, "door", doorClientData); err != nil {
    c.Errorf("Error while executing door template: %s", err.Error())
    http.Error(w, err.Error(), http.StatusInternalServerError)
    return
  }
}

// API to open a door. Currently only opens the singleton door.
// TODO(robert): Protect against XSRF attack.
func handleApiDoorOpen(w http.ResponseWriter, r *http.Request) {
  if r.Method != "POST" {
    http.Error(w, "Method not allowed.", http.StatusMethodNotAllowed)
    return
  }
  c := appengine.NewContext(r)

  u := getUser(c)
  if u == nil || !isAuthorized(c, u) {
    http.Error(w, "Access denied.", http.StatusForbidden)
    return
  }

  config := getConfig(c)
  if config == nil {
    http.Error(
        w, "No server configuration available.", http.StatusServiceUnavailable)
    return
  }

  door := getDoor(c)
  if door == nil {
    http.Error(w, "No door available.", http.StatusServiceUnavailable)
    return
  }

  client := urlfetch.Client(c)
  sender := gcm.Sender{config.ApiKey, client}
  msg := &gcm.Message{
      RegistrationIDs: []string{door.RegId},
      Data: map[string]string{"action":"OPEN"}}

  response, err := sender.SendNoRetry(msg)
  if err != nil {
    c.Errorf("Error while sending message to GCM service: %s", err.Error())
    http.Error(w, "Error while contacting GCM.", http.StatusInternalServerError)
    return
  }

  w.Header().Set("Content-type", "text/json; charset=utf-8")
  jsonEncoder := json.NewEncoder(w)
  jsonEncoder.Encode(response)
}

// API that allows a user to join the service.
// TODO(robert): Protect against XSRF attack.
func handleApiDoorJoin(w http.ResponseWriter, r *http.Request) {
  if r.Method != "POST" {
    http.Error(w, "Method not allowed.", http.StatusMethodNotAllowed)
    return
  }
  c := appengine.NewContext(r)
  u := getUser(c)
  if u == nil {
    http.Error(w, "Access denied.", http.StatusForbidden)
    return
  }

  k := datastore.NewKey(c, "DoorUser", u.ID, 0, nil)
  if err := datastore.Get(c, k, &DoorUser{}); err != nil {
    if err != datastore.ErrNoSuchEntity {
      c.Errorf("Unable to load door user %s: %s", u.String(), err.Error())
      http.Error(w, err.Error(), http.StatusInternalServerError)
      return
    }

    // Create pending door user.
    doorUser := DoorUser{u.ID, u.String(), false}
    if _, err = datastore.Put(c, k, &doorUser); err != nil {
      c.Errorf(
          "Unable to create pending door user %s: %s", u.String(), err.Error())
      http.Error(w, err.Error(), http.StatusInternalServerError)
      return
    }
  } else {
    http.Error(w, "Bad request.", http.StatusBadRequest)
  }
}

// API that authorizes a pending user for the door service. Only available to
// admins. Requires "user_id" parameter that indicates which user to authorize.
func handleApiDoorAuthorize(w http.ResponseWriter, r *http.Request) {
  if r.Method != "POST" {
    http.Error(w, "Method not allowed.", http.StatusMethodNotAllowed)
    return
  }
  c := appengine.NewContext(r)
  u := getUser(c)
  if u == nil || !u.Admin {
    http.Error(w, "Access denied.", http.StatusForbidden)
    return
  }

  pendingDoorUserId := r.FormValue("user_id")
  if pendingDoorUserId == "" {
    http.Error(w, "Missing 'user_id'.", http.StatusBadRequest)
    return
  }

  k := datastore.NewKey(c, "DoorUser", pendingDoorUserId, 0, nil)
  var doorUser DoorUser
  if err := datastore.Get(c, k, &doorUser); err != nil {
    if err != datastore.ErrNoSuchEntity {
      c.Errorf("Error fetching pending door user: %s", err.Error())
      http.Error(w, err.Error(), http.StatusInternalServerError)
    } else {
      c.Errorf(
          "Attempt to grant access to non-existant user. " +
          "Admin (%s) Target (%s)",
          u.String(), pendingDoorUserId)
      http.Error(w, "Bad request.", http.StatusBadRequest)
    }
    return
  }

  if doorUser.IsAuthorized {
    // User is already authorized.
    return
  }

  doorUser.IsAuthorized = true
  if _, err := datastore.Put(c, k, &doorUser); err != nil {
    c.Errorf("Error granting access to %s: %s", pendingDoorUserId, err.Error())
    http.Error(w, err.Error(), http.StatusInternalServerError)
    return
  }
}

// API to create a new door. Only available to admins. Requires "reg_id"
// parameter that contains GCM registration ID.
// TODO(robert): Create a DoorUpdate API to update the Reg ID of a door device.
func handleApiDoorCreate(w http.ResponseWriter, r *http.Request) {
  if r.Method != "POST" {
    http.Error(w, "Method not allowed.", http.StatusMethodNotAllowed)
    return
  }
  c := appengine.NewContext(r)
  u := getUser(c)
  if u == nil || !u.Admin {
    http.Error(w, "Access denied.", http.StatusForbidden)
    return
  }

  regId := r.FormValue("reg_id")
  if regId == "" {
    http.Error(w, "Missing 'reg_id'.", http.StatusBadRequest)
    return
  }

  doorKey := datastore.NewKey(c, "Door", "singleton", 0, nil)
  door := Door{DisplayName: "Robert's Door", RegId: regId}
  if _, err := datastore.Put(c, doorKey, &door); err != nil {
    c.Errorf("Error creating door: %s", err.Error())
    http.Error(w, err.Error(), http.StatusInternalServerError)
    return
  }
}

// Gets the singleton configuration of the door service. If the configuration
// doesn't exist (e.g. new server), a new one is created.
func getConfig(c appengine.Context) *Config {
  configKey := datastore.NewKey(c, "Config", "singleton", 0, nil)
  config := new(Config)
  if err := datastore.Get(c, configKey, config); err != nil {
    if err != datastore.ErrNoSuchEntity {
      c.Errorf("Error loading configuration: %s", err.Error())
      return nil
    }
    if _, err := datastore.Put(c, configKey, config); err != nil {
      c.Errorf("Unable to create server config: %s", err.Error())
      return nil
    }
  }

  if config.ApiKey == "" {
    return nil
  }

  return config
}

// Gets user first from OAuth, then checks cookies. If no credentials are
// available, returns null.
func getUser(c appengine.Context) *user.User {
  u, err :=
      user.CurrentOAuth(c, "https://www.googleapis.com/auth/userinfo.email")
  if err != nil {
    c.Errorf("OAuth authorization unavailable: %s", err.Error())
    u = user.Current(c)
  }
  return u
}

// Gets the singleton door.
// TODO(robert): Add support for multiple door objects.
func getDoor(c appengine.Context) *Door {
  doorKey := datastore.NewKey(c, "Door", "singleton", 0, nil)
  door := new(Door)
  if err := datastore.Get(c, doorKey, door); err != nil {
    if err != datastore.ErrNoSuchEntity {
      c.Errorf("Error loading door: %s", err.Error())
    }
    return nil
  }
  return door
}

// Returns whether the given user is authorized to use the door.
// TODO(robert): Pass in the door to authorize against.
func isAuthorized(c appengine.Context, u *user.User) bool {
  k := datastore.NewKey(c, "DoorUser", u.ID, 0, nil)
  doorUser := DoorUser{}
  if err := datastore.Get(c, k, &doorUser); err != nil {
    if err != datastore.ErrNoSuchEntity {
      c.Errorf("Unable to load door user %s: %s", u.String(), err.Error())
    }
    return false
  }
  return doorUser.IsAuthorized
}
