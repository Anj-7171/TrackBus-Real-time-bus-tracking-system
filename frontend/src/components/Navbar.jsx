import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { socket } from "../services/socketService";

function Navbar() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [socketConnected, setSocketConnected] = useState(socket.connected);

  useEffect(() => {
    const onConnect = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <header className="app-navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🚌</span>
          <span className="brand-name">TrackBus</span>
          <span className="brand-tag">Real-Time</span>
        </Link>

        <nav className="nav-links">
          {user.role === "admin" && (
            <>
              <Link
                to="/admin"
                className={`nav-link ${location.pathname === "/admin" ? "active" : ""}`}
              >
                📊 Dashboard
              </Link>
              <Link
                to="/admin/buses"
                className={`nav-link ${location.pathname.startsWith("/admin/buses") ? "active" : ""}`}
              >
                🚍 Buses
              </Link>
              <Link
                to="/admin/drivers"
                className={`nav-link ${location.pathname.startsWith("/admin/drivers") ? "active" : ""}`}
              >
                👨‍✈️ Drivers
              </Link>
              <Link
                to="/admin/routes"
                className={`nav-link ${location.pathname.startsWith("/admin/routes") ? "active" : ""}`}
              >
                🗺️ Routes
              </Link>
              <Link
                to="/admin/trips"
                className={`nav-link ${location.pathname.startsWith("/admin/trips") ? "active" : ""}`}
              >
                🕒 Trips
              </Link>
              <Link
                to="/admin/history"
                className={`nav-link ${location.pathname.startsWith("/admin/history") ? "active" : ""}`}
              >
                📜 History
              </Link>
              <Link
                to="/passenger"
                className={`nav-link ${location.pathname === "/passenger" ? "active" : ""}`}
              >
                📍 Live Map
              </Link>
            </>
          )}

          {user.role === "driver" && (
            <>
              <Link
                to="/driver"
                className={`nav-link ${location.pathname === "/driver" ? "active" : ""}`}
              >
                🎮 Driver Console
              </Link>
              <Link
                to="/passenger"
                className={`nav-link ${location.pathname === "/passenger" ? "active" : ""}`}
              >
                📍 Live Fleet Map
              </Link>
              <Link
                to="/history"
                className={`nav-link ${location.pathname === "/history" ? "active" : ""}`}
              >
                📜 Trip History
              </Link>
            </>
          )}

          {user.role === "passenger" && (
            <>
              <Link
                to="/passenger"
                className={`nav-link ${location.pathname === "/passenger" ? "active" : ""}`}
              >
                📍 Live Tracking
              </Link>
              <Link
                to="/history"
                className={`nav-link ${location.pathname === "/history" ? "active" : ""}`}
              >
                📜 Trip History
              </Link>
            </>
          )}
        </nav>
      </div>

      <div className="navbar-right">
        <div
          className={`socket-badge ${socketConnected ? "connected" : "disconnected"}`}
          title={socketConnected ? "Live WebSocket Connected" : "Connecting to WebSocket..."}
        >
          <span className="dot"></span>
          <span className="label">{socketConnected ? "Live Sync" : "Reconnecting"}</span>
        </div>

        <div className="user-profile">
          <div className="user-avatar">
            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="user-info">
            <span className="user-name">{user.name}</span>
            <span className={`role-badge role-${user.role}`}>{user.role}</span>
          </div>
        </div>

        <button onClick={handleLogout} className="logout-btn" title="Sign out">
          Sign out
        </button>
      </div>
    </header>
  );
}

export default Navbar;
