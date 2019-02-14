package main

import (
	"database/sql"
	"errors"
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
	gradeName string
	climbType climbType
}

func (g *grade) insert(db *sql.DB) {
	stmt, err := db.Prepare("INSERT INTO grades(name, climb_type) VALUES(?,(SELECT climb_type_id FROM climb_types WHERE type=?)) ON DUPLICATE KEY UPDATE name=name")
	checkErr(err)

	res, err := stmt.Exec(g.gradeName, g.climbType.typeName)
	logExecStatement(res, err)
}

func (g *grade) get(db *sql.DB) error {
	return errors.New("Not implemented")
}

type route struct {
	RouteName   string `json:"route"`
	grade       grade
	setDate     time.Time
	DateString  string `json:"date"`
	GradeString string `json:"grade"`
	setter      setter
	SetterName  string `json:"setter"`
	color       string
	address     string
	position    string
	isCurrent   bool
}

func (r *route) insert(db *sql.DB) {
	stmt, err := db.Prepare("INSERT INTO routes(name, grade, date, setter, color, route_address, position, is_current) VALUES(?,(SELECT grade_id FROM grades WHERE name=?),?,(SELECT setter_id FROM setters WHERE name=?),?,?,?,?) ON DUPLICATE KEY UPDATE is_current=?, grade=(SELECT grade_id FROM grades WHERE name=?), date=?, setter=(SELECT setter_id FROM setters WHERE name=?), color=?, route_address=?, position=?")
	checkErr(err)

	res, err := stmt.Exec(r.RouteName, r.grade.gradeName, r.setDate, r.setter.name, r.color, r.address, r.position, r.isCurrent, r.isCurrent, r.grade.gradeName, r.setDate, r.setter.name, r.color, r.address, r.position)
	logExecStatement(res, err)
}

func (r *route) get(db *sql.DB) error {
	return errors.New("Not implemented")
}

type climber struct {
	Name string `json:"name"`
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

func getClimbers(db *sql.DB) ([]climber, error) {
	var climbers []climber

	rows, errQuery := db.Query("SELECT name FROM climbdb.climbers;")
	checkErr(errQuery)
	defer rows.Close()

	for rows.Next() {
		var climber climber
		var name string
		err := rows.Scan(&name)
		checkErr(err)
		log.Println(name)

		climber.Name = name

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
