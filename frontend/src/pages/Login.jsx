import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { login } from "../services/authService";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
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
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Login failed"
      );
    }
  };

  return (
    <div className="auth-container">
      <h1>Bus Tracking System</h1>

      <h2>Login</h2>

      {error && <p>{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;