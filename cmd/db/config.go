package main

import (
	"encoding/json"
	"log"
	"os"
)

// Config represents the configuration parameters for package.
type Config struct {
	Database struct {
		Username string `json:"username"`
		Password string `json:"password"`
		DBName   string `json:"dbname"`
	} `json:"database"`
	DataSource struct {
		Routes string `json:"routes"`
		Users  []User `json:"users"`
		Route  string `json:"route"`
	} `json:"datasource"`
}

// User represents a user of the service.
type User struct {
	Name string `json:"name"`
	URL  string `json:"url"`
}

// LoadConfiguration creates a Config from json config file.
func LoadConfiguration(file string) Config {
	var config Config
	configFile, err := os.Open(file)
	defer configFile.Close()
	if err != nil {
		log.Fatal(err)
	}
	jsonParser := json.NewDecoder(configFile)
	jsonParser.Decode(&config)
	return config
}
