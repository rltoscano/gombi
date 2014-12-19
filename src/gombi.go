package gombi

import(
  "src/door"
  "src/straph"
)

// TODO(robert): Add XSRF protection with XSRF token.

// Main entry point.
func init() {
  door.RegisterHandlers()
  straph.RegisterHandlers()
}