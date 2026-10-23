const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    bus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bus",
      required: true,
    },

    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      required: true,
    },

    route: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Route",
      required: true,
    },

    startTime: Date,

    endTime: Date,

    status: {
      type: String,
      enum: [
        "scheduled",
        "active",
        "completed",
        "cancelled",
      ],
      default: "scheduled",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Trip",
  tripSchema
);