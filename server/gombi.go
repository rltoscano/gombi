package main

import (
	"log"
	"net/http"
	"os"
	// "./door"
	// "./straph"
)

// TODO(robert): Add XSRF protection with XSRF token.

// Main entry point.
// func init() {
// 	door.RegisterHandlers()
// 	straph.RegisterHandlers()
// }

func main() {
	http.Handle("/rsc/", http.StripPrefix("/rsc/", http.FileServer(http.Dir("../webapp/rsc"))))
	http.Handle("/", http.FileServer(http.Dir("../webapp/build/es6prod")))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
		log.Printf("Defaulting to port %s", port)
	}

	log.Printf("Listening on port %s", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatal(err)
	}
}
