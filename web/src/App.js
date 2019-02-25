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
  }
});

const styles = {
  rootGrid: {
    display: "grid",
    gridTemplateRows: "auto 1fr",
    backgroundColor: "#dddddd"
  },
  contentGrid: {
    display: "grid",
    gridTemplateRows: "1fr auto auto",
    marginLeft: theme.spacing.unit * 6,
    marginRight: theme.spacing.unit * 6,
    marginTop: theme.spacing.unit * 2,
    gridGap: "20px"
  }
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      climbers: [],
      currentRoutes: []
    };
    fetch("http://localhost:8080/climbers")
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error("Network response was not ok.");
      })
      .then(data => {
        const climbers = data.map(climber => {
          return climber.name;
        });
        this.setState({ climbers });
      })
      .catch(function(error) {
        console.log(
          "There has been a problem with your fetch operation: ",
          error.message
        );
      });
    fetch("http://localhost:8080/current-routes")
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
  }

  render() {
    const { classes } = this.props;
    const { climbers, currentRoutes } = this.state;

    return (
      <MuiThemeProvider theme={theme}>
        <div className={classes.rootGrid}>
          <TopBar climberNames={climbers} />
          <div className={classes.contentGrid}>
            <Map currentRoutes={currentRoutes} />
            <RouteTable currentRoutes={currentRoutes} />
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default withStyles(styles)(App);
