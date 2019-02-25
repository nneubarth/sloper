//"position: absolute; top: (.*)%; left: (.*)%;
import React from "react";

export default function Circle(props) {
  return (
    <div
      style={{
        background: props.color,
        width: "10px",
        height: "10px",
        borderRadius: "50%",
        position: "absolute",
        top: props.topPercent,
        left: props.leftPercent,
        borderStyle: props.new ? "solid" : "none",
        borderWidth: props.new ? "2px" : "0px",
        borderColor: props.new ? "white" : "transparent",
        opacity: ".8"
      }}
      onMouseEnter={() =>
        props.handleHover(
          props.route,
          props.topPercent,
          props.leftPercent,
          props.new
        )
      }
      onMouseLeave={() => props.handleLeave()}
    />
  );
}
