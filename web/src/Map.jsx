import React from "react";

import Card from "@material-ui/core/Card";
import Typography from "@material-ui/core/Typography";
import SvgIcon from "@material-ui/core/SvgIcon";

import { withStyles } from "@material-ui/core/styles";

import Circle from "./Circle";
import map from "./map.png";

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
    width: "100%"
    // boxShadow: "0 3000px rgba(63, 80, 181, .9) inset"
  },
  tint: {
    position: "absolute",
    top: "0",
    bottom: "0",
    left: "0",
    right: "0",
    borderRadius: "4px",
    transition: ".5s ease",
    backgroundColor: "rgba(63, 80, 181, .5)"
  },
  infoHeader: {
    margin: "3px"
  }
});

function createGrid(currentRoutes, handleHover, handleLeave) {
  const xBoxSize = 1;
  const yBoxSize = 2;

  const occupiedSlots = new Set();
  return currentRoutes.map((route, index) => {
    const positions = route.position.split(".");
    let topPercent = Number.parseInt(positions[0]);
    let leftPercent = Number.parseInt(positions[1]);

    let xBox = Math.floor(leftPercent / xBoxSize);
    let yBox = Math.floor(topPercent / yBoxSize);
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
      if (occupiedSlots.has(key)) {
        xBox = Math.min(
          100,
          Math.abs(xBox + Math.round(Math.random()) * 0.5 * xBoxSize)
        );
        yBox = Math.min(
          100,
          Math.abs(yBox + Math.round(Math.random()) * 0.5 * yBoxSize)
        );
        key = `${xBox}.${yBox}`;
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

    return (
      <Circle
        color={`#${route.color}`}
        topPercent={`${topPercent}%`}
        leftPercent={`${leftPercent}%`}
        key={index}
        new={diffDays <= 7}
        handleHover={handleHover}
        handleLeave={handleLeave}
        route={route}
      />
    );
  });
}

class Map extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      displayedRoute: { route: "" },
      showDetails: false,
      topPercent: "0%",
      leftPercent: "0%",
      isNew: false
    };
  }
  handleHover = (route, topPercent, leftPercent, isNew) => {
    const top = topPercent.split("%");
    topPercent = Number.parseInt(top[0]) + 2;
    const left = leftPercent.split("%");
    leftPercent = Number.parseInt(left[0]) + 1;
    this.setState({
      displayedRoute: route,
      showDetails: true,
      topPercent: `${topPercent}%`,
      leftPercent: `${leftPercent}%`,
      isNew
    });
  };

  handleLeave = () => {
    this.setState({
      displayedRoute: { route: "" },
      showDetails: false
    });
  };

  render() {
    const { classes, currentRoutes } = this.props;
    const {
      displayedRoute = { route: "" },
      showDetails = false,
      topPercent,
      leftPercent,
      isNew
    } = this.state;

    return (
      <Card style={{ overflow: "visible", backgroundColor: "#f5f5f6" }}>
        <div className={classes.root}>
          <div className={classes.tint} />
          <img alt="map" src={map} className={classes.map} />
          {createGrid(currentRoutes, this.handleHover, this.handleLeave)}
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
                zIndex: "20"
              }}
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
