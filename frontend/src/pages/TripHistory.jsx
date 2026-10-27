import React, { useState, useEffect, useMemo } from "react";
import Navbar from "../components/Navbar";
import Loading from "../components/Loading";
import { getTrips } from "../services/tripService";

function TripHistory() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getTrips();
        setTrips(data);
      } catch (err) {
        setError("Failed to load trip history.");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return "—";
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    const diffMins = Math.round((end - start) / 60000);
    if (diffMins < 60) return `${diffMins} mins`;
    const hrs = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hrs}h ${mins}m`;
  };

  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      const matchesStatus = filterStatus === "all" || trip.status === filterStatus;
      const term = searchTerm.toLowerCase();
      const routeText = `${trip.route?.routeNumber || ""} ${trip.route?.routeName || ""}`.toLowerCase();
      const busText = `${trip.bus?.busNumber || ""} ${trip.bus?.registrationNumber || ""}`.toLowerCase();
      const driverText = `${trip.driver?.user?.name || ""}`.toLowerCase();
      const matchesSearch =
        !term ||
        routeText.includes(term) ||
        busText.includes(term) ||
        driverText.includes(term);

      return matchesStatus && matchesSearch;
    });
  }, [trips, filterStatus, searchTerm]);

  return (
    <div className="dashboard-layout">
      <Navbar />

      <main className="dashboard-content">
        <div className="page-header">
          <div>
            <h1>Trip History & Telemetry Logs</h1>
            <p>Historical audit of active, completed, and scheduled transit dispatches</p>
          </div>
        </div>

        {error && <div className="alert-box error">{error}</div>}

        <div className="card">
          <div className="card-header" style={{ flexWrap: "wrap", gap: "14px" }}>
            <h3>Transit Trips Registry ({filteredTrips.length})</h3>

            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
              <input
                type="text"
                placeholder="Search route, bus, driver..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: "220px", padding: "6px 12px", fontSize: "13px" }}
              />

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="select-input-sm"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Now</option>
                <option value="completed">Completed</option>
                <option value="scheduled">Scheduled</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {loading ? (
            <Loading message="Loading trip logs from database..." />
          ) : filteredTrips.length === 0 ? (
            <p className="empty-message">No trips found matching criteria.</p>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Trip ID</th>
                    <th>Route</th>
                    <th>Assigned Bus</th>
                    <th>Driver</th>
                    <th>Status</th>
                    <th>Departure / Start</th>
                    <th>Arrival / End</th>
                    <th>Trip Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTrips.map((trip) => (
                    <tr key={trip._id}>
                      <td>
                        <code>#{trip._id.substring(trip._id.length - 6)}</code>
                      </td>
                      <td>
                        <strong>{trip.route?.routeNumber}</strong> - {trip.route?.routeName}
                      </td>
                      <td>
                        Bus {trip.bus?.busNumber} ({trip.bus?.registrationNumber})
                      </td>
                      <td>{trip.driver?.user?.name || "Assigned Driver"}</td>
                      <td>
                        <span className={`status-pill ${trip.status}`}>{trip.status}</span>
                      </td>
                      <td>
                        {trip.startTime
                          ? new Date(trip.startTime).toLocaleString([], { dateStyle: "short", timeStyle: "short" })
                          : "Scheduled"}
                      </td>
                      <td>
                        {trip.endTime
                          ? new Date(trip.endTime).toLocaleString([], { dateStyle: "short", timeStyle: "short" })
                          : trip.status === "active"
                          ? "🟢 In Progress"
                          : "—"}
                      </td>
                      <td>
                        <strong>{calculateDuration(trip.startTime, trip.endTime)}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default TripHistory;
