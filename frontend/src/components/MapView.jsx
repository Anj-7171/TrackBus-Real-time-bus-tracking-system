import React, { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Circle,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import BusMarker from "./BusMarker";

// Fix default Leaflet icon paths in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const createUserIcon = () => {
  return L.divIcon({
    className: "custom-user-marker",
    html: `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        background: #ec4899;
        color: white;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 0 12px rgba(236, 72, 153, 0.6);
        font-size: 16px;
      ">
        📍
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
};

const createStopIcon = (stopNumber, stopName) => {
  return L.divIcon({
    className: "custom-stop-marker",
    html: `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: 26px;
        height: 26px;
        background: #3b82f6;
        color: white;
        border-radius: 50%;
        font-weight: bold;
        font-size: 11px;
        border: 2px solid #ffffff;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      ">
        ${stopNumber}
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -14],
  });
};

function ChangeMapView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [center, zoom, map]);
  return null;
}

function MapView({
  buses = [],
  stops = [],
  routeCoordinates = [],
  center = [12.9692, 79.1559],
  zoom = 13,
  height = "520px",
  onSelectBus,
  onSelectStop,
  searchCenter = null,
  searchRadius = null,
}) {
  const defaultPosition = center;

  return (
    <div className="map-view-wrapper" style={{ height, width: "100%", position: "relative", borderRadius: "12px", overflow: "hidden" }}>
      <MapContainer
        center={defaultPosition}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{
          height: "100%",
          width: "100%",
        }}
      >
        <ChangeMapView center={center} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* MongoDB Geospatial Search Radius Circle */}
        {searchCenter && searchRadius && (
          <>
            <Circle
              center={searchCenter}
              radius={searchRadius}
              pathOptions={{
                color: "#ec4899",
                fillColor: "#ec4899",
                fillOpacity: 0.12,
                weight: 2,
                dashArray: "4, 6",
              }}
            />
            <Marker position={searchCenter} icon={createUserIcon()}>
              <Popup>
                <div style={{ padding: "4px" }}>
                  <h4 style={{ margin: "0 0 4px", fontSize: "13px", color: "#ec4899" }}>
                    📍 Geospatial Search Origin
                  </h4>
                  <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>
                    Radius: {(searchRadius / 1000).toFixed(1)} km
                  </p>
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {/* Bus Markers */}
        {buses.map((bus) => (
          <BusMarker key={bus._id} bus={bus} onSelectBus={onSelectBus} />
        ))}

        {/* Route Stops */}
        {stops.map((stop, idx) => {
          const coords = stop.location?.coordinates || stop.coordinates;
          if (!coords || !coords[1] || !coords[0]) return null;
          const pos = [coords[1], coords[0]];

          return (
            <Marker
              key={stop._id || idx}
              position={pos}
              icon={createStopIcon(stop.order || idx + 1, stop.name)}
              eventHandlers={{
                click: () => onSelectStop && onSelectStop(stop),
              }}
            >
              <Popup>
                <div style={{ padding: "4px" }}>
                  <h4 style={{ margin: "0 0 4px", fontSize: "14px" }}>
                    🛑 Stop #{stop.order || idx + 1}: {stop.name}
                  </h4>
                  <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>
                    Lat: {coords[1].toFixed(4)}, Lng: {coords[0].toFixed(4)}
                  </p>
                  {onSelectStop && (
                    <button
                      onClick={() => onSelectStop(stop)}
                      style={{
                        marginTop: "8px",
                        width: "100%",
                        padding: "4px 8px",
                        background: "#3b82f6",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        fontSize: "11px",
                        cursor: "pointer",
                      }}
                    >
                      Calculate ETA to this Stop
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Route Polyline */}
        {routeCoordinates.length > 0 && (
          <Polyline
            positions={routeCoordinates}
            color="#6366f1"
            weight={5}
            opacity={0.8}
            dashArray="2, 6"
          />
        )}
      </MapContainer>
    </div>
  );
}

export default MapView;