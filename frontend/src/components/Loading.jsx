import React from "react";

function Loading({ message = "Loading data..." }) {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>{message}</p>
    </div>
  );
}

export default Loading;
