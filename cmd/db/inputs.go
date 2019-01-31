package main

// RouteJSON represents returned object from routes api
type RouteJSON struct {
	Data []route `json:"aaData"`
}

// ClimbJSON represents returned object from routes api
type ClimbJSON struct {
	Data []climb `json:"aaData"`
}
