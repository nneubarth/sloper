import React from "react";

import Card from "@material-ui/core/Card";
import Typography from "@material-ui/core/Typography";
import SvgIcon from "@material-ui/core/SvgIcon";
import Hidden from "@material-ui/core/Hidden";

import { withStyles } from "@material-ui/core/styles";

import map from "./map.png";
import FilterPanel from "./FilterPanel";
import "./map.css";

function NewIcon(props) {
  return (
    <SvgIcon {...props}>
      <path
        fill="#002884"
        d="M20,4C21.11,4 22,4.89 22,6V18C22,19.11 21.11,20 20,20H4C2.89,20 2,19.11 2,18V6C2,4.89 2.89,4 4,4H20M8.5,15V9H7.25V12.5L4.75,9H3.5V15H4.75V11.5L7.3,15H8.5M13.5,10.26V9H9.5V15H13.5V13.75H11V12.64H13.5V11.38H11V10.26H13.5M20.5,14V9H19.25V13.5H18.13V10H16.88V13.5H15.75V9H14.5V14A1,1 0 0,0 15.5,15H19.5A1,1 0 0,0 20.5,14Z"
      />
    </SvgIcon>
  );
}

const styles = theme => ({
  root: {
    position: "relative",
    left: "0px",
    top: "0px"
    // margin: theme.spacing.unit * 3
    // width: "100%"
  },
  map: {
    maxWidth: "950px"
    // boxShadow: "0 3000px rgba(63, 80, 181, .9) inset"
  },
  svgPoints: {
    position: "absolute",
    top: "0",
    left: "0"
  },
  tint: {
    position: "absolute",
    top: "0",
    bottom: "0",
    left: "0",
    right: "0",
    borderRadius: "4px",
    backgroundColor: "rgba(63, 80, 181, .5)"
  },
  infoHeader: {
    margin: "3px"
  },
  noData: {
    position: "absolute",
    top: "0",
    bottom: "0",
    left: "0",
    right: "0",
    borderRadius: "4px",
    backgroundColor: "rgba(63, 80, 181, .5)"
  }
});

function createGrid(
  currentRoutes,
  toggleInfoCard,
  lowBoulder,
  highBoulder,
  lowTopRope,
  highTopRope,
  sortedBoulder,
  sortedTopRope
) {
  const xBoxSize = 1;
  const yBoxSize = 2;

  const occupiedSlots = new Set();

  return (
    currentRoutes
      // get rid of routes that are placed at 0.0
      // TODO: add ability for users to change position
      .filter(route => {
        const positions = route.position.split(".");
        return !(
          Number.parseInt(positions[0]) === 0 &&
          Number.parseInt(positions[1]) === 0
        );
      })
      .filter(route => {
        if (route.grade.slice(0, 1) === "V") {
          return (
            sortedBoulder.indexOf(route.grade) >=
              sortedBoulder.indexOf(lowBoulder) &&
            sortedBoulder.indexOf(route.grade) <=
              sortedBoulder.indexOf(highBoulder)
          );
        }
        return (
          sortedTopRope.indexOf(route.grade) >=
            sortedTopRope.indexOf(lowTopRope) &&
          sortedTopRope.indexOf(route.grade) <=
            sortedTopRope.indexOf(highTopRope)
        );
      })
      .map((route, index) => {
        const positions = route.position.split(".");
        let topPercent = Number.parseInt(positions[0]);
        let leftPercent = Number.parseInt(positions[1]);

        let xBox = Math.floor(leftPercent / xBoxSize);
        let yBox = Math.max(1, Math.floor(topPercent / yBoxSize));
        let key = `${xBox}.${yBox}`;

        if (occupiedSlots.has(key)) {
          // need to find a new slot
          const positions = [
            [1, 0],
            [1, 1],
            [0, 1],
            [-1, +1],
            [-1, 0],
            [-1, -1],
            [0, -1],
            [+1, -1]
          ];
          for (let i = 0; i < positions.length; i++) {
            const newXBox = Math.min(
              100,
              Math.max(
                0,
                Math.ceil(
                  (leftPercent + positions[i][0] * (xBoxSize / 2.0)) / xBoxSize
                )
              )
            );
            const newYBox = Math.min(
              100,
              Math.max(
                0,
                Math.ceil(
                  (topPercent + positions[i][1] * (yBoxSize / 2.0)) / yBoxSize
                )
              )
            );

            const newKey = `${newXBox}.${newYBox}`;
            if (!occupiedSlots.has(newKey)) {
              key = newKey;
              xBox = newXBox;
              yBox = newYBox;
              break;
            }
          }
        }

        occupiedSlots.add(key);
        topPercent = yBoxSize * yBox;
        leftPercent = xBoxSize * xBox;

        const dateParts = route.date.split("-");
        const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);

        const currentDate = new Date();
        const timeDiff = Math.abs(currentDate - date);
        const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

        const isNew = diffDays <= 7;

        return (
          <circle
            style={{
              transition: `stroke-opacity .25s, stroke-width .25s, transform .25s`,
              transformOrigin: `${leftPercent}% ${topPercent}%`,
              cursor: "pointer"
            }}
            cx={`${leftPercent}%`}
            cy={`${topPercent}%`}
            r="5"
            key={route.route}
            stroke={isNew ? "white" : "transparent"}
            strokeWidth={isNew ? "2px" : "0px"}
            opacity=".8"
            fill={`#${route.color}`}
            onClick={() =>
              toggleInfoCard(route, topPercent, leftPercent, isNew)
            }
          />
        );
      })
  );
}

class Map extends React.Component {
  constructor(props) {
    super(props);
    this.ref = React.createRef();

    this.state = {
      displayedRoute: { route: "" },
      showDetails: false,
      topPercent: "0%",
      leftPercent: "0%",
      isNew: false
    };
  }

  componentWillMount() {
    document.addEventListener("mousedown", this.handleClick, false);
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClick, false);
  }

  toggleInfoCard = (route, topPercent, leftPercent, isNew) => {
    const { showDetails, displayedRoute } = this.state;
    if (showDetails && displayedRoute.route === route.route) {
      this.setState({
        displayedRoute: { route: "" },
        showDetails: false
      });
    } else {
      this.setState({
        displayedRoute: route,
        showDetails: true,
        topPercent: `${topPercent}%`,
        leftPercent: `${leftPercent}%`,
        isNew,
        drawerOpen: false
      });
    }
  };

  handleClick = event => {
    if (this.ref.current.contains(event.target)) {
      this.setState({
        displayedRoute: { route: "" },
        showDetails: false
      });
    }
  };

  handleSelectChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    const {
      classes,
      currentRoutes,
      availableBoulderGrades = [],
      availableTopRopeGrades = []
    } = this.props;
    const {
      displayedRoute = { route: "" },
      showDetails = false,
      topPercent,
      leftPercent,
      isNew,
      lowBoulderGrade = availableBoulderGrades.length > 0
        ? availableBoulderGrades[0].grade
        : "",
      highBoulderGrade = availableBoulderGrades.length > 0
        ? availableBoulderGrades[availableBoulderGrades.length - 1].grade
        : "",
      lowTopRopeGrade = availableBoulderGrades.length > 0
        ? availableTopRopeGrades[0].grade
        : "",
      highTopRopeGrade = availableBoulderGrades.length > 0
        ? availableTopRopeGrades[availableTopRopeGrades.length - 1].grade
        : ""
    } = this.state;

    return (
      <Card style={{ overflow: "visible", backgroundColor: "#f5f5f6" }}>
        <div ref={this.ref} className={classes.root}>
          <Hidden smDown>
            <FilterPanel
              lowBoulderGrade={lowBoulderGrade}
              highBoulderGrade={highBoulderGrade}
              lowTopRopeGrade={lowTopRopeGrade}
              highTopRopeGrade={highTopRopeGrade}
              availableBoulderGrades={availableBoulderGrades}
              availableTopRopeGrades={availableTopRopeGrades}
              anchorElement={this.ref.current}
              handleSelectCallback={this.handleSelectChange}
            />
          </Hidden>
          <div className={classes.tint} />
          <img alt="map" src={map} className={classes.map} />
          {availableTopRopeGrades.length > 0 ||
          availableBoulderGrades.length > 0 ? (
            <svg className={classes.svgPoints} viewBox="0 0 950 437">
              {createGrid(
                currentRoutes,
                this.toggleInfoCard,
                lowBoulderGrade,
                highBoulderGrade,
                lowTopRopeGrade,
                highTopRopeGrade,
                availableBoulderGrades.map(grade => grade.grade),
                availableTopRopeGrades.map(grade => grade.grade)
              )}
            </svg>
          ) : (
            <div className={classes.noData}>
              <Typography
                variant="h2"
                style={{
                  color: "white",
                  textAlign: "center",
                  padding: "200px"
                }}
              >
                No data available
              </Typography>
            </div>
          )}
          {showDetails ? (
            <Card
              style={{
                background: "white",
                width: "auto",
                height: "auto",
                position: "absolute",
                top: topPercent,
                left: leftPercent,
                whiteSpace: "nowrap",
                overflow: "hidden",
                zIndex: "20",
                cursor: "pointer"
              }}
              onClick={this.handleClick}
            >
              <div style={{ margin: "10px" }}>
                <div
                  style={{
                    display: "inline-flex",
                    margin: "3px",
                    alignItems: "center"
                  }}
                >
                  <div
                    style={{
                      background: `#${displayedRoute.color}`,
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      margin: "3px"
                    }}
                  />
                  <Typography variant="subtitle1">
                    {displayedRoute.route}
                  </Typography>
                  {isNew ? (
                    <NewIcon
                      style={{ margin: "3px", width: "24px", height: "24px" }}
                    />
                  ) : (
                    ""
                  )}
                </div>
                <Typography>{displayedRoute.grade}</Typography>
                <Typography>{displayedRoute.date}</Typography>
                <Typography>{displayedRoute.setter}</Typography>
              </div>
            </Card>
          ) : (
            ""
          )}
        </div>
      </Card>
    );
  }
}

export default withStyles(styles)(Map);
