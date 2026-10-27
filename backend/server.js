const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const registerTrackingSocket = require("./sockets/trackingSocket");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Create Express application
const app = express();

// Create HTTP server
const server = http.createServer(app);

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
].filter(Boolean);

// Create Socket.IO server
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// ===============================
// MIDDLEWARE
// ===============================

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Dev-friendly permissive CORS
    },
    credentials: true,
  })
);

app.use(express.json());

// ===============================
// BASIC TEST ROUTE
// ===============================

app.get("/", (req, res) => {
  res.json({
    message: "Real-Time Bus Tracking API is running",
  });
});

// ===============================
// API ROUTES
// ===============================

// Module 1 - Authentication
app.use(
  "/api/auth",
  require("./routes/authRoutes")
);

// Module 2 - Bus Management
app.use(
  "/api/buses",
  require("./routes/busRoutes")
);

// Module 3 - Driver Management
app.use(
  "/api/drivers",
  require("./routes/driverRoutes")
);

// Module 3 - Trip Management
app.use(
  "/api/trips",
  require("./routes/tripRoutes")
);

// Module 4 - Real-Time GPS Tracking
app.use(
  "/api/locations",
  require("./routes/locationRoutes")
);

// Module 5 - Route Management
app.use(
  "/api/routes",
  require("./routes/routeRoutes")
);

// Module 6 - ETA
app.use(
  "/api/eta",
  require("./routes/etaRoutes")
);

// Module 7 - Admin Dashboard
app.use(
  "/api/dashboard",
  require("./routes/dashboardRoutes")
);

// ===============================
// ERROR HANDLING MIDDLEWARE
// ===============================

const { notFound, errorHandler } = require("./middleware/errorMiddleware");
app.use(notFound);
app.use(errorHandler);

// ===============================
// SOCKET.IO
// ===============================

registerTrackingSocket(io);

// ===============================
// SERVER
// ===============================

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});