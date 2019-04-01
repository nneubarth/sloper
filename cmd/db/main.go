package main

import (
	"fmt"
	"os"
)

func main() {

	if len(os.Args) != 2 {
		fmt.Printf("usage: %s [configJSON]\n", os.Args[0])
		os.Exit(1)
	}

	configPath := os.Args[1]

	config := LoadConfiguration(configPath)

	app := App{}
	app.Initialize(config)

}
