const Location = require("../models/Location");
const Bus = require("../models/Bus");

const updateLocation = async (req, res) => {
  try {
    const {
      busId,
      tripId,
      latitude,
      longitude,
      speed,
      heading,
    } = req.body;

    const location = await Location.create({
      bus: busId,
      trip: tripId,
      location: {
        type: "Point",
        coordinates: [
          longitude,
          latitude,
        ],
      },
      speed,
      heading,
    });

    await Bus.findByIdAndUpdate(busId, {
      currentLocation: {
        type: "Point",
        coordinates: [
          longitude,
          latitude,
        ],
      },
      status: "active",
    });

    res.status(201).json(location);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getLatestLocation = async (req, res) => {
  try {
    const location = await Location.findOne({
      bus: req.params.busId,
    }).sort({
      recordedAt: -1,
    });

    res.json(location);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  updateLocation,
  getLatestLocation,
};