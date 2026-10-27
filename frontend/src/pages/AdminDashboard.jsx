import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Loading from "../components/Loading";
import { getDashboardStats } from "../services/dashboardService";
import { getBuses, createBus } from "../services/busService";
import { getRoutes, createRoute } from "../services/routeService";
import { getTrips } from "../services/tripService";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentBuses, setRecentBuses] = useState([]);
  const [recentTrips, setRecentTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [statsData, busesData, tripsData] = await Promise.all([
        getDashboardStats().catch(() => ({
          totalUsers: 0,
          totalBuses: 0,
          totalDrivers: 0,
          totalTrips: 0,
          activeTrips: 0,
        })),
        getBuses().catch(() => []),
        getTrips().catch(() => []),
      ]);

      setStats(statsData);
      setRecentBuses(busesData);
      setRecentTrips(tripsData);
    } catch (err) {
      setError("Failed to fetch dashboard statistics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSeedDemoData = async () => {
    try {
      setSeeding(true);
      setMessage("");
      setError("");

      // Create Route 1: Campus Express
      const route1 = await createRoute({
        routeNumber: "RT-101",
        routeName: "Campus Main Express",
        stops: [
          {
            name: "Main University Gate",
            order: 1,
            location: { type: "Point", coordinates: [79.1559, 12.9692] },
          },
          {
            name: "Library Square",
            order: 2,
            location: { type: "Point", coordinates: [79.1595, 12.9721] },
          },
          {
            name: "Tech Park Block 5",
            order: 3,
            location: { type: "Point", coordinates: [79.164, 12.975] },
          },
          {
            name: "Student Hostels & Cafeteria",
            order: 4,
            location: { type: "Point", coordinates: [79.168, 12.978] },
          },
        ],
      });

      // Create Buses
      await createBus({
        busNumber: "101",
        registrationNumber: "TN-23-AX-1010",
        capacity: 45,
        status: "active",
        currentLocation: {
          type: "Point",
          coordinates: [79.1559, 12.9692],
        },
      });

      await createBus({
        busNumber: "102",
        registrationNumber: "TN-23-AX-1020",
        capacity: 50,
        status: "active",
        currentLocation: {
          type: "Point",
          coordinates: [79.164, 12.975],
        },
      });

      setMessage("Demo transit data (Routes & Buses) created successfully!");
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to seed demo transit data.");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Navbar />

      <main className="dashboard-content">
        <div className="page-header">
          <div>
            <h1>Admin Fleet Overview</h1>
            <p>Manage transit operations, telemetry services, drivers, and route schedules</p>
          </div>

          <div className="admin-actions">
            <button
              onClick={handleSeedDemoData}
              disabled={seeding}
              className="btn btn-secondary"
            >
              {seeding ? "Creating demo data..." : "🌱 Seed Demo Fleet Data"}
            </button>
            <Link to="/passenger" className="btn btn-primary">
              🗺️ Open Live Map
            </Link>
          </div>
        </div>

        {error && <div className="alert-box error">{error}</div>}
        {message && <div className="alert-box success">{message}</div>}

        {loading ? (
          <Loading message="Compiling fleet statistics from MongoDB..." />
        ) : (
          <>
            {/* KPI Stat Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">🚍</div>
                <div className="stat-data">
                  <span className="stat-number">{stats?.totalBuses ?? 0}</span>
                  <span className="stat-label">Total Buses</span>
                </div>
                <Link to="/admin/buses" className="stat-link">Manage →</Link>
              </div>

              <div className="stat-card active-card">
                <div className="stat-icon">🟢</div>
                <div className="stat-data">
                  <span className="stat-number">{stats?.activeTrips ?? 0}</span>
                  <span className="stat-label">Active Live Trips</span>
                </div>
                <Link to="/admin/trips" className="stat-link">View Trips →</Link>
              </div>

              <div className="stat-card">
                <div className="stat-icon">👨‍✈️</div>
                <div className="stat-data">
                  <span className="stat-number">{stats?.totalDrivers ?? 0}</span>
                  <span className="stat-label">Registered Drivers</span>
                </div>
                <Link to="/admin/drivers" className="stat-link">Manage →</Link>
              </div>

              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-data">
                  <span className="stat-number">{stats?.totalUsers ?? 0}</span>
                  <span className="stat-label">Total Users</span>
                </div>
                <span className="stat-sub">Passengers & Staff</span>
              </div>
            </div>

            {/* Quick Navigation Panels */}
            <div className="admin-modules-grid">
              <div className="card">
                <div className="card-header">
                  <h3>Fleet Management Shortcuts</h3>
                </div>
                <div className="shortcuts-grid">
                  <Link to="/admin/buses" className="shortcut-card">
                    <span className="icon">🚍</span>
                    <h4>Manage Buses</h4>
                    <p>Add, edit or retire buses in the fleet</p>
                  </Link>

                  <Link to="/admin/drivers" className="shortcut-card">
                    <span className="icon">👨‍✈️</span>
                    <h4>Manage Drivers</h4>
                    <p>Assign drivers to buses and view credentials</p>
                  </Link>

                  <Link to="/admin/routes" className="shortcut-card">
                    <span className="icon">🗺️</span>
                    <h4>Manage Routes</h4>
                    <p>Configure route stops and geofence coordinates</p>
                  </Link>

                  <Link to="/admin/trips" className="shortcut-card">
                    <span className="icon">🕒</span>
                    <h4>Schedule Trips</h4>
                    <p>Dispatch buses on designated routes</p>
                  </Link>
                </div>
              </div>

              {/* Recent Fleet Status */}
              <div className="card">
                <div className="card-header">
                  <h3>Fleet Registry Preview ({recentBuses.length})</h3>
                  <Link to="/admin/buses" className="btn-sm">All Buses</Link>
                </div>

                <div className="table-responsive">
                  {recentBuses.length === 0 ? (
                    <p className="empty-message">
                      No buses added yet. Click "Seed Demo Fleet Data" above or add a bus.
                    </p>
                  ) : (
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Bus #</th>
                          <th>Reg Number</th>
                          <th>Capacity</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentBuses.slice(0, 5).map((b) => (
                          <tr key={b._id}>
                            <td><strong>{b.busNumber}</strong></td>
                            <td>{b.registrationNumber}</td>
                            <td>{b.capacity} seats</td>
                            <td>
                              <span className={`status-pill ${b.status}`}>
                                {b.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;
