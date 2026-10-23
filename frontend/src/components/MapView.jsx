import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

function MapView({
  buses = [],
  routeCoordinates = [],
}) {
  const defaultPosition = [
    12.9692,
    79.1559,
  ];

  return (
    <MapContainer
      center={defaultPosition}
      zoom={13}
      style={{
        height: "500px",
        width: "100%",
      }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {buses.map((bus) => {
        const coordinates =
          bus.currentLocation?.coordinates;

        if (!coordinates) return null;

        const position = [
          coordinates[1],
          coordinates[0],
        ];

        return (
          <Marker
            key={bus._id}
            position={position}
          >
            <Popup>
              <strong>
                Bus {bus.busNumber}
              </strong>

              <br />

              Status: {bus.status}
            </Popup>
          </Marker>
        );
      })}

      {routeCoordinates.length > 0 && (
        <Polyline
          positions={routeCoordinates}
        />
      )}
    </MapContainer>
  );
}

export default MapView;