const express = require("express");

const {
  createDriver,
  getDrivers,
  getDriverById,
  updateDriver,
  deleteDriver,
} = require("../controllers/driverController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Create driver
router.post(
  "/",
  protect,
  adminOnly,
  createDriver
);

// Get all drivers
router.get(
  "/",
  protect,
  adminOnly,
  getDrivers
);

// Get driver by ID
router.get(
  "/:id",
  protect,
  getDriverById
);

// Update driver
router.put(
  "/:id",
  protect,
  adminOnly,
  updateDriver
);

// Delete driver
router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteDriver
);

module.exports = router;