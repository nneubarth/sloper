package main

import (
	"database/sql"
	"time"
)

//TableRow represents a table row in a mysql database.
type TableRow interface {
	getInsertStatement() string
	execStatement(*sql.Stmt) (res sql.Result, err error)
}

// AttemptType represents a type of attempt on a climb.
type AttemptType struct {
	typeName string
}

func (at *AttemptType) getInsertStatement() string {
	return "INSERT INTO attempt_types(type) VALUES(?) ON DUPLICATE KEY UPDATE type=type"
}

func (at *AttemptType) execStatement(stmt *sql.Stmt) (sql.Result, error) {
	return stmt.Exec(at.typeName)
}

// ClimbType represents a type of climbing.
type ClimbType struct {
	typeName string
}

func (ct *ClimbType) getInsertStatement() string {
	return "INSERT INTO climb_types(type) VALUES(?) ON DUPLICATE KEY UPDATE type=type"
}

func (ct *ClimbType) execStatement(stmt *sql.Stmt) (sql.Result, error) {
	return stmt.Exec(ct.typeName)
}

// Grade represents a climbing grade.
type Grade struct {
	gradeName string
	climbType ClimbType
}

func (g *Grade) getInsertStatement() string {
	return "INSERT INTO grades(name, climb_type) VALUES(?,(SELECT climb_type_id FROM climb_types WHERE type=?)) ON DUPLICATE KEY UPDATE name=name"
}

func (g *Grade) execStatement(stmt *sql.Stmt) (sql.Result, error) {
	return stmt.Exec(g.gradeName, g.climbType.typeName)
}

// Route represents a climbing route or problem.
type Route struct {
	RouteName   string `json:"route"`
	routeGrade  Grade
	setDate     time.Time
	DateString  string `json:"date"`
	GradeString string `json:"grade"`
	routeSetter Setter
	SetterName  string `json:"setter"`
}

func (r *Route) getInsertStatement() string {
	return "INSERT INTO routes(name, grade, date, setter) VALUES(?,(SELECT grade_id FROM grades WHERE name=?),?,(SELECT setter_id FROM setters WHERE name=?)) ON DUPLICATE KEY UPDATE name=name"
}

func (r *Route) execStatement(stmt *sql.Stmt) (sql.Result, error) {
	return stmt.Exec(r.RouteName, r.routeGrade.gradeName, r.setDate, r.routeSetter.name)
}

// Climber represents a user.
type Climber struct {
	name string
}

func (c *Climber) getInsertStatement() string {
	return "INSERT INTO climbers(name) VALUES(?) ON DUPLICATE KEY UPDATE name=name"
}

func (c *Climber) execStatement(stmt *sql.Stmt) (sql.Result, error) {
	return stmt.Exec(c.name)
}

// Setter represents a route/problem setter.
type Setter struct {
	name string
}

func (s *Setter) getInsertStatement() string {
	return "INSERT INTO setters(name) VALUES(?) ON DUPLICATE KEY UPDATE name=name"
}

func (s *Setter) execStatement(stmt *sql.Stmt) (sql.Result, error) {
	return stmt.Exec(s.name)
}

// Climb represents an attempt to climb a route or problem.
type Climb struct {
	climber     Climber
	climbDate   time.Time
	route       Route
	attemptType AttemptType
	RouteName   string `json:"route"`
	DateString  string `json:"date"`
	TypeString  string `json:"type"`
}

func (c *Climb) getInsertStatement() string {
	return `INSERT INTO climbs(climber,date,route,attempt) VALUES(
		(SELECT climber_id FROM climbers WHERE name=?),
		?,
		(SELECT route_id FROM routes WHERE name=?),
		(SELECT attempt_type_id FROM attempt_types WHERE type=?)) ON DUPLICATE KEY UPDATE climber=climber`
}

func (c *Climb) execStatement(stmt *sql.Stmt) (sql.Result, error) {
	return stmt.Exec(c.climber.name, c.climbDate, c.route.RouteName, c.attemptType.typeName)
}
