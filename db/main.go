package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"regexp"
	"strings"
	"time"

	_ "github.com/go-sql-driver/mysql" // _ alias for package qualifier so that exported names aren't visible in code
)

func main() {

	config := LoadConfiguration("./config.json")

	// returns a handle (*sql.DB) for the database.
	db, err := sql.Open("mysql", fmt.Sprintf("%s:%s@tcp(127.0.0.1:3306)/%s", config.Database.Username, config.Database.Password, config.Database.DBName))
	if err != nil {
		log.Fatal(err)
	}

	// Open doesn't open a connection. Validate DSN data:
	err = db.Ping()
	if err != nil {
		log.Fatal(err)
	}

	initClimbDB(db)

	//add routes
	addRoutes(db, config)

	//add climbers
	addClimbersAndClimbs(db, config)

	// defer closing the database connection
	defer db.Close()
}

func addClimbersAndClimbs(db *sql.DB, config Config) {
	// loop through user sources
	users := config.DataSource.Users

	for _, user := range users {
		url := user.URL
		name := user.Name

		res, err := http.Get(url)
		if err != nil {
			log.Fatal(err)
		}
		defer res.Body.Close()

		// climbJSONFile, err := os.Open("./nnclimbs.json")
		// defer climbJSONFile.Close()
		// if err != nil {
		// 	fmt.Println(err.Error())
		// }
		// decoder := json.NewDecoder(climbJSONFile)
		// name := ""

		decoder := json.NewDecoder(res.Body)
		var data ClimbJSON
		err = decoder.Decode(&data)
		for _, climb := range data.Data {
			// set climber
			climb.climber = Climber{name}
			insertStatement(db, &climb.climber)

			// convert name
			re := regexp.MustCompile(".*\">(.*)</a>$")
			climb.RouteName = re.FindStringSubmatch(climb.RouteName)[1]
			climb.route = Route{}
			climb.route.RouteName = climb.RouteName

			// convert date
			// re = regexp.MustCompile("^(\\d\\d\\d\\d-\\d\\d-\\d\\d)\\s<a href=.*$")
			// climb.DateString = re.FindStringSubmatch(climb.DateString)[1]
			layout := "2006-01-02"
			t, err := time.Parse(layout, climb.DateString)
			if err != nil {
				log.Fatal(err)
			}
			climb.climbDate = t

			// get attempt type
			re = regexp.MustCompile("\\<[\\S\\s]+?\\>")
			climb.TypeString = re.ReplaceAllString(climb.TypeString, "")
			climb.attemptType = AttemptType{climb.TypeString}
			insertStatement(db, &climb.attemptType)

			insertStatement(db, &climb)

		}
	}

}

func addRoutes(db *sql.DB, config Config) {
	url := config.DataSource.Routes

	res, err := http.Get(url)
	if err != nil {
		log.Fatal(err)
	}
	defer res.Body.Close()

	// routeJSONFile, err := os.Open("./routes.json")
	// defer routeJSONFile.Close()
	// if err != nil {
	// 	fmt.Println(err.Error())
	// }
	// decoder := json.NewDecoder(routeJSONFile)

	decoder := json.NewDecoder(res.Body)
	var data RouteJSON
	err = decoder.Decode(&data)
	for _, route := range data.Data {
		// convert grade
		var routeClimbType ClimbType
		if strings.HasPrefix(route.GradeString, "V") {
			routeClimbType = ClimbType{"Boulder"}
		} else {
			routeClimbType = ClimbType{"Top rope"}
		}
		route.routeGrade = Grade{route.GradeString, routeClimbType}

		// add grade to database if not present
		insertStatement(db, &route.routeGrade)

		// convert setter
		re := regexp.MustCompile(".*>(.*)</a>$")
		route.SetterName = re.FindStringSubmatch(route.SetterName)[1]
		route.routeSetter = Setter{route.SetterName}

		// add setter to database if not present
		insertStatement(db, &route.routeSetter)

		// convert name
		re = regexp.MustCompile(".*</i>\\s(.*)</a>$")
		route.RouteName = re.FindStringSubmatch(route.RouteName)[1]

		// convert date
		layout := "2006-01-02"
		t, err := time.Parse(layout, route.DateString)
		if err != nil {
			log.Fatal(err)
		}
		route.setDate = t

		//load
		insertStatement(db, &route)

	}
}

func initClimbDB(db *sql.DB) {

	// attemptTypes := []AttemptType{AttemptType{"Onsight send"},
	// 	AttemptType{"Send"},
	// 	AttemptType{"Completed with rest"},
	// 	AttemptType{"Attempted"}}
	// for _, attemptType := range attemptTypes {
	// 	insertStatement(db, &attemptType)
	// }

	climbTypes := []ClimbType{ClimbType{"Top rope"}, ClimbType{"Boulder"}}
	for _, climbType := range climbTypes {
		insertStatement(db, &climbType)
	}

}

func insertStatement(db *sql.DB, row TableRow) {
	stmt, err := db.Prepare(row.getInsertStatement())
	if err != nil {
		log.Fatal(err)
	}

	res, err := row.execStatement(stmt)
	if err != nil {
		log.Fatal(err)
	}

	lastID, err := res.LastInsertId()
	if err != nil {
		log.Fatal(err)
	}

	rowCnt, err := res.RowsAffected()
	if err != nil {
		log.Fatal(err)
	}

	log.Printf("ID = %d, affected = %d\n", lastID, rowCnt)
}
