package main

func main() {

	config := LoadConfiguration("./config.json")

	app := App{}
	app.Initialize(config)

}
