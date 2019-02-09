package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"strconv"
)

// QueryResult represents the results of a query
type QueryResult struct {
	Columns []string        `json:"columns"`
	Data    [][]interface{} `json:"data"`
}

type queryRequest struct {
	QueryString string `json:"queryString"`
}

func (a *App) rawQueryHandler(w http.ResponseWriter, r *http.Request) {
	var queryRequest queryRequest
	decoder := json.NewDecoder(r.Body)

	if err := decoder.Decode(&queryRequest); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}
	defer r.Body.Close()

	res, err := runRawQuery(a.DB, queryRequest.QueryString)

	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	log.Print(res)
	respondWithJSON(w, http.StatusOK, res)

}

func runRawQuery(db *sql.DB, queryString string) (QueryResult, error) {

	var result QueryResult

	rows, errQuery := db.Query(queryString)
	checkErr(errQuery)
	defer rows.Close()

	colNames, err := rows.Columns()
	checkErr(err)
	var data [][]interface{}
	result.Columns = colNames

	valPtrs := make([]interface{}, len(colNames))
	for i := range colNames {
		valPtrs[i] = new(sql.RawBytes)
	}

	for rows.Next() {
		err = rows.Scan(valPtrs...)
		checkErr(err)
		dataRow := make([]interface{}, len(colNames))

		for i := range colNames {
			rawBytes := *valPtrs[i].(*sql.RawBytes)
			byteSlice := []uint8(rawBytes)
			stringResult := string(byteSlice)
			numResult, err := strconv.ParseInt(stringResult, 10, 64)
			if err == nil {
				dataRow[i] = numResult
			} else {
				dataRow[i] = stringResult
			}
		}

		data = append(data, dataRow)

		// for i, val := range data[len(data)-1] {
		// 	fmt.Println("name:", colNames[i], "value type:", reflect.TypeOf(val), "value:", val)
		// }

	}

	result.Data = data
	// var unmResult QueryResult
	// response, _ := json.Marshal(result)
	// json.Unmarshal(response, &unmResult)

	// fmt.Println(unmResult)

	return result, errQuery
}

func (a *App) getClimbers(w http.ResponseWriter, r *http.Request) {

	res, err := getClimbers(a.DB)

	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, res)
}

func respondWithError(w http.ResponseWriter, code int, message string) {
	respondWithJSON(w, code, map[string]string{"error": message})
}

func respondWithJSON(w http.ResponseWriter, code int, payload interface{}) {
	response, _ := json.Marshal(payload)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	w.Write(response)
}
