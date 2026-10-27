const express = require("express");

const {
  createBus,
  getBuses,
  getBusById,
  getNearbyBuses,
  updateBus,
  deleteBus,
} = require("../controllers/busController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/",
  protect,
  adminOnly,
  createBus
);

router.get(
  "/",
  protect,
  getBuses
);

// MongoDB Geospatial $near search route
router.get(
  "/nearby",
  protect,
  getNearbyBuses
);

router.get(
  "/:id",
  protect,
  getBusById
);

router.put(
  "/:id",
  protect,
  adminOnly,
  updateBus
);

router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteBus
);

module.exports = router;