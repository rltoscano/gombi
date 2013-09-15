package gombi

import(
  "html/template"
  "net/http"
)

// TODO(robert): Add XSRF protection with XSRF token.

// Main entry point.
func init() {
  http.HandleFunc("/", handleRoot)
  RegisterDoorHandlers()
}

func handleRoot(w http.ResponseWriter, r *http.Request) {
  tpl, err := template.ParseFiles("templates/root.html")
  if err != nil {
    http.Error(w, err.Error(), http.StatusInternalServerError)
    return
  }

  w.Header().Set("Content-type", "text/html; charset=utf-8")
  if err = tpl.ExecuteTemplate(w, "root", nil); err != nil {
    http.Error(w, err.Error(), http.StatusInternalServerError)
    return
  }
}
