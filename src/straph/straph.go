package straph

import (
  "appengine"
  "appengine/channel"
  "encoding/json"
  "math"
  "net/http"
  "strconv"
  "strings"
)

func RegisterHandlers() {
  http.HandleFunc("/straph/createchannel", handleCreateChannel)
  http.HandleFunc("/straph/startstream", handleStartStream)
}

type CreateChannelResponse struct {
  Token string `json:"token"`
}

type StartStreamResponse struct {
  Message string `json:"msg"`
}

const (
  BUFFSIZE = 10
)

func handleCreateChannel(w http.ResponseWriter, r *http.Request) {
  c := appengine.NewContext(r)
  token, err := channel.Create(c, "placeholder")
  if err != nil {
    http.Error(w, err.Error(), http.StatusInternalServerError)
  }
  
  w.Header().Set("Content-type", "text/json; charset=utf-8")
  jsonEncoder := json.NewEncoder(w)
  jsonEncoder.Encode(CreateChannelResponse{token})
}

func handleStartStream(w http.ResponseWriter, r *http.Request) {
  c := appengine.NewContext(r)
  buff := make([]string, BUFFSIZE)
  for i := 0; i < 400; i++ {
    f := math.Sin(float64(i) * 8.0 * math.Pi / 100.0) + math.Sin(float64(i) * 4.0 * math.Pi / 100.0)
    f = f / 2
    buff[i % BUFFSIZE] = strconv.FormatFloat(f, 'f', -1, 64)
    if i % BUFFSIZE == BUFFSIZE - 1 {
      msg := strings.Join(buff, ",")
      channel.Send(c, "placeholder", msg)
    }
  }

  jsonEncoder := json.NewEncoder(w)
  jsonEncoder.Encode(StartStreamResponse{"done"})
}