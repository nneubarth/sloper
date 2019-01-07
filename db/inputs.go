package main

// RouteJSON represents returned object from routes api
type RouteJSON struct {
	Data []Route `json:"aaData"`
}

// ClimbJSON represents returned object from routes api
type ClimbJSON struct {
	Data []Climb `json:"aaData"`
}
