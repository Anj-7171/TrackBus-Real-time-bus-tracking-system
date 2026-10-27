import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Loading from "../components/Loading";
import { getBuses, createBus, deleteBus } from "../services/busService";

function ManageBuses() {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    busNumber: "",
    registrationNumber: "",
    capacity: 40,
    status: "inactive",
    latitude: 12.9692,
    longitude: 79.1559,
  });

  const [showAddForm, setShowAddForm] = useState(false);

  const fetchBusesList = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getBuses();
      setBuses(data);
    } catch (err) {
      setError("Failed to load buses from backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusesList();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.busNumber || !formData.registrationNumber) {
      setError("Bus number and registration number are required.");
      return;
    }

    try {
      setError("");
      setSuccess("");

      const payload = {
        busNumber: formData.busNumber,
        registrationNumber: formData.registrationNumber,
        capacity: Number(formData.capacity) || 40,
        status: formData.status,
        currentLocation: {
          type: "Point",
          coordinates: [
            parseFloat(formData.longitude) || 0,
            parseFloat(formData.latitude) || 0,
          ],
        },
      };

      await createBus(payload);
      setSuccess(`Bus ${formData.busNumber} added successfully.`);
      setShowAddForm(false);
      setFormData({
        busNumber: "",
        registrationNumber: "",
        capacity: 40,
        status: "inactive",
        latitude: 12.9692,
        longitude: 79.1559,
      });
      fetchBusesList();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add bus.");
    }
  };

  const handleDelete = async (id, busNumber) => {
    if (!window.confirm(`Are you sure you want to delete bus ${busNumber}?`)) return;

    try {
      setError("");
      await deleteBus(id);
      setSuccess(`Bus ${busNumber} removed.`);
      fetchBusesList();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete bus.");
    }
  };

  return (
    <div className="dashboard-layout">
      <Navbar />

      <main className="dashboard-content">
        <div className="page-header">
          <div>
            <h1>Bus Fleet Management</h1>
            <p>Register, inspect, and update buses in the system</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn btn-primary"
          >
            {showAddForm ? "✕ Close Form" : "➕ Add New Bus"}
          </button>
        </div>

        {error && <div className="alert-box error">{error}</div>}
        {success && <div className="alert-box success">{success}</div>}

        {showAddForm && (
          <div className="card form-card">
            <div className="card-header">
              <h3>Register New Bus</h3>
            </div>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="grid-2-cols">
                <div className="form-group">
                  <label>Bus Number</label>
                  <input
                    name="busNumber"
                    placeholder="e.g. 104"
                    value={formData.busNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Registration Number</label>
                  <input
                    name="registrationNumber"
                    placeholder="e.g. TN-23-AX-5555"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid-2-cols">
                <div className="form-group">
                  <label>Passenger Capacity</label>
                  <input
                    name="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Initial Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="inactive">Inactive</option>
                    <option value="active">Active</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="grid-2-cols">
                <div className="form-group">
                  <label>Initial Latitude</label>
                  <input
                    name="latitude"
                    type="number"
                    step="0.0001"
                    value={formData.latitude}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Initial Longitude</label>
                  <input
                    name="longitude"
                    type="number"
                    step="0.0001"
                    value={formData.longitude}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-success">
                Save Bus to Fleet
              </button>
            </form>
          </div>
        )}

        <div className="card">
          <div className="card-header">
            <h3>Registered Fleet ({buses.length})</h3>
          </div>

          {loading ? (
            <Loading message="Fetching bus fleet from MongoDB..." />
          ) : buses.length === 0 ? (
            <p className="empty-message">No buses registered yet. Click "Add New Bus" to start.</p>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Bus #</th>
                    <th>Registration</th>
                    <th>Capacity</th>
                    <th>Status</th>
                    <th>GPS Coordinates [Lng, Lat]</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {buses.map((bus) => (
                    <tr key={bus._id}>
                      <td><strong>Bus {bus.busNumber}</strong></td>
                      <td>{bus.registrationNumber}</td>
                      <td>{bus.capacity} seats</td>
                      <td>
                        <span className={`status-pill ${bus.status}`}>
                          {bus.status}
                        </span>
                      </td>
                      <td>
                        {bus.currentLocation?.coordinates
                          ? `[${bus.currentLocation.coordinates[0].toFixed(4)}, ${bus.currentLocation.coordinates[1].toFixed(4)}]`
                          : "No coordinates"}
                      </td>
                      <td>
                        <button
                          onClick={() => handleDelete(bus._id, bus.busNumber)}
                          className="btn-danger btn-sm"
                        >
                          Delete
                        </button>
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

export default ManageBuses;
