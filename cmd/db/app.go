package main

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/go-sql-driver/mysql" // _ alias for package qualifier so that exported names aren't visible in code
	"github.com/gorilla/mux"
)

// App represents REST API
type App struct {
	Router *mux.Router
	DB     *sql.DB
}

// Initialize initializes the database and pulls available data in from outside sources.
func (a *App) Initialize(config Config) {
	// returns a handle (*sql.DB) for the database.
	db, err := sql.Open("mysql", fmt.Sprintf("%s:%s@tcp(127.0.0.1:3306)/%s", config.Database.Username, config.Database.Password, config.Database.DBName))
	checkErr(err)
	a.DB = db

	// Open doesn't open a connection. Validate DSN data:
	err = db.Ping()
	checkErr(err)

	initClimbDB(a.DB)

	//add routes
	addRoutes(a.DB, config)

	//add climbers
	addClimbersAndClimbs(a.DB, config)

	// a.Router = mux.NewRouter()
	// a.Router.HandleFunc("/query", a.rawQueryHandler).Methods("POST")

	runRawQuery(a.DB, "SELECT * FROM climbdb.attempt_types")

	// defer closing the database connection
	defer db.Close()
}

// Run starts an HTTP server.
func (a *App) Run(addr string) {}

func checkErr(err error) {
	if err != nil {
		log.Fatal(err)
	}
}
