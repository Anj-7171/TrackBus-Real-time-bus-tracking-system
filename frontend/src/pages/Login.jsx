import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const data = await login(email, password);
      loginUser(data);

      if (data.user.role === "admin") {
        navigate("/admin");
      } else if (data.user.role === "driver") {
        navigate("/driver");
      } else {
        navigate("/passenger");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">🚌</div>
          <h2>Welcome Back</h2>
          <p>Real-Time Bus Tracking System</p>
        </div>

        {error && <div className="alert-box error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Authenticating..." : "Sign In"}
          </button>

          <div style={{ marginTop: "16px", padding: "12px", background: "rgba(241, 245, 249, 0.7)", borderRadius: "8px", border: "1px dashed #cbd5e1" }}>
            <p style={{ margin: "0 0 8px", fontSize: "12px", fontWeight: "600", color: "#64748b", textAlign: "center" }}>
              ⚡ Quick Demo Credentials
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
              <button
                type="button"
                onClick={() => handleDemoFill("demoadmin@test.com", "password123")}
                style={{ padding: "6px 4px", fontSize: "11px", background: "#4f46e5", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}
              >
                👑 Admin
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill("demodriver@test.com", "password123")}
                style={{ padding: "6px 4px", fontSize: "11px", background: "#059669", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}
              >
                🎮 Driver
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill("demopassenger@test.com", "password123")}
                style={{ padding: "6px 4px", fontSize: "11px", background: "#0284c7", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}
              >
                🧑 Passenger
              </button>
            </div>
          </div>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;