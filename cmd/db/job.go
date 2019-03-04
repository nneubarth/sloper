package main

import (
	"database/sql"
	"fmt"
	"time"
)

const INTERVAL_PERIOD time.Duration = 24 * time.Hour

const HOUR_TO_TICK int = 23
const MINUTE_TO_TICK int = 30
const SECOND_TO_TICK int = 0

type jobTicker struct {
	timer *time.Timer
}

func getNextTickDuration() time.Duration {
	now := time.Now()
	nextTick := time.Date(now.Year(), now.Month(), now.Day(), HOUR_TO_TICK, MINUTE_TO_TICK, SECOND_TO_TICK, 0, time.Local)
	if nextTick.Before(now) {
		nextTick = nextTick.Add(INTERVAL_PERIOD)
	}
	return nextTick.Sub(time.Now())
}

func createNewJobTicker() jobTicker {
	fmt.Println("Creating new update job...")
	return jobTicker{time.NewTimer(getNextTickDuration())}
}

func (jt jobTicker) updateJobTicker() {
	fmt.Println("Updating job ticker...")
	jt.timer.Reset(getNextTickDuration())
}

func startPeriodicUpdates(db *sql.DB, config Config) {
	jt := createNewJobTicker()
	for {
		<-jt.timer.C

		fmt.Println(time.Now(), "- updating database...")
		updateChannel := make(chan bool)
		go updateData(db, config, updateChannel)

		jt.updateJobTicker()
	}
}
