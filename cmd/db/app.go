package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"time"

	_ "github.com/go-sql-driver/mysql" // _ alias for package qualifier so that exported names aren't visible in code
	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
)

var (
	updateChannel chan bool
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
	checkFatalErr(err)
	a.DB = db
	// defer closing the database connection
	defer a.DB.Close()

	// Open doesn't open a connection. Validate DSN data:
	err = db.Ping()
	checkFatalErr(err)

	a.Router = mux.NewRouter()
	a.Router.HandleFunc("/query", a.rawQueryHandler).Methods("POST")
	a.Router.HandleFunc("/climbers", a.getClimbers).Methods("GET")
	a.Router.HandleFunc("/current-routes", a.getCurrentRoutes).Methods("GET")
	a.Router.HandleFunc("/current-grades", a.getCurrentGrades).Methods("GET")

	srv := &http.Server{
		Addr: "0.0.0.0:8080",
		// Good practice to set timeouts to avoid Slowloris attacks.
		WriteTimeout: time.Second * 15,
		ReadTimeout:  time.Second * 15,
		IdleTimeout:  time.Second * 60,
		Handler:      handlers.CORS(handlers.AllowedHeaders([]string{"Content-Type", "Authorization"}), handlers.AllowedMethods([]string{"GET", "POST", "PUT", "HEAD", "OPTIONS"}), handlers.AllowedOrigins([]string{"http://localhost:3000"}))(a.Router), // Pass our instance of gorilla/mux in.
	}

	// Run our server in a goroutine so that it doesn't block.
	go func() {
		if err := srv.ListenAndServe(); err != nil {
			log.Println(err)
		}
	}()

	initialLoadChannel := make(chan bool)
	go performInitialLoad(a.DB, config, initialLoadChannel)

	signalChannel := make(chan os.Signal, 1)
	// We'll accept graceful shutdowns when quit via SIGINT (Ctrl+C)
	// SIGKILL, SIGQUIT or SIGTERM (Ctrl+/) will not be caught.
	signal.Notify(signalChannel, os.Interrupt)

	go func() {
		startPeriodicUpdates(a.DB, config)
	}()

	// Block until we receive our signal.
	<-signalChannel

	log.Println("Waiting for inital load to end...")
	<-initialLoadChannel
	log.Println("Finished initial load.")

	if updateChannel != nil {
		log.Println("Waiting for update to end...")
		<-updateChannel
		log.Println("Finished update.")
	}

	// Create a deadline to wait for.
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*15)
	defer cancel()
	// Doesn't block if no connections, but will otherwise wait
	// until the timeout deadline.
	srv.Shutdown(ctx)

	// Optionally, you could run srv.Shutdown in a goroutine and block on
	// <-ctx.Done() if your application should wait for other services
	// to finalize based on context cancellation.
	log.Println("shutting down")
	os.Exit(0)

}

// Run starts an HTTP server.
func (a *App) Run(addr string) {}

func performInitialLoad(db *sql.DB, config Config, c chan bool) {
	initClimbDB(db)
	//add routes
	addRoutes(db, config)
	//add climbers
	addClimbersAndClimbs(db, config)
	c <- true
}

func updateData(db *sql.DB, config Config, c chan bool) {
	//add routes
	addRoutes(db, config)
	//add climbers
	addClimbersAndClimbs(db, config)
	c <- true
}

func checkFatalErr(err error) {
	if err != nil {
		log.Fatal(err)
	}
}

func checkErr(err error) {
	if err != nil {
		log.Println(err)
	}
}
