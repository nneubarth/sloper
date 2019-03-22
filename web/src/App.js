import React, { Component } from "react";

import { withStyles } from "@material-ui/core/styles";
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core/styles";

import TopBar from "./TopBar";
import RouteTable from "./RouteTable";
import Map from "./Map";

const theme = createMuiTheme({
  palette: {
    primary: {
      light: "#e5ffff",
      main: "#b2dfdb",
      dark: "#82ada9",
      contrastText: "#000"
    },
    secondary: {
      light: "#757ce8",
      main: "#3f50b5",
      dark: "#002884",
      contrastText: "#FFF"
    }
  },
  typography: {
    useNextVariants: true
  },
  background: {
    default: "#dddddd",
    paper: "#FFF"
  }
});

const styles = {
  rootGrid: {
    display: "grid",
    gridTemplateRows: "1fr auto",
    gridTemplateColumns: "1fr",
    gridRowGap: "20px"
  },
  topBar: {},
  contentGrid: {
    display: "grid",
    justifyContent: "center",
    gridTemplateRows: "auto auto",
    gridTemplateColumns: "auto",
    gridGap: "20px",
    padding: "1rem"
  }
};

const host = "45.79.174.43:8080";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      climbers: ["User data coming soon"],
      currentRoutes: [],
      availableTopRopeGrades: [],
      availableBoulderGrades: []
    };
    // fetch("http://localhost:8080/climbers")
    //   .then(response => {
    //     if (response.ok) {
    //       return response.json();
    //     }
    //     throw new Error("Network response was not ok.");
    //   })
    //   .then(data => {
    //     const climbers = data.map(climber => {
    //       return climber.name;
    //     });
    //     this.setState({ climbers });
    //   })
    //   .catch(function(error) {
    //     console.log(
    //       "There has been a problem with your fetch operation: ",
    //       error.message
    //     );
    //   });
    fetch(`http://${host}/current-routes`)
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error("Network response was not ok.");
      })
      .then(data => {
        this.setState({ currentRoutes: data });
      })
      .catch(function(error) {
        console.log(
          "There has been a problem with your fetch operation: ",
          error.message
        );
      });
    fetch(`http://${host}/current-grades`)
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error("Network response was not ok.");
      })
      .then(data => {
        const availableTopRopeGrades = data
          .filter(grade => {
            return grade.type === "Top rope";
          })
          .sort((a, b) => {
            const aVal = !isNaN(Number.parseInt(a.grade.split(".")[1]))
              ? Number.parseInt(a.grade.split(".")[1])
              : 0;
            const bVal = !isNaN(Number.parseInt(b.grade.split(".")[1]))
              ? Number.parseInt(b.grade.split(".")[1])
              : 0;
            if (aVal < bVal) {
              return -1;
            }
            if (aVal > bVal) {
              return 1;
            }
            if (aVal === bVal) {
              if (a.grade.slice(-1) < b.grade.slice(-1)) {
                return -1;
              }
              if (a.grade.slice(-1) > b.grade.slice(-1)) {
                return 1;
              }
            }
            return 0;
          });

        const availableBoulderGrades = data
          .filter(grade => {
            return grade.type === "Boulder";
          })
          .sort((a, b) => {
            const aVal = !isNaN(Number.parseInt(a.grade.split("V")[1]))
              ? Number.parseInt(a.grade.split("V")[1])
              : 0;
            const bVal = !isNaN(Number.parseInt(b.grade.split("V")[1]))
              ? Number.parseInt(b.grade.split("V")[1])
              : 0;
            if (aVal < bVal) {
              return -1;
            }
            if (aVal > bVal) {
              return 1;
            }
            return 0;
          });

        this.setState({ availableTopRopeGrades, availableBoulderGrades });
      })
      .catch(function(error) {
        console.log(
          "There has been a problem with your fetch operation: ",
          error.message
        );
      });
  }

  render() {
    const { classes } = this.props;
    const {
      climbers,
      currentRoutes,
      availableTopRopeGrades,
      availableBoulderGrades
    } = this.state;

    return (
      <MuiThemeProvider theme={theme}>
        <div className={classes.rootGrid}>
          <TopBar className={classes.topBar} climberNames={climbers} />
          <div className={classes.contentGrid}>
            <Map
              currentRoutes={currentRoutes}
              availableTopRopeGrades={availableTopRopeGrades}
              availableBoulderGrades={availableBoulderGrades}
            />
            <RouteTable currentRoutes={currentRoutes} />
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default withStyles(styles)(App);
