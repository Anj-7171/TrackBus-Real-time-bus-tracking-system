const mongoose = require("mongoose");

const busSchema = new mongoose.Schema(
  {
    busNumber: {
      type: String,
      required: true,
      unique: true,
    },

    registrationNumber: {
      type: String,
      required: true,
      unique: true,
    },

    capacity: {
      type: Number,
      default: 40,
    },

    status: {
      type: String,
      enum: [
        "active",
        "inactive",
        "maintenance",
      ],
      default: "inactive",
    },

    currentLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },

      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
  },
  {
    timestamps: true,
  }
);

busSchema.index({
  currentLocation: "2dsphere",
});

module.exports = mongoose.model("Bus", busSchema);