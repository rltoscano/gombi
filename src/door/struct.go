package door

import (
  "appengine/datastore"
  "fmt"
)

// Service configuration information. Singleton object.
type Config struct {
  // API key used when contacting GCM service.
  ApiKey string `datastore:",noindex"`
}

// Door. Currently, this is a singleton object in the database.
type Door struct {
  DisplayName string `datastore:",noindex"`

  // GCM registration ID of the door device. Should be updated by the device
  // if the registration ID ever changes.
  RegId string

  // ID of the device. Used by a device to disambiguate it from other devices
  // the user might own.
  DeviceId string
}

// A user of this service.
type User struct {
  DisplayName string `datastore:",noindex"`
}

// A user's access to a specific door.
type Access struct {
  UserKey *datastore.Key
  DoorKey *datastore.Key
  Level int
}

// The following access types are concentric (e.g. OWNER has OPENER privledges).
const (
  LevelPending int = iota // Has no access.
  LevelOpener      = iota // Can open the door.
  LevelOwner       = iota // Can update properties of the door.
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

// Error that will be returned to clients.
type Err struct {
  Message string
  Status int
}

func (e Err) Error() string {
  return fmt.Sprintf("%s Code: %d", e.Message, e.Status)
}
