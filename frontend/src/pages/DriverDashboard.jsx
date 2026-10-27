import React, { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import Loading from "../components/Loading";
import { useAuth } from "../context/AuthContext";
import { getTrips, startTrip, endTrip } from "../services/tripService";
import { getBuses } from "../services/busService";
import { updateLocation } from "../services/locationService";
import { emitBusLocation, joinTripRoom } from "../services/socketService";

function DriverDashboard() {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [buses, setBuses] = useState([]);
  const [selectedBusId, setSelectedBusId] = useState("");
  const [activeTrip, setActiveTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Telemetry state
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [currentCoords, setCurrentCoords] = useState({ lat: 12.9692, lng: 79.1559 });
  const [speed, setSpeed] = useState(35);
  const [heading, setHeading] = useState(90);
  const [telemetryLogs, setTelemetryLogs] = useState([]);

  const broadcastTimerRef = useRef(null);

  const fetchTripsAndBuses = async () => {
    try {
      setLoading(true);
      setError("");
      const [tripsData, busesData] = await Promise.all([
        getTrips().catch(() => []),
        getBuses().catch(() => []),
      ]);

      setTrips(tripsData);
      setBuses(busesData);

      // Find an active trip
      const active = tripsData.find((t) => t.status === "active");
      if (active) {
        setActiveTrip(active);
        setSelectedBusId(active.bus?._id || active.bus || "");
        joinTripRoom(active._id);
      } else if (busesData.length > 0) {
        setSelectedBusId(busesData[0]._id);
      }
    } catch (err) {
      setError("Failed to load driver trips and buses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTripsAndBuses();
    return () => {
      if (broadcastTimerRef.current) {
        clearInterval(broadcastTimerRef.current);
      }
    };
  }, []);

  const handleStartTrip = async (tripId) => {
    try {
      setError("");
      setSuccess("");
      const updated = await startTrip(tripId);
      setActiveTrip(updated);
      setSelectedBusId(updated.bus?._id || updated.bus);
      joinTripRoom(updated._id);
      setSuccess("Trip started successfully! You can now start broadcasting GPS.");
      fetchTripsAndBuses();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to start trip.");
    }
  };

  const handleEndTrip = async (tripId) => {
    try {
      setError("");
      setSuccess("");
      if (isBroadcasting) {
        stopBroadcasting();
      }
      await endTrip(tripId);
      setActiveTrip(null);
      setSuccess("Trip ended successfully. Bus marked inactive.");
      fetchTripsAndBuses();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to end trip.");
    }
  };

  // Broadcast single telemetry update
  const transmitGPS = async (overrideCoords = null) => {
    const busId = selectedBusId || (activeTrip?.bus?._id || activeTrip?.bus);
    if (!busId) {
      setError("Please select a bus before transmitting GPS coordinates.");
      return;
    }

    const targetCoords = overrideCoords || currentCoords;
    const busObj = buses.find((b) => b._id === busId);
    const busNum = busObj ? busObj.busNumber : "BUS";

    const payload = {
      busId,
      tripId: activeTrip?._id || null,
      latitude: targetCoords.lat,
      longitude: targetCoords.lng,
      speed: Number(speed),
      heading: Number(heading),
      busNumber: busNum,
    };

    try {
      // 1. Send to backend DB via REST API
      await updateLocation(payload);

      // 2. Broadcast to all clients via Socket.IO
      emitBusLocation(payload);

      const timestamp = new Date().toLocaleTimeString();
      setTelemetryLogs((prev) => [
        `[${timestamp}] 📡 GPS Broadcasted: Lat ${targetCoords.lat.toFixed(4)}, Lng ${targetCoords.lng.toFixed(4)} | Speed: ${speed} km/h`,
        ...prev.slice(0, 19),
      ]);
    } catch (err) {
      console.error("GPS broadcast error:", err);
    }
  };

  // Start continuous broadcast simulation / interval
  const startBroadcasting = () => {
    setIsBroadcasting(true);
    transmitGPS();

    // Minor movement simulation for realistic live demonstration
    broadcastTimerRef.current = setInterval(() => {
      setCurrentCoords((prev) => {
        // Small delta ~20 meters
        const deltaLat = (Math.random() - 0.48) * 0.001;
        const deltaLng = (Math.random() - 0.48) * 0.001;
        const next = {
          lat: prev.lat + deltaLat,
          lng: prev.lng + deltaLng,
        };
        transmitGPS(next);
        return next;
      });
    }, 4000);
  };

  const stopBroadcasting = () => {
    if (broadcastTimerRef.current) {
      clearInterval(broadcastTimerRef.current);
      broadcastTimerRef.current = null;
    }
    setIsBroadcasting(false);
  };

  return (
    <div className="dashboard-layout">
      <Navbar />

      <main className="dashboard-content">
        <div className="page-header">
          <div>
            <h1>Driver Telemetry Console</h1>
            <p>Broadcast GPS coordinates and manage your active transit trips</p>
          </div>
          <div>
            <span className={`status-badge-lg ${isBroadcasting ? "broadcasting" : "idle"}`}>
              {isBroadcasting ? "📡 GPS Transmitter LIVE" : "⚪ Transmitter Idle"}
            </span>
          </div>
        </div>

        {error && <div className="alert-box error">{error}</div>}
        {success && <div className="alert-box success">{success}</div>}

        <div className="driver-grid">
          {/* Trip Status Card */}
          <div className="card">
            <div className="card-header">
              <h3>Active / Scheduled Trips</h3>
            </div>

            {loading ? (
              <Loading message="Loading driver trips..." />
            ) : trips.length === 0 ? (
              <p className="empty-message">No trips assigned yet. Contact administrator.</p>
            ) : (
              <div className="trip-cards-list">
                {trips.map((trip) => {
                  const isCurrentActive = activeTrip && activeTrip._id === trip._id;
                  return (
                    <div
                      key={trip._id}
                      className={`trip-control-card ${isCurrentActive ? "active-trip-card" : ""}`}
                    >
                      <div className="trip-control-header">
                        <div>
                          <strong>
                            Route: {trip.route?.routeNumber || "N/A"} -{" "}
                            {trip.route?.routeName || "Unnamed"}
                          </strong>
                          <span className="bus-tag">
                            Bus: {trip.bus?.busNumber || "Assigned"} ({trip.bus?.registrationNumber || ""})
                          </span>
                        </div>
                        <span className={`status-pill ${trip.status}`}>{trip.status}</span>
                      </div>

                      <div className="trip-actions">
                        {trip.status === "scheduled" && (
                          <button
                            onClick={() => handleStartTrip(trip._id)}
                            className="btn btn-primary btn-sm"
                          >
                            ▶️ Start Trip
                          </button>
                        )}

                        {trip.status === "active" && (
                          <button
                            onClick={() => handleEndTrip(trip._id)}
                            className="btn btn-danger btn-sm"
                          >
                            ⏹️ Complete / End Trip
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* GPS Transmitter Control Card */}
          <div className="card">
            <div className="card-header">
              <h3>🛰️ GPS Telemetry Simulator & Transmitter</h3>
            </div>

            <div className="transmitter-form">
              <div className="form-group">
                <label>Target Bus for GPS</label>
                <select
                  value={selectedBusId}
                  onChange={(e) => setSelectedBusId(e.target.value)}
                  disabled={isBroadcasting}
                >
                  <option value="">Select Bus</option>
                  {buses.map((b) => (
                    <option key={b._id} value={b._id}>
                      Bus {b.busNumber} ({b.registrationNumber}) - {b.status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid-2-cols">
                <div className="form-group">
                  <label>Current Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={currentCoords.lat}
                    onChange={(e) =>
                      setCurrentCoords((prev) => ({ ...prev, lat: parseFloat(e.target.value) || 0 }))
                    }
                    disabled={isBroadcasting}
                  />
                </div>
                <div className="form-group">
                  <label>Current Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={currentCoords.lng}
                    onChange={(e) =>
                      setCurrentCoords((prev) => ({ ...prev, lng: parseFloat(e.target.value) || 0 }))
                    }
                    disabled={isBroadcasting}
                  />
                </div>
              </div>

              <div className="grid-2-cols">
                <div className="form-group">
                  <label>Speed (km/h)</label>
                  <input
                    type="number"
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                  />
                </div>
                <div className="form-group">
                  <label>Heading (Degrees)</label>
                  <input
                    type="number"
                    value={heading}
                    onChange={(e) => setHeading(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="transmitter-btn-row">
                <button
                  type="button"
                  onClick={() => transmitGPS()}
                  className="btn btn-secondary"
                  disabled={isBroadcasting}
                >
                  📤 Single GPS Ping
                </button>

                {!isBroadcasting ? (
                  <button
                    type="button"
                    onClick={startBroadcasting}
                    className="btn btn-success"
                  >
                    🚀 Start Continuous GPS Broadcast (4s)
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopBroadcasting}
                    className="btn btn-warning"
                  >
                    ⏸️ Pause Broadcast
                  </button>
                )}
              </div>
            </div>

            {/* Telemetry Output Log */}
            <div className="terminal-logs">
              <div className="logs-header">Telemetry Logs</div>
              <div className="logs-body">
                {telemetryLogs.length === 0 ? (
                  <span className="log-empty">No telemetry transmitted yet...</span>
                ) : (
                  telemetryLogs.map((log, idx) => (
                    <div key={idx} className="log-line">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DriverDashboard;
