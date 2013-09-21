package door

import(
  "appengine"
  ds "appengine/datastore"
  "appengine/user"
  "net/http"
  "strconv"
)

func handlePermissions(
    r *http.Request, c appengine.Context, u *user.User) (
    interface{}, error) {
  if        r.Method == "POST"   { return insertPermission(r, c, u)
  } else if r.Method == "PUT"    { return updatePermission(r, c, u)
  } else if r.Method == "DELETE" { return deletePermission(r, c, u)
  } else {                         return nil, ErrMethodNotAllowed }
}

// API that allows a user to apply for permission to use a door. Requires
// "doorKey" of the door to apply for permission to.
// TODO(robert): Protect against XSRF attack.
var (
  // TODO(robert): This error leaks whether a door exists.
  ErrApplyReject = Err{
      "Either you have already applied, already have permission, or the door doesn't exist.",
      http.StatusForbidden}
)
func insertPermission(
    r *http.Request, c appengine.Context, u *user.User) (*[]Permission, error) {
  dKey, err := ds.DecodeKey(r.FormValue("doorKey"))
  if err != nil {
    return nil, ErrNoDoorKey
  }

  uKey := ds.NewKey(c, "User", u.ID, 0, nil)
  cnt := 0
  cnt, err = ds.NewQuery("Permission").
      Filter("userKey=", uKey).
      Filter("doorKey=", dKey).
      Count(c)
  if err != nil {
    return nil, err
  }
  if cnt > 0 {
    return nil, ErrApplyReject
  }

  if err = ds.Get(c, dKey, &Door{}); err != nil {
    if err == ds.ErrNoSuchEntity {
      err = ErrApplyReject
    }
    return nil, err
  }

  // Create user if doesn't already exist.
  if err := getOrCreateUser(c, uKey, &User{u.String()}); err != nil {
    return nil, err
  }

  // Create pending permission to door.
  p := Permission{uKey, dKey, LevelPending}
  if _, err = ds.Put(c, ds.NewIncompleteKey(c, "Permission", nil), &p);
      err != nil {
    return nil, err
  }

  return &[]Permission{p}, nil
}

// API that updates the level of a permission. Only owners can elevate a user's
// permission. Requires "userKey" of the user whose permission to update, the
// "doorKey" of the involved door, and the desired "level" of the permission.
func updatePermission(
    r *http.Request, c appengine.Context, u *user.User) (*[]Permission, error) {
  uKey, err := ds.DecodeKey(r.FormValue("userKey"))
  if err != nil {
    return nil, ErrNoUserKey
  }
  var dKey *ds.Key; dKey, err = ds.DecodeKey(r.FormValue("doorKey"))
  if err != nil {
    return nil, ErrNoDoorKey
  }
  var level int; level, err = strconv.Atoi(r.FormValue("level"))
  if err != nil {
    return nil, Err{"'level' missing or invalid.", http.StatusBadRequest}
  }
  if level != LevelOpener {
    return nil, Err{"Only updating a permission to opener is allowed.",
        http.StatusForbidden}
  }

  // Verify caller is owner of the door.
  p := Permission{}
  cnt := 0
  if cnt, err = ds.NewQuery("Permission").
      Filter("userKey=", ds.NewKey(c, "User", u.ID, 0, nil)).
      Filter("doorKey=", dKey).
      Filter("level=", LevelOwner).
      Count(c); err != nil {
    return nil, err
  }
  if cnt == 0 {
    return nil, Err{
        "Either the door doesn't exist, or you are not an owner on it.",
        http.StatusForbidden}
  }

  p = Permission{}
  k, err := ds.NewQuery("Permission").
      Filter("userKey=", uKey).
      Filter("doorKey=", dKey).
      Run(c).
      Next(&p)
  if err != nil {
    if err == ds.Done {
      err = Err{"User not has asked for permission on this door",
          http.StatusForbidden}
    }
    return nil, err
  }

  p.Level = level
  if _, err = ds.Put(c, k, &p); err != nil {
    return nil, err
  }

  return &[]Permission{p}, nil
}

// Revokes a user's permission to a door. Can only be done by the owner of the
// door or the user whose permission to revoke.
func deletePermission(
    r *http.Request, c appengine.Context, u *user.User) (*[]Permission, error) {
  uKey, err := ds.DecodeKey(r.FormValue("userKey"))
  if err != nil {
    return nil, ErrNoUserKey
  }
  var dKey *ds.Key; dKey, err = ds.DecodeKey(r.FormValue("doorKey"))
  if err != nil {
    return nil, ErrNoDoorKey
  }

  // Verify caller is user in question or door owner.
  callerKey := ds.NewKey(c, "User", u.ID, 0, nil)
  if callerKey != uKey {
    cnt := 0
    if cnt, err = ds.NewQuery("Permission").
        Filter("userKey=", callerKey).
        Filter("doorKey=", dKey).
        Filter("level=", LevelOwner).
        Count(c); err != nil {
      return nil, err
    }
    if cnt == 0 {
      return nil, Err{"Only door owner can delete others' permission.",
          http.StatusForbidden}
    }
  }

  p := Permission{}
  k, err := ds.NewQuery("Permission").
      Filter("userKey=", uKey).
      Filter("doorKey=", dKey).
      Run(c).
      Next(&p)
  if err != nil {
    if err == ds.Done {
      err = Err{"Permission does not exist", http.StatusForbidden}
    }
    return nil, err
  }

  if err = ds.Delete(c, k); err != nil {
    return nil, err
  }

  return &[]Permission{}, nil
}
