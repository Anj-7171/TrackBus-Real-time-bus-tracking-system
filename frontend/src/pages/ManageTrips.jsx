import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Loading from "../components/Loading";
import {
  getTrips,
  createTrip,
  startTrip,
  endTrip,
  cancelTrip,
} from "../services/tripService";
import { getBuses } from "../services/busService";
import { getDrivers } from "../services/driverService";
import { getRoutes } from "../services/routeService";

function ManageTrips() {
  const [trips, setTrips] = useState([]);
  const [buses, setBuses] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  const [formData, setFormData] = useState({
    bus: "",
    driver: "",
    route: "",
    startTime: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const [tripsData, busesData, driversData, routesData] = await Promise.all([
        getTrips().catch(() => []),
        getBuses().catch(() => []),
        getDrivers().catch(() => []),
        getRoutes().catch(() => []),
      ]);

      setTrips(tripsData);
      setBuses(busesData);
      setDrivers(driversData);
      setRoutes(routesData);

      if (busesData.length > 0 && !formData.bus) {
        setFormData((prev) => ({
          ...prev,
          bus: busesData[0]._id,
          driver: driversData.length > 0 ? driversData[0]._id : "",
          route: routesData.length > 0 ? routesData[0]._id : "",
        }));
      }
    } catch (err) {
      setError("Failed to load trips data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    if (!formData.bus || !formData.driver || !formData.route) {
      setError("Bus, driver, and route must all be selected.");
      return;
    }

    try {
      setError("");
      setSuccess("");
      await createTrip({
        bus: formData.bus,
        driver: formData.driver,
        route: formData.route,
        startTime: formData.startTime || new Date(),
      });

      setSuccess("New trip scheduled successfully!");
      setShowAddForm(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to schedule trip.");
    }
  };

  const handleAction = async (actionFn, id, actionName) => {
    try {
      setError("");
      setSuccess("");
      await actionFn(id);
      setSuccess(`Trip marked as ${actionName}.`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${actionName} trip.`);
    }
  };

  const filteredTrips = trips.filter((t) => {
    if (filterStatus === "all") return true;
    return t.status === filterStatus;
  });

  return (
    <div className="dashboard-layout">
      <Navbar />

      <main className="dashboard-content">
        <div className="page-header">
          <div>
            <h1>Trip Dispatch & Management</h1>
            <p>Schedule trips, assign buses & drivers to routes, and track transit lifecycle</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn btn-primary"
          >
            {showAddForm ? "✕ Close Form" : "➕ Schedule New Trip"}
          </button>
        </div>

        {error && <div className="alert-box error">{error}</div>}
        {success && <div className="alert-box success">{success}</div>}

        {showAddForm && (
          <div className="card form-card">
            <div className="card-header">
              <h3>Schedule Trip Dispatch</h3>
            </div>
            <form onSubmit={handleCreateTrip} className="admin-form">
              <div className="grid-3-cols">
                <div className="form-group">
                  <label>Assign Bus</label>
                  <select
                    name="bus"
                    value={formData.bus}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Fleet Bus</option>
                    {buses.map((b) => (
                      <option key={b._id} value={b._id}>
                        Bus {b.busNumber} ({b.registrationNumber})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Assign Driver</label>
                  <select
                    name="driver"
                    value={formData.driver}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Driver</option>
                    {drivers.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.user?.name || "Driver"} ({d.licenseNumber})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Transit Route</label>
                  <select
                    name="route"
                    value={formData.route}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Route</option>
                    {routes.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.routeNumber} - {r.routeName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button type="submit" className="btn btn-success">
                Confirm & Schedule Dispatch
              </button>
            </form>
          </div>
        )}

        <div className="card">
          <div className="card-header">
            <h3>Dispatched Trips ({filteredTrips.length})</h3>
            <div className="filter-controls">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="select-input"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Now</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {loading ? (
            <Loading message="Fetching trip records..." />
          ) : filteredTrips.length === 0 ? (
            <p className="empty-message">No trips found for selected filter.</p>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Trip ID</th>
                    <th>Route</th>
                    <th>Bus</th>
                    <th>Driver</th>
                    <th>Status</th>
                    <th>Actions</th>
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
                      <td>{trip.driver?.user?.name || trip.driver?.licenseNumber || "Assigned"}</td>
                      <td>
                        <span className={`status-pill ${trip.status}`}>{trip.status}</span>
                      </td>
                      <td>
                        <div className="action-buttons-cell">
                          {trip.status === "scheduled" && (
                            <button
                              onClick={() => handleAction(startTrip, trip._id, "started")}
                              className="btn btn-primary btn-sm"
                            >
                              Start
                            </button>
                          )}
                          {trip.status === "active" && (
                            <button
                              onClick={() => handleAction(endTrip, trip._id, "completed")}
                              className="btn btn-danger btn-sm"
                            >
                              End
                            </button>
                          )}
                          {(trip.status === "scheduled" || trip.status === "active") && (
                            <button
                              onClick={() => handleAction(cancelTrip, trip._id, "cancelled")}
                              className="btn btn-secondary btn-sm"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
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

export default ManageTrips;
