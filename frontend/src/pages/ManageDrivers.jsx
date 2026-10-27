import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Loading from "../components/Loading";
import { getDrivers, createDriver, deleteDriver } from "../services/driverService";
import { getBuses } from "../services/busService";

function ManageDrivers() {
  const [drivers, setDrivers] = useState([]);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    licenseNumber: "",
    phone: "",
    assignedBus: "",
    password: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const [driversData, busesData] = await Promise.all([
        getDrivers().catch(() => []),
        getBuses().catch(() => []),
      ]);
      setDrivers(driversData);
      setBuses(busesData);
    } catch (err) {
      setError("Failed to load drivers.");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.licenseNumber) {
      setError("Name, email, and license number are required.");
      return;
    }

    try {
      setError("");
      setSuccess("");

      const payload = {
        name: formData.name,
        email: formData.email,
        licenseNumber: formData.licenseNumber,
        phone: formData.phone,
        password: formData.password || "driver123",
        assignedBus: formData.assignedBus || null,
        status: "available",
      };

      await createDriver(payload);
      setSuccess(`Driver ${formData.name} registered successfully.`);
      setShowAddForm(false);
      setFormData({
        name: "",
        email: "",
        licenseNumber: "",
        phone: "",
        assignedBus: "",
        password: "",
      });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add driver.");
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove driver ${name}?`)) return;

    try {
      setError("");
      await deleteDriver(id);
      setSuccess(`Driver ${name} removed.`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete driver.");
    }
  };

  return (
    <div className="dashboard-layout">
      <Navbar />

      <main className="dashboard-content">
        <div className="page-header">
          <div>
            <h1>Driver Roster Management</h1>
            <p>Manage licensed transit operators, assignments, and status</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn btn-primary"
          >
            {showAddForm ? "✕ Close Form" : "➕ Register Driver"}
          </button>
        </div>

        {error && <div className="alert-box error">{error}</div>}
        {success && <div className="alert-box success">{success}</div>}

        {showAddForm && (
          <div className="card form-card">
            <div className="card-header">
              <h3>Register New Transit Driver</h3>
            </div>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="grid-2-cols">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    name="name"
                    placeholder="e.g. Robert Miles"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email (Login)</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="e.g. robert@transit.org"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid-2-cols">
                <div className="form-group">
                  <label>License Number</label>
                  <input
                    name="licenseNumber"
                    placeholder="e.g. DL-2026-9988"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    name="phone"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid-2-cols">
                <div className="form-group">
                  <label>Assigned Bus</label>
                  <select
                    name="assignedBus"
                    value={formData.assignedBus}
                    onChange={handleChange}
                  >
                    <option value="">Unassigned</option>
                    {buses.map((b) => (
                      <option key={b._id} value={b._id}>
                        Bus {b.busNumber} ({b.registrationNumber})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Login Password</label>
                  <input
                    name="password"
                    type="password"
                    placeholder="Defaults to driver123"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-success">
                Create Driver Account
              </button>
            </form>
          </div>
        )}

        <div className="card">
          <div className="card-header">
            <h3>Registered Drivers ({drivers.length})</h3>
          </div>

          {loading ? (
            <Loading message="Fetching drivers..." />
          ) : drivers.length === 0 ? (
            <p className="empty-message">No drivers registered yet.</p>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Driver Name</th>
                    <th>Email</th>
                    <th>License #</th>
                    <th>Phone</th>
                    <th>Assigned Bus</th>
                    <th>Duty Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {drivers.map((d) => (
                    <tr key={d._id}>
                      <td><strong>{d.user?.name || "Driver"}</strong></td>
                      <td>{d.user?.email || "—"}</td>
                      <td>{d.licenseNumber}</td>
                      <td>{d.phone || "—"}</td>
                      <td>
                        {d.assignedBus
                          ? `Bus ${d.assignedBus.busNumber} (${d.assignedBus.registrationNumber})`
                          : "None"}
                      </td>
                      <td>
                        <span className={`status-pill ${d.status}`}>
                          {d.status}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleDelete(d._id, d.user?.name || "driver")}
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

export default ManageDrivers;
