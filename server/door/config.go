package door;

import (
  "appengine"
  ds "appengine/datastore"
  "appengine/user"
  "net/http"
)

// API that updates the singleton configuration. Only accessible by admins.
func handleConfig(
    r *http.Request, c appengine.Context, u *user.User) (interface{}, error) {
  if !u.Admin {
    return nil, Err{"Forbidden", http.StatusForbidden}
  }
  if r.Method != "POST" {
    return nil, ErrMethodNotAllowed
  }
  apiKey := r.FormValue("apiKey")
  if apiKey == "" {
    return nil, Err{"'apiKey' required.", http.StatusBadRequest}
  }

  cfg := Config{apiKey}
  _, err := ds.Put(c, ds.NewKey(c, "Config", "singleton", 0, nil), &cfg)
  return &cfg, err
}
