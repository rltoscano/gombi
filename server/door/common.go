package door

import (
  "appengine"
  ds "appengine/datastore"
  "appengine/user"
  "encoding/json"
  "fmt"
  "net/http"
)

func RegisterHandlers() {
  http.HandleFunc("/door", handleClient)
  http.Handle("/api/open", ApiHandler{handleOpen})
  http.Handle("/api/doors", ApiHandler{handleDoors})
  http.Handle("/api/permissions", ApiHandler{handlePermissions})
  http.Handle("/api/config", ApiHandler{handleConfig})
}

type ApiHandlerFunc func(*http.Request, appengine.Context, *user.User) (
    interface{}, error)

type ApiHandler struct {
  ApiFunc ApiHandlerFunc
}

const (
  oauthScope = "https://www.googleapis.com/auth/userinfo.email"
)

func (h ApiHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
  c := appengine.NewContext(r)
  u := user.Current(c)
  if u == nil {
    u, _ = user.CurrentOAuth(c, oauthScope);
  }
  if u == nil {
    writeErr(w, ErrNoLogin, c)
    return
  }
  objs, err := h.ApiFunc(r, c, u)
  if err != nil {
    writeErr(w, err, c)
    return
  }
  w.Header().Set("Content-type", "text/json; charset=utf-8")
  jsonEncoder := json.NewEncoder(w)
  jsonEncoder.Encode(objs)
}

// Common externally facing errors.
var (
  ErrMethodNotAllowed = Err{"Method not allowed.", http.StatusMethodNotAllowed}
  ErrNoLogin = Err{"Login required.", http.StatusForbidden}
  ErrNoUserKey = Err{"'userKey' required.", http.StatusBadRequest}
  ErrNoDoorKey = Err{"'doorKey' required.", http.StatusBadRequest}
)

// Service configuration information. Singleton object.
type Config struct {
  // API key used when contacting GCM service.
  ApiKey string `datastore:"apiKey,noindex" json:"apiKey"`
}

// Door. Currently, this is a singleton object in the database.
type Door struct {
  DisplayName string `datastore:"displayName,noindex"`

  // GCM registration ID of the door device. Should be updated by the device
  // if the registration ID ever changes.
  RegId string `datastore:"regId"`

  // ID of the device. Used by a device to disambiguate it from other devices
  // the user might own.
  DevId string `datastore:"devId"`
}

// A user of this service.
type User struct {
  DisplayName string `datastore:",noindex"`
}

// A user's permission on a specific door.
type Permission struct {
  UserKey *ds.Key `datastore:"userKey" json:"userKey"`
  DoorKey *ds.Key `datastore:"doorKey" json:"doorKey"`
  Level int `datastore:"level" json:"level"`
}

// The following permission levels are concentric (e.g. OWNER has OPENER
// privledges).
const (
  LevelPending int = iota // Has no access.
  LevelOpener      = iota // Can open the door.
  LevelOwner       = iota // Can update properties of the door.
)

// Error that will be returned to clients.
type Err struct {
  Message string
  Status int
}

func (e Err) Error() string {
  return fmt.Sprintf("%s Code: %d", e.Message, e.Status)
}

func getOrCreateUser(c appengine.Context, k *ds.Key, u *User) error {
  err := ds.Get(c, k, u);
  if err == ds.ErrNoSuchEntity {
    _, err = ds.Put(c, k, u)
  }
  return err
}

func writeErr(w http.ResponseWriter, err error, c appengine.Context) {
  switch err := err.(type) {
  case Err:
    c.Infof("Api failure: %d %s", err.Status, err.Message)
    http.Error(w, err.Message, err.Status)
  default:
    c.Errorf("Unexpected error: %s", err.Error())
    http.Error(w, err.Error(), http.StatusInternalServerError)
  }
}
