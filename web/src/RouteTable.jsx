import React from "react";

import Table from "@material-ui/core/Table";
import TableSortLabel from "@material-ui/core/TableSortLabel";
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
    padding: "dense"
  },
  header: {
    backgroundColor: theme.palette.secondary.main
  },
  headerCell: {
    color: theme.palette.secondary.contrastText,
    overflow: "hidden",
    whiteSpace: "nowrap"
  },
  sortLabel: {
    color: theme.palette.secondary.contrastText
  }
});

class RouteTable extends React.Component {
  // constructor(props) {
  //   super(props);
  //   this.state = { orderBy: "date", direction: "desc" };
  // }

  render() {
    const { classes, currentRoutes = [] } = this.props;
    // const { orderBy, direction } = this.state;

    currentRoutes.sort((a, b) => {
      if (Date.parse(a.date) < Date.parse(b.date)) {
        return 1;
      } else if (Date.parse(a.date) > Date.parse(b.date)) {
        return -1;
      } else {
        return 0;
      }
    });

    const rowHeadings = [
      { id: "name" },
      { id: "grade" },
      { id: "date" },
      { id: "setter" }
    ];

    return (
      <Paper className={classes.root}>
        <Table className={classes.table}>
          <TableHead className={classes.header}>
            <TableRow className={classes.headerText}>
              {rowHeadings.map((row, index) => {
                const align = index === 0 ? "left" : "right";
                return (
                  <TableCell
                    key={index}
                    align={align}
                    className={classes.headerCell}
                  >
                    {/* <TableSortLabel
                      active={true}
                      direction={direction}
                      className={classes.sortLabel}
                      onClick={() => this.setOrderBy(row.id)}
                    /> */}
                    {row.id}
                  </TableCell>
                );
              })}
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
                          width: "20px",
                          height: "20px",
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
}

export default withStyles(styles)(RouteTable);
