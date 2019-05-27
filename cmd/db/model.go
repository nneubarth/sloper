package main

import (
	"database/sql"
	"errors"
	"fmt"
	"log"
	"time"
)

func logExecStatement(result sql.Result, err error) {
	checkErr(err)

	lastID, err := result.LastInsertId()
	checkErr(err)

	rowCnt, err := result.RowsAffected()
	checkErr(err)

	log.Printf("ID = %d, affected = %d\n", lastID, rowCnt)

}

type attemptType struct {
	typeName string
}

func (at *attemptType) insert(db *sql.DB) {
	stmt, err := db.Prepare("INSERT INTO attempt_types(type) VALUES(?) ON DUPLICATE KEY UPDATE type=type")
	checkErr(err)

	res, err := stmt.Exec(at.typeName)
	logExecStatement(res, err)
}

func (at *attemptType) get(db *sql.DB) error {
	return errors.New("Not implemented")
}

type climbType struct {
	typeName string
}

func (ct *climbType) insert(db *sql.DB) {
	stmt, err := db.Prepare("INSERT INTO climb_types(type) VALUES(?) ON DUPLICATE KEY UPDATE type=type")
	checkErr(err)

	res, err := stmt.Exec(ct.typeName)
	logExecStatement(res, err)
}

func (ct *climbType) get(db *sql.DB) error {
	return errors.New("Not implemented")
}

type grade struct {
	name      string
	climbType climbType
	GradeName string `json:"grade"`
	TypeName  string `json:"type"`
}

func (g *grade) insert(db *sql.DB) {
	stmt, err := db.Prepare("INSERT INTO grades(name, climb_type) VALUES(?,(SELECT climb_type_id FROM climb_types WHERE type=?)) ON DUPLICATE KEY UPDATE name=name")
	checkErr(err)

	res, err := stmt.Exec(g.name, g.climbType.typeName)
	logExecStatement(res, err)
}

func (g *grade) get(db *sql.DB) error {
	return errors.New("Not implemented")
}

func getCurrentGrades(db *sql.DB) ([]grade, error) {
	var grades []grade

	rows, errQuery := db.Query("SELECT DISTINCT grades.name AS grade, climb_types.type AS type FROM routes INNER JOIN grades ON grades.grade_id=routes.grade LEFT OUTER JOIN climb_types ON grades.climb_type=climb_types.climb_type_id WHERE routes.is_current=1;")
	checkErr(errQuery)
	defer rows.Close()

	for rows.Next() {
		var grade grade
		var name string
		var climbType string

		err := rows.Scan(&name, &climbType)
		checkErr(err)

		grade.GradeName = name
		grade.TypeName = climbType

		log.Println(grade)

		grades = append(grades, grade)
	}

	return grades, errQuery
}

type route struct {
	RouteName   string `json:"route"`
	grade       grade
	setDate     time.Time
	DateString  string `json:"date"`
	GradeString string `json:"grade"`
	setter      setter
	SetterName  string `json:"setter"`
	Color       string `json:"color"`
	address     string
	Position    string `json:"position"`
	isCurrent   bool
	id          int
}

func (r *route) insert(db *sql.DB) {
	stmt, err := db.Prepare("INSERT INTO routes(name, grade, date, setter, color, route_address, is_current) VALUES(?,(SELECT grade_id FROM grades WHERE name=?),?,(SELECT setter_id FROM setters WHERE name=?),?,?,?) ON DUPLICATE KEY UPDATE is_current=?, grade=(SELECT grade_id FROM grades WHERE name=?), date=?, setter=(SELECT setter_id FROM setters WHERE name=?), color=?, route_address=?")
	checkErr(err)

	res, err := stmt.Exec(r.RouteName, r.grade.name, r.setDate, r.setter.name, r.Color, r.address, r.isCurrent, r.isCurrent, r.grade.name, r.setDate, r.setter.name, r.Color, r.address)
	logExecStatement(res, err)
}

func (r *route) updateRoutePosition(db *sql.DB) {
	stmt, err := db.Prepare("UPDATE routes SET position=? WHERE route_id=?")
	checkErr(err)

	res, err := stmt.Exec(r.Position, r.id)
	logExecStatement(res, err)
}

func (r *route) get(db *sql.DB) error {
	return errors.New("Not implemented")
}

func getRoutesWithoutPosition(db *sql.DB) ([]route, error) {
	var routes []route

	rows, errQuery := db.Query("SELECT route_id,route_address FROM routes WHERE position IS NULL AND is_current=1;")
	checkErr(errQuery)
	defer rows.Close()

	for rows.Next() {
		var route route
		var id int
		var address string

		err := rows.Scan(&id, &address)
		checkErr(err)

		route.address = address
		route.id = id

		log.Printf("No position found for id: %d ", id)

		routes = append(routes, route)
	}

	return routes, errQuery
}

func getCurrentRoutes(db *sql.DB) ([]route, error) {
	var routes []route

	rows, errQuery := db.Query("SELECT routes.name AS name, grades.name AS grade, routes.date AS date, setters.name AS setter, routes.color AS color, routes.position AS position FROM routes INNER JOIN grades ON grades.grade_id=routes.grade INNER JOIN setters ON setters.setter_id=routes.setter WHERE routes.is_current=1;")
	checkErr(errQuery)
	defer rows.Close()

	for rows.Next() {
		var route route
		var name string
		var gradeName string
		var setterName string
		var color string
		var position string
		var date string

		err := rows.Scan(&name, &gradeName, &date, &setterName, &color, &position)
		checkErr(err)

		route.RouteName = name
		route.GradeString = gradeName
		route.SetterName = setterName
		route.Color = color
		route.Position = position
		route.DateString = date

		log.Println(route)

		routes = append(routes, route)
	}

	return routes, errQuery
}

type climber struct {
	Name string `json:"name"`
	ID   int    `json:"ID"`
}

func (c *climber) insert(db *sql.DB) {
	stmt, err := db.Prepare("INSERT INTO climbers(name) VALUES(?) ON DUPLICATE KEY UPDATE name=name")
	checkErr(err)

	res, err := stmt.Exec(c.Name)
	logExecStatement(res, err)
}

func (c *climber) get(db *sql.DB) error {
	return errors.New("Not implemented")
}

func (c *climber) getClimbs(db *sql.DB) ([]climb, error) {
	var climbs []climb

	statement := fmt.Sprintf("SELECT climbs.date AS date, routes.name AS name, grades.name AS grade, setters.name AS setter, attempt_types.type AS type FROM climbs INNER JOIN routes ON climbs.route=routes.route_id INNER JOIN grades ON routes.grade=grades.grade_id INNER JOIN setters ON setters.setter_id=routes.setter INNER JOIN attempt_types ON climbs.attempt = attempt_types.attempt_type_id WHERE climbs.climber=%d;", c.ID)
	rows, errQuery := db.Query(statement)
	checkErr(errQuery)
	defer rows.Close()

	for rows.Next() {
		var climb climb
		var date string
		var name string
		var grade string
		var setter string
		var attemptType string
		err := rows.Scan(&date, &name, &grade, &setter, &attemptType)
		checkErr(err)

		climb.RouteName = name
		climb.DateString = date
		climb.GradeString = grade
		climb.SetterName = setter
		climb.TypeString = attemptType

		climbs = append(climbs, climb)
	}

	return climbs, errQuery
}

func getClimbers(db *sql.DB) ([]climber, error) {
	var climbers []climber

	rows, errQuery := db.Query("SELECT climber_id, name FROM climbers;")
	checkErr(errQuery)
	defer rows.Close()

	for rows.Next() {
		var climber climber
		var name string
		var id int
		err := rows.Scan(&id, &name)
		checkErr(err)
		log.Println(name)

		climber.Name = name
		climber.ID = id

		climbers = append(climbers, climber)
	}

	return climbers, errQuery
}

type setter struct {
	name string
}

func (s *setter) insert(db *sql.DB) {
	stmt, err := db.Prepare("INSERT INTO setters(name) VALUES(?) ON DUPLICATE KEY UPDATE name=name")
	checkErr(err)

	res, err := stmt.Exec(s.name)
	logExecStatement(res, err)
}

func (s *setter) get(db *sql.DB) error {
	return errors.New("Not implemented")
}

type climb struct {
	climber     climber
	climbDate   time.Time
	route       route
	attemptType attemptType
	RouteName   string `json:"route"`
	DateString  string `json:"date"`
	TypeString  string `json:"type"`
	GradeString string `json:"grade"`
	SetterName  string `json:"setter"`
}

func (c *climb) insert(db *sql.DB) {
	stmt, err := db.Prepare(`INSERT INTO climbs(climber,date,route,attempt) VALUES(
		(SELECT climber_id FROM climbers WHERE name=?),
		?,
		(SELECT route_id FROM routes WHERE name=?),
		(SELECT attempt_type_id FROM attempt_types WHERE type=?)) ON DUPLICATE KEY UPDATE climber=climber`)
	checkErr(err)

	res, err := stmt.Exec(c.climber.Name, c.climbDate, c.route.RouteName, c.attemptType.typeName)
	logExecStatement(res, err)
}

func (c *climb) get(db *sql.DB) error {
	return errors.New("Not implemented")
}
