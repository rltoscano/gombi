package door

import(
  "appengine"
  ds "appengine/datastore"
  "appengine/urlfetch"
  "appengine/user"
  "github.com/alexjlockwood/gcm"
  "net/http"
)

// API to open a door. Requires "doorKey" of the door to open.
// TODO(robert): Protect against XSRF attack.
var (
  ErrNoOpenerPermission = Err{
      "Either the door doesn't exist or you don't have opener permission.",
      http.StatusBadRequest}
  ErrNoConfig =
      Err{"Service config uninitialized.", http.StatusServiceUnavailable}
)
func handleOpen(r *http.Request, c appengine.Context, u *user.User) (
    interface{}, error) {
  if r.Method != "POST" {
    return nil, ErrMethodNotAllowed
  }
  k, err := ds.DecodeKey(r.FormValue("doorKey"))
  if err != nil {
    return nil, ErrNoDoorKey
  }

  cnt := 0
  if cnt, err = ds.NewQuery("Permission").
      Filter("userKey=", ds.NewKey(c, "User", u.ID, 0, nil)).
      Filter("doorKey=", k).
      Filter("level>=", LevelOpener).
      Count(c); err != nil {
    return nil, err
  }
  if cnt == 0 {
    return nil, ErrNoOpenerPermission
  }

  config := Config{}
  if err = ds.Get(c, ds.NewKey(c, "Config", "singleton", 0, nil), &config);
      err != nil {
    if err == ds.ErrNoSuchEntity {
      err = ErrNoConfig
    }
    return nil, err
  }
  if config.ApiKey == "" {
    return nil, ErrNoConfig
  }

  door := Door{}
  if err = ds.Get(c, k, &door); err != nil {
    if err == ds.ErrNoSuchEntity {
      err = ErrNoOpenerPermission
    }
    return nil, err
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
    return nil, Err{"Failed to open door.", http.StatusInternalServerError}
  }

  return response, nil
}
