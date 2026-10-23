const express = require("express");

const {
  updateLocation,
  getLatestLocation,
} = require("../controllers/locationController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Receive GPS location
router.post(
  "/",
  protect,
  updateLocation
);

// Get latest location of a bus
router.get(
  "/:busId/latest",
  protect,
  getLatestLocation
);

module.exports = router;