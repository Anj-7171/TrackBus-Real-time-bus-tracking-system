import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Loading from "../components/Loading";
import { getRoutes, createRoute, deleteRoute } from "../services/routeService";

function ManageRoutes() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState({
    routeNumber: "",
    routeName: "",
    stops: [
      { name: "Terminal A", latitude: 12.9692, longitude: 79.1559, order: 1 },
      { name: "Central Station", latitude: 12.973, longitude: 79.162, order: 2 },
    ],
  });

  const fetchRoutesList = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getRoutes();
      setRoutes(data);
    } catch (err) {
      setError("Failed to fetch routes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutesList();
  }, []);

  const handleStopChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedStops = [...prev.stops];
      updatedStops[index] = {
        ...updatedStops[index],
        [field]: value,
      };
      return { ...prev, stops: updatedStops };
    });
  };

  const addStopRow = () => {
    setFormData((prev) => ({
      ...prev,
      stops: [
        ...prev.stops,
        {
          name: `Stop ${prev.stops.length + 1}`,
          latitude: 12.975 + prev.stops.length * 0.003,
          longitude: 79.165 + prev.stops.length * 0.003,
          order: prev.stops.length + 1,
        },
      ],
    }));
  };

  const removeStopRow = (index) => {
    setFormData((prev) => ({
      ...prev,
      stops: prev.stops.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.routeNumber || !formData.routeName) {
      setError("Route number and name are required.");
      return;
    }

    try {
      setError("");
      setSuccess("");

      const payload = {
        routeNumber: formData.routeNumber,
        routeName: formData.routeName,
        stops: formData.stops.map((s, idx) => ({
          name: s.name,
          order: idx + 1,
          location: {
            type: "Point",
            coordinates: [parseFloat(s.longitude) || 0, parseFloat(s.latitude) || 0],
          },
        })),
      };

      await createRoute(payload);
      setSuccess(`Route ${formData.routeNumber} saved successfully.`);
      setShowAddForm(false);
      setFormData({
        routeNumber: "",
        routeName: "",
        stops: [
          { name: "Terminal A", latitude: 12.9692, longitude: 79.1559, order: 1 },
          { name: "Central Station", latitude: 12.973, longitude: 79.162, order: 2 },
        ],
      });
      fetchRoutesList();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create route.");
    }
  };

  const handleDelete = async (id, num) => {
    if (!window.confirm(`Delete route ${num}?`)) return;

    try {
      setError("");
      await deleteRoute(id);
      setSuccess(`Route ${num} removed.`);
      fetchRoutesList();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete route.");
    }
  };

  return (
    <div className="dashboard-layout">
      <Navbar />

      <main className="dashboard-content">
        <div className="page-header">
          <div>
            <h1>Transit Route Network</h1>
            <p>Design bus routes, configure scheduled stops, and coordinate paths</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn btn-primary"
          >
            {showAddForm ? "✕ Close Form" : "➕ Create Route"}
          </button>
        </div>

        {error && <div className="alert-box error">{error}</div>}
        {success && <div className="alert-box success">{success}</div>}

        {showAddForm && (
          <div className="card form-card">
            <div className="card-header">
              <h3>Create New Route with Stops</h3>
            </div>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="grid-2-cols">
                <div className="form-group">
                  <label>Route Number / Code</label>
                  <input
                    value={formData.routeNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, routeNumber: e.target.value })
                    }
                    placeholder="e.g. RT-202"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Route Name / Description</label>
                  <input
                    value={formData.routeName}
                    onChange={(e) =>
                      setFormData({ ...formData, routeName: e.target.value })
                    }
                    placeholder="e.g. North Campus - Downtown Metro"
                    required
                  />
                </div>
              </div>

              <div className="stops-management">
                <div className="stops-header">
                  <h4>Designated Route Stops ({formData.stops.length})</h4>
                  <button
                    type="button"
                    onClick={addStopRow}
                    className="btn btn-sm btn-secondary"
                  >
                    ➕ Add Another Stop
                  </button>
                </div>

                {formData.stops.map((stop, index) => (
                  <div key={index} className="stop-input-row">
                    <span className="stop-index">#{index + 1}</span>
                    <input
                      placeholder="Stop Name"
                      value={stop.name}
                      onChange={(e) =>
                        handleStopChange(index, "name", e.target.value)
                      }
                      required
                    />
                    <input
                      type="number"
                      step="0.0001"
                      placeholder="Lat"
                      value={stop.latitude}
                      onChange={(e) =>
                        handleStopChange(index, "latitude", e.target.value)
                      }
                      required
                    />
                    <input
                      type="number"
                      step="0.0001"
                      placeholder="Lng"
                      value={stop.longitude}
                      onChange={(e) =>
                        handleStopChange(index, "longitude", e.target.value)
                      }
                      required
                    />
                    {formData.stops.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeStopRow(index)}
                        className="btn-danger btn-sm"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button type="submit" className="btn btn-success">
                Save Complete Route
              </button>
            </form>
          </div>
        )}

        <div className="card">
          <div className="card-header">
            <h3>Registered Transit Routes ({routes.length})</h3>
          </div>

          {loading ? (
            <Loading message="Fetching routes from MongoDB..." />
          ) : routes.length === 0 ? (
            <p className="empty-message">No routes created yet.</p>
          ) : (
            <div className="routes-list-grid">
              {routes.map((route) => (
                <div key={route._id} className="route-detail-card">
                  <div className="route-card-header">
                    <div>
                      <span className="route-badge">{route.routeNumber}</span>
                      <h4>{route.routeName}</h4>
                    </div>
                    <button
                      onClick={() => handleDelete(route._id, route.routeNumber)}
                      className="btn-danger btn-sm"
                    >
                      Delete
                    </button>
                  </div>

                  <div className="route-stops-preview">
                    <strong>{route.stops?.length || 0} Stops:</strong>
                    <div className="stops-chain">
                      {route.stops?.map((stop, i) => (
                        <span key={stop._id || i} className="stop-chip">
                          {stop.name}
                          {i < route.stops.length - 1 ? " ➔ " : ""}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default ManageRoutes;
