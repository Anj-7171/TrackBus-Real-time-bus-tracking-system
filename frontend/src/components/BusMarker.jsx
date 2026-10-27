import React from "react";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";

const createBusIcon = (busNumber, status = "active") => {
  const isLive = status === "active";
  const bgGradient = isLive
    ? "linear-gradient(135deg, #10b981, #059669)"
    : "linear-gradient(135deg, #6b7280, #4b5563)";
  const ringColor = isLive ? "rgba(16, 185, 129, 0.4)" : "rgba(107, 114, 128, 0.2)";

  const html = `
    <div style="
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background: ${bgGradient};
      border-radius: 50%;
      color: white;
      font-weight: bold;
      font-size: 11px;
      box-shadow: 0 0 0 4px ${ringColor}, 0 4px 10px rgba(0,0,0,0.3);
      cursor: pointer;
      border: 2px solid #ffffff;
      transition: transform 0.3s ease;
    ">
      <span>🚌</span>
      <span style="
        position: absolute;
        bottom: -16px;
        background: #111827;
        color: #f3f4f6;
        padding: 1px 6px;
        border-radius: 4px;
        font-size: 10px;
        white-space: nowrap;
        border: 1px solid #374151;
        font-family: system-ui, sans-serif;
      ">${busNumber}</span>
    </div>
  `;

  return L.divIcon({
    className: "custom-bus-marker",
    html: html,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -22],
  });
};

function BusMarker({ bus, onSelectBus }) {
  const coordinates = bus.currentLocation?.coordinates;
  if (!coordinates || (coordinates[0] === 0 && coordinates[1] === 0)) {
    return null;
  }

  // GeoJSON coordinates are [longitude, latitude] -> Leaflet uses [latitude, longitude]
  const position = [coordinates[1], coordinates[0]];

  return (
    <Marker
      position={position}
      icon={createBusIcon(bus.busNumber, bus.status)}
      eventHandlers={{
        click: () => onSelectBus && onSelectBus(bus),
      }}
    >
      <Popup>
        <div style={{ padding: "4px", minWidth: "160px" }}>
          <h3 style={{ margin: "0 0 6px", fontSize: "15px", color: "#1f2937", display: "flex", alignItems: "center", gap: "6px" }}>
            <span>🚌</span> Bus {bus.busNumber}
          </h3>
          <p style={{ margin: "2px 0", fontSize: "12px", color: "#4b5563" }}>
            <strong>Reg:</strong> {bus.registrationNumber || "N/A"}
          </p>
          <p style={{ margin: "2px 0", fontSize: "12px", color: "#4b5563" }}>
            <strong>Capacity:</strong> {bus.capacity || 40} seats
          </p>
          <p style={{ margin: "2px 0", fontSize: "12px" }}>
            <strong>Status:</strong>{" "}
            <span
              style={{
                color: bus.status === "active" ? "#059669" : "#6b7280",
                fontWeight: "600",
                textTransform: "capitalize",
              }}
            >
              {bus.status}
            </span>
          </p>
          {bus.speed !== undefined && (
            <p style={{ margin: "2px 0", fontSize: "12px", color: "#4b5563" }}>
              <strong>Speed:</strong> {bus.speed} km/h
            </p>
          )}
          {onSelectBus && (
            <button
              onClick={() => onSelectBus(bus)}
              style={{
                marginTop: "8px",
                width: "100%",
                padding: "4px 8px",
                background: "#6366f1",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontSize: "11px",
                cursor: "pointer",
              }}
            >
              Track / View ETA
            </button>
          )}
        </div>
      </Popup>
    </Marker>
  );
}

export default BusMarker;
