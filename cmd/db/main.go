package main

import "os"

func main() {

	configPath := os.Args[1]

	config := LoadConfiguration(configPath)

	app := App{}
	app.Initialize(config)

}
