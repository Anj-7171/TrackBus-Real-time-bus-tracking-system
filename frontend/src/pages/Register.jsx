import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../services/authService";
import { useAuth } from "../context/AuthContext";

function Register() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "passenger",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const data = await register(formData);
      loginUser(data);

      if (data.user.role === "admin") {
        navigate("/admin");
      } else if (data.user.role === "driver") {
        navigate("/driver");
      } else {
        navigate("/passenger");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">🚌</div>
          <h2>Create Account</h2>
          <p>Join TrackBus real-time tracking network</p>
        </div>

        {error && <div className="alert-box error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="e.g. Alex Johnson"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="e.g. alex@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="passenger">Passenger</option>
              <option value="driver">Driver</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login">Log in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
