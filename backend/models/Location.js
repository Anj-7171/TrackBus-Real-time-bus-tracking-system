const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema(
  {
    bus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bus",
      required: true,
    },

    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },

      coordinates: {
        type: [Number],
        required: true,
      },
    },

    speed: {
      type: Number,
      default: 0,
    },

    heading: {
      type: Number,
      default: 0,
    },

    recordedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

locationSchema.index({
  location: "2dsphere",
});

module.exports = mongoose.model(
  "Location",
  locationSchema
);