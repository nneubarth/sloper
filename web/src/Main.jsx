import React from "react";

import RouteTable from "./RouteTable";
import Map from "./Map";

export default function Main(props) {
  return (
    <>
      <Map
        currentRoutes={props.currentRoutes}
        availableTopRopeGrades={props.availableTopRopeGrades}
        availableBoulderGrades={props.availableBoulderGrades}
      />
      <RouteTable currentRoutes={props.currentRoutes} />
    </>
  );
}
