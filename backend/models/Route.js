const mongoose = require("mongoose");

const routeSchema = new mongoose.Schema(
  {
    routeNumber: {
      type: String,
      required: true,
      unique: true,
    },

    routeName: {
      type: String,
      required: true,
    },

    stops: [
      {
        name: String,

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

        order: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Route",
  routeSchema
);