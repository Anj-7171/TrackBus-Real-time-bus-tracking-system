const express = require("express");

const {
  createRoute,
  getRoutes,
  getRoute,
  updateRoute,
  deleteRoute,
} = require("../controllers/routeController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/",
  protect,
  adminOnly,
  createRoute
);

router.get(
  "/",
  protect,
  getRoutes
);

router.get(
  "/:id",
  protect,
  getRoute
);

router.put(
  "/:id",
  protect,
  adminOnly,
  updateRoute
);

router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteRoute
);

module.exports = router;