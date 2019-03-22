import React from "react";

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

const styles = theme => ({
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

const labelWidth = 135;

class FilterPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      drawerOpen: false
    };
  }
  openFilterDrawer = () => {
    this.setState({ drawerOpen: true });
  };
  closeFilterDrawer = () => {
    this.setState({ drawerOpen: false });
  };
  render() {
    const {
      classes,
      availableBoulderGrades = [],
      availableTopRopeGrades = [],
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
        : "",
      anchorElement,
      handleSelectCallback
    } = this.props;
    const { drawerOpen } = this.state;
    return (
      <div>
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
            container: anchorElement,
            style: { position: "absolute" }
          }}
          PaperProps={{
            style: { position: "absolute", width: "25%" }
          }}
          BackdropProps={{ style: { position: "absolute" } }}
          transitionDuration={{ enter: 1, exit: 1 }}
          onClose={() => {}}
        >
          <div>
            <IconButton onClick={this.closeFilterDrawer}>
              <ChevronLeftIcon />
            </IconButton>
          </div>

          <Divider />
          <div className={classes.selectContainer}>
            <FormControl variant="outlined" className={classes.formControl}>
              <InputLabel>Low boulder grade</InputLabel>
              <Select
                value={lowBoulderGrade}
                onChange={handleSelectCallback}
                input={
                  <OutlinedInput
                    name="lowBoulderGrade"
                    labelWidth={labelWidth}
                  />
                }
              >
                {availableBoulderGrades.map((grade, index) => (
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
                onChange={handleSelectCallback}
                input={
                  <OutlinedInput
                    name="highBoulderGrade"
                    labelWidth={labelWidth}
                  />
                }
              >
                {availableBoulderGrades.map((grade, index) => (
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
                onChange={handleSelectCallback}
                input={
                  <OutlinedInput
                    name="lowTopRopeGrade"
                    labelWidth={labelWidth}
                  />
                }
              >
                {availableTopRopeGrades.map((grade, index) => (
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
                onChange={handleSelectCallback}
                input={
                  <OutlinedInput
                    name="highTopRopeGrade"
                    labelWidth={labelWidth}
                  />
                }
              >
                {availableTopRopeGrades.map((grade, index) => (
                  <MenuItem key={index} value={grade.grade}>
                    {grade.grade}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </Drawer>
      </div>
    );
  }
}

export default withStyles(styles)(FilterPanel);
