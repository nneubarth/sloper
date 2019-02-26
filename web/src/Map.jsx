import React from "react";

import Card from "@material-ui/core/Card";
import Typography from "@material-ui/core/Typography";
import SvgIcon from "@material-ui/core/SvgIcon";
import Fab from "@material-ui/core/Fab";
import FilterListIcon from "@material-ui/icons/FilterList";
import Drawer from "@material-ui/core/Drawer";
import IconButton from "@material-ui/core/IconButton";
import Divider from "@material-ui/core/Divider";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import Select from "@material-ui/core/Select";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import OutlinedInput from "@material-ui/core/OutlinedInput";

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
    maxWidth: "950px"
    // boxShadow: "0 3000px rgba(63, 80, 181, .9) inset"
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
  fab: {
    margin: theme.spacing.unit,
    zIndex: "20",
    position: "absolute",
    bottom: "0",
    left: "0"
  },
  filterIcon: {
    margin: theme.spacing.unit
  },
  selectContainer: {
    margin: theme.spacing.unit
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 200
  }
});

function createGrid(
  currentRoutes,
  handleHover,
  handleLeave,
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
  return currentRoutes
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
        sortedTopRope.indexOf(route.grade) <= sortedTopRope.indexOf(highTopRope)
      );
    })
    .map((route, index) => {
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
    this.ref = React.createRef();

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
      isNew,
      drawerOpen: false
    });
  };

  handleLeave = () => {
    this.setState({
      displayedRoute: { route: "" },
      showDetails: false
    });
  };

  handleSelectChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  openFilterDrawer = () => {
    this.setState({ drawerOpen: true });
  };
  closeFilterDrawer = () => {
    this.setState({ drawerOpen: false });
  };

  render() {
    const {
      classes,
      currentRoutes,
      boulderOptions = [],
      topRopeOptions = []
    } = this.props;
    const {
      displayedRoute = { route: "" },
      showDetails = false,
      topPercent,
      leftPercent,
      isNew,
      drawerOpen,
      lowBoulderGrade = "V Intro",
      highBoulderGrade = "V11",
      lowTopRopeGrade = "5.Intro",
      highTopRopeGrade = "5.13c"
    } = this.state;

    const labelWidth = 135;

    return (
      <Card style={{ overflow: "visible", backgroundColor: "#f5f5f6" }}>
        <div ref={this.ref} className={classes.root}>
          <Fab
            variant="round"
            aria-label="Filter"
            className={classes.fab}
            color="secondary"
            onClick={this.openFilterDrawer}
          >
            <FilterListIcon className={classes.filterIcon} />
          </Fab>
          <Drawer
            open={drawerOpen}
            variant="persistent"
            ModalProps={{
              container: this.ref.current,
              style: { position: "absolute" }
            }}
            PaperProps={{
              style: { position: "absolute", width: "25%" }
            }}
            BackdropProps={{ style: { position: "absolute" } }}
            transitionDuration={{ enter: 1, exit: 1 }}
            onClose={() => {}}
          >
            <div className={classes.drawerHeader}>
              <IconButton onClick={this.closeFilterDrawer}>
                <ChevronLeftIcon />
              </IconButton>
            </div>
            <Divider />
            <div className={classes.selectContainer}>
              <FormControl variant="outlined" className={classes.formControl}>
                <InputLabel>Low boulder grade</InputLabel>
                <Select
                  className={classes.select}
                  value={lowBoulderGrade}
                  onChange={this.handleSelectChange}
                  input={
                    <OutlinedInput
                      name="lowBoulderGrade"
                      labelWidth={labelWidth}
                    />
                  }
                >
                  {boulderOptions.map((grade, index) => (
                    <MenuItem key={index} value={grade.grade}>
                      {grade.grade}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl variant="outlined" className={classes.formControl}>
                <InputLabel>High boulder grade</InputLabel>
                <Select
                  className={classes.select}
                  value={highBoulderGrade}
                  onChange={this.handleSelectChange}
                  input={
                    <OutlinedInput
                      name="highBoulderGrade"
                      labelWidth={labelWidth}
                    />
                  }
                >
                  {boulderOptions.map((grade, index) => (
                    <MenuItem key={index} value={grade.grade}>
                      {grade.grade}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl variant="outlined" className={classes.formControl}>
                <InputLabel>Low top rope grade</InputLabel>
                <Select
                  className={classes.select}
                  value={lowTopRopeGrade}
                  onChange={this.handleSelectChange}
                  input={
                    <OutlinedInput
                      name="lowTopRopeGrade"
                      labelWidth={labelWidth}
                    />
                  }
                >
                  {topRopeOptions.map((grade, index) => (
                    <MenuItem key={index} value={grade.grade}>
                      {grade.grade}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl variant="outlined" className={classes.formControl}>
                <InputLabel>High top rope grade</InputLabel>
                <Select
                  className={classes.select}
                  value={highTopRopeGrade}
                  onChange={this.handleSelectChange}
                  input={
                    <OutlinedInput
                      name="highTopRopeGrade"
                      labelWidth={labelWidth}
                    />
                  }
                >
                  {topRopeOptions.map((grade, index) => (
                    <MenuItem key={index} value={grade.grade}>
                      {grade.grade}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </Drawer>
          <div className={classes.tint} />
          <img alt="map" src={map} className={classes.map} />
          {createGrid(
            currentRoutes,
            this.handleHover,
            this.handleLeave,
            lowBoulderGrade,
            highBoulderGrade,
            lowTopRopeGrade,
            highTopRopeGrade,
            boulderOptions.map(grade => grade.grade),
            topRopeOptions.map(grade => grade.grade)
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
