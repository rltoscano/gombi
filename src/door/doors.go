package door

import(
  "appengine"
  ds "appengine/datastore"
  "appengine/user"
  "net/http"
)

// Door struct used in API responses. Same as Door with an extra key field.
type ApiDoor struct {
  Key string `json:"key"`
  DisplayName string `json:"displayName"`
  RegId string `json:"regId"`
  DevId string `json:"devId"`
}

func handleDoors(r *http.Request, c appengine.Context, u *user.User, m string) (
    interface{}, error) {
  if        m == "GET"    { return listDoors(r, c, u)
  } else if m == "POST"   { return insertDoor(r, c, u)
  } else if m == "PUT"    { return updateDoor(r, c, u)
  } else if m == "DELETE" { return deleteDoor(r, c, u)
  } else                  { return nil, ErrMethodNotAllowed }
}

// API that lists the doors the user has some permission to. Can be filtered by
// permission level by using the "level" parameter.
func listDoors(
    r *http.Request, c appengine.Context, u *user.User) (*[]ApiDoor, error) {
  lvl := r.FormValue("level")
  devId := r.FormValue("devId")
  q := ds.NewQuery("Permission").
      Filter("userKey=", ds.NewKey(c, "User", u.ID, 0, nil))
  if lvl != "" {
    q = q.Filter("level=", lvl)
  }
  if devId != "" {
    q = q.Filter("devId=", devId)
  }
  permissions := []Permission{}
  if _, err := q.GetAll(c, &permissions); err != nil {
    return nil, err
  }
  doorKeys := make([]*ds.Key, len(permissions))
  apiDoors := make([]ApiDoor, len(permissions))
  for i, p := range permissions {
    doorKeys[i] = p.DoorKey
    apiDoors[i].Key = p.DoorKey.Encode()
  }
  doors := make([]Door, len(permissions))
  if err := ds.GetMulti(c, doorKeys, doors); err != nil {
    return nil, err
  }
  for i, d := range doors {
    apiDoors[i].DisplayName = d.DisplayName
    // Add fields only visible by owner.
    if permissions[i].Level >= LevelOwner {
      apiDoors[i].RegId = d.RegId
      apiDoors[i].DevId = d.DevId
    }
  }
  return &apiDoors, nil
}

// API to insert a new door. Requires "displayName", "regId" and "devId" of the
// device. Only admins can execute this API at the moment.
func insertDoor(
    r *http.Request, c appengine.Context, u *user.User) (*[]ApiDoor, error) {
  displayName := r.FormValue("displayName")
  if displayName == "" {
    return nil, Err{"'displayName' required.", http.StatusBadRequest}
  }
  regId := r.FormValue("regId")
  if regId == "" {
    return nil, Err{"'regId' required.", http.StatusBadRequest}
  }
  devId := r.FormValue("devId")
  if devId == "" {
    return nil, Err{"'devId' required.", http.StatusBadRequest}
  }
  if !u.Admin {
    return nil, Err{"You are not an admin.", http.StatusForbidden}
  }

  // TODO(robert): Wrap these in a txn.

  uKey := ds.NewKey(c, "User", u.ID, 0, nil)
  if err := getOrCreateUser(c, uKey, &User{u.String()}); err != nil {
    return nil, err
  }

  d := Door{displayName, regId, devId}
  dKey, err := ds.Put(c, ds.NewIncompleteKey(c, "Door", nil), &d)
  if err != nil {
    return nil, err
  }

  if _, err = ds.Put(c, ds.NewIncompleteKey(c, "Permission", nil),
      &Permission{uKey, dKey, LevelOwner}); err != nil {
    c.Errorf(
        "Created door (%s) but owner permission creation failed.", dKey.Encode())
    return nil, err
  }

  return &[]ApiDoor{ApiDoor{dKey.Encode(), d.DisplayName, d.RegId, d.DevId}},
      nil
}

// API to update the display name and registration ID of a door. Only the owner
// of the door can execute this API.
var (
  ErrDoorUpdateForbidden = Err{"Door update forbidden.", http.StatusForbidden}
)
func updateDoor(
    r *http.Request, c appengine.Context, u *user.User) (*[]ApiDoor, error) {
  k, err := ds.DecodeKey(r.FormValue("key"))
  if err != nil {
    return nil, ErrNoDoorKey
  }

  cnt := 0
  if cnt, err = ds.NewQuery("Permission").
      Filter("userKey=", ds.NewKey(c, "User", u.ID, 0, nil)).
      Filter("doorKey=", k).
      Filter("level=", LevelOwner).
      Count(c); err != nil {
    return nil, err
  }
  if cnt == 0 {
    return nil, ErrDoorUpdateForbidden
  }

  d := new(Door)
  err = ds.RunInTransaction(c, func(c appengine.Context) error {
    if err = ds.Get(c, k, d); err != nil {
      return err
    }

    displayName := r.FormValue("displayName")
    if displayName != "" {
      d.DisplayName = displayName
    }
    regId := r.FormValue("regId")
    if regId != "" {
      d.RegId = regId
    }

    _, err = ds.Put(c, k, &d)
    return err
  }, nil)

  return &[]ApiDoor{ApiDoor{k.Encode(), d.DisplayName, d.RegId, d.DevId}}, err
}

func deleteDoor(
    r *http.Request, c appengine.Context, u *user.User) (*[]ApiDoor, error) {
  c.Infof(r.FormValue("key"))
  k, err := ds.DecodeKey(r.FormValue("key"))
  if err != nil {
    return nil, Err{"'key' required.", http.StatusBadRequest}
  }

  // Verify caller is door owner.
  cnt := 0
  if cnt, err = ds.NewQuery("Permission").
      Filter("userKey=", ds.NewKey(c, "User", u.ID, 0, nil)).
      Filter("doorKey=", k).
      Filter("level=", LevelOwner).
      Count(c); err != nil {
    return nil, err
  }
  if cnt == 0 {
    return nil, Err{"Either the door doesn't exist, or you are not an owner",
        http.StatusForbidden}
  }

  // Get all permissions to the door.
  var permissionKeys []*ds.Key
  if permissionKeys, err = ds.NewQuery("Permission").
      Filter("doorKey=", k).
      KeysOnly().
      GetAll(c, nil); err != nil {
    return nil, err
  }

  err = ds.RunInTransaction(c, func(c appengine.Context) error {
    // Delete all permissions to the door.
    if err = ds.DeleteMulti(c, permissionKeys); err != nil {
      return err
    }

    // Delete door.
    return ds.Delete(c, k)
  }, &ds.TransactionOptions{XG: true})

  return &[]ApiDoor{}, err
}
