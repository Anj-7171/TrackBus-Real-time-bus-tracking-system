const express = require("express");

const {
  createTrip,
  getTrips,
  getTripById,
  startTrip,
  endTrip,
  cancelTrip,
} = require("../controllers/tripController");

const {
  protect,
  adminOnly,
  driverOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Create trip
router.post(
  "/",
  protect,
  adminOnly,
  createTrip
);

// Get all trips
router.get(
  "/",
  protect,
  getTrips
);

// Get single trip
router.get(
  "/:id",
  protect,
  getTripById
);

// Start trip
router.put(
  "/:id/start",
  protect,
  driverOnly,
  startTrip
);

// End trip
router.put(
  "/:id/end",
  protect,
  driverOnly,
  endTrip
);

// Cancel trip
router.put(
  "/:id/cancel",
  protect,
  adminOnly,
  cancelTrip
);

module.exports = router;