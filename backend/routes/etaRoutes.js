const express = require("express");

const {
  getBusETA,
} = require("../controllers/etaController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/:busId",
  protect,
  getBusETA
);

module.exports = router;