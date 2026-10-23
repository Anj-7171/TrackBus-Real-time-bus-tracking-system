const express = require("express");

const {
  createBus,
  getBuses,
  getBusById,
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