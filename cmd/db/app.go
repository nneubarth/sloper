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

// Run starts an HTTP server.
func (a *App) Run(addr string) {}

func runRawQuery(db *sql.DB, queryString string) sql.Result {
	stmt, err := db.Prepare(queryString)

	if err != nil {
		log.Fatal(err)
	}

	res, err := stmt.Exec()
	if err != nil {
		log.Fatal(err)
	}

	return res
}
