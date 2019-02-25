import React from "react";

import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import { withStyles } from "@material-ui/core";

const styles = theme => ({
  root: {
    // width: "100%",
    // marginTop: theme.spacing.unit * 3,
    // padding: theme.spacing.unit * 3,
    // overflowX: "auto"
  },
  table: {
    // minWidth: 700
  }
});

function RouteTable(props) {
  const { classes, currentRoutes = [] } = props;

  currentRoutes.sort((a, b) => {
    if (Date.parse(a.date) < Date.parse(b.date)) {
      return 1;
    } else if (Date.parse(a.date) > Date.parse(b.date)) {
      return -1;
    } else {
      return 0;
    }
  });

  return (
    <Paper className={classes.root}>
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell>name</TableCell>
            <TableCell align="right">grade</TableCell>
            <TableCell align="right">date</TableCell>
            <TableCell align="right">setter</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {currentRoutes.map((route, index) => (
            <TableRow key={index}>
              <TableCell component="th" scope="row">
                {
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center"
                    }}
                  >
                    <div
                      style={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        backgroundColor: `#${route.color}`,
                        margin: "10px"
                      }}
                    />
                    {route.route}
                  </div>
                }
              </TableCell>
              <TableCell align="right">{route.grade}</TableCell>
              <TableCell align="right">{route.date}</TableCell>
              <TableCell align="right">{route.setter}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}

export default withStyles(styles)(RouteTable);
