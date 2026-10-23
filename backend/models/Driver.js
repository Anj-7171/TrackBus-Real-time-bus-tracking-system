const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    licenseNumber: {
      type: String,
      required: true,
      unique: true,
    },

    phone: String,

    assignedBus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bus",
      default: null,
    },

    status: {
      type: String,
      enum: [
        "available",
        "on_trip",
        "off_duty",
      ],
      default: "available",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Driver",
  driverSchema
);