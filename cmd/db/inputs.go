package main

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"regexp"
	"strings"
	"time"
)

// RouteJSON represents returned object from routes api
type RouteJSON struct {
	Data []route `json:"aaData"`
}

// ClimbJSON represents returned object from routes api
type ClimbJSON struct {
	Data []climb `json:"aaData"`
}

func initClimbDB(db *sql.DB) {

	climbTypes := []climbType{climbType{"Top rope"}, climbType{"Boulder"}}
	for _, climbType := range climbTypes {
		climbType.insert(db)
	}

}

func addRoutes(db *sql.DB, config Config) {
	url := config.DataSource.Routes

	res, err := http.Get(url)
	checkErr(err)

	defer res.Body.Close()

	decoder := json.NewDecoder(res.Body)
	var data RouteJSON
	err = decoder.Decode(&data)
	for _, route := range data.Data {
		// convert grade
		var routeClimbType climbType
		if strings.HasPrefix(route.GradeString, "V") {
			routeClimbType = climbType{"Boulder"}
		} else {
			routeClimbType = climbType{"Top rope"}
		}
		route.routeGrade = grade{route.GradeString, routeClimbType}

		// add grade to database if not present
		route.routeGrade.insert(db)

		// convert setter
		re := regexp.MustCompile(".*>(.*)</a>$")
		route.SetterName = re.FindStringSubmatch(route.SetterName)[1]
		route.routeSetter = setter{route.SetterName}

		// add setter to database if not present
		route.routeSetter.insert(db)

		// convert name
		re = regexp.MustCompile(".*</i>\\s(.*)</a>$")
		route.RouteName = re.FindStringSubmatch(route.RouteName)[1]

		// convert date
		layout := "2006-01-02"
		t, err := time.Parse(layout, route.DateString)
		checkErr(err)

		route.setDate = t

		//load
		route.insert(db)

	}
}

func addClimbersAndClimbs(db *sql.DB, config Config) {
	// loop through user sources
	users := config.DataSource.Users

	for _, user := range users {
		url := user.URL
		name := user.Name

		res, err := http.Get(url)
		checkErr(err)

		defer res.Body.Close()

		decoder := json.NewDecoder(res.Body)
		var data ClimbJSON
		err = decoder.Decode(&data)
		for _, climb := range data.Data {
			// set climber
			climb.climber = climber{name}
			climb.climber.insert(db)

			// convert name
			re := regexp.MustCompile(".*\">(.*)</a>$")
			climb.RouteName = re.FindStringSubmatch(climb.RouteName)[1]
			climb.route = route{}
			climb.route.RouteName = climb.RouteName

			// convert date
			// re = regexp.MustCompile("^(\\d\\d\\d\\d-\\d\\d-\\d\\d)\\s<a href=.*$")
			// climb.DateString = re.FindStringSubmatch(climb.DateString)[1]
			layout := "2006-01-02"
			t, err := time.Parse(layout, climb.DateString)
			checkErr(err)

			climb.climbDate = t

			// get attempt type
			re = regexp.MustCompile("\\<[\\S\\s]+?\\>")
			climb.TypeString = re.ReplaceAllString(climb.TypeString, "")
			climb.attemptType = attemptType{climb.TypeString}
			climb.attemptType.insert(db)

			climb.insert(db)
		}
	}

}
