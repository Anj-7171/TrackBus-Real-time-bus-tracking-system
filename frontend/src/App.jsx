import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import PassengerDashboard from "./pages/PassengerDashboard";
import DriverDashboard from "./pages/DriverDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ManageBuses from "./pages/ManageBuses";
import ManageDrivers from "./pages/ManageDrivers";
import ManageRoutes from "./pages/ManageRoutes";
import ManageTrips from "./pages/ManageTrips";
import TripHistory from "./pages/TripHistory";
import LiveTracking from "./pages/LiveTracking";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

function RootRedirect() {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role === "admin") {
    return <Navigate to="/admin" replace />;
  }
  if (user.role === "driver") {
    return <Navigate to="/driver" replace />;
  }
  return <Navigate to="/passenger" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Passenger Tracking Routes */}
        <Route
          path="/passenger"
          element={
            <ProtectedRoute role="passenger">
              <PassengerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tracking"
          element={
            <ProtectedRoute role="passenger">
              <LiveTracking />
            </ProtectedRoute>
          }
        />

        {/* Driver Telemetry Routes */}
        <Route
          path="/driver"
          element={
            <ProtectedRoute role="driver">
              <DriverDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin Fleet Management Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/buses"
          element={
            <ProtectedRoute role="admin">
              <ManageBuses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/drivers"
          element={
            <ProtectedRoute role="admin">
              <ManageDrivers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/routes"
          element={
            <ProtectedRoute role="admin">
              <ManageRoutes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/trips"
          element={
            <ProtectedRoute role="admin">
              <ManageTrips />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/history"
          element={
            <ProtectedRoute role="admin">
              <TripHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <TripHistory />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;