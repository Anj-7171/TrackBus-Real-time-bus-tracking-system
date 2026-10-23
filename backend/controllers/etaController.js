const Location = require("../models/Location");
const Bus = require("../models/Bus");
const calculateETA = require("../utils/calculateETA");

const getBusETA = async (req, res) => {
  try {
    const bus = await Bus.findById(
      req.params.busId
    );

    if (!bus) {
      return res.status(404).json({
        message: "Bus not found",
      });
    }

    const latestLocation =
      await Location.findOne({
        bus: req.params.busId,
      }).sort({
        recordedAt: -1,
      });

    if (!latestLocation) {
      return res.status(404).json({
        message:
          "No location data available for this bus",
      });
    }

    /*
      For the initial implementation,
      distanceKm can be supplied as a query parameter.

      Example:
      /api/eta/busId?distanceKm=5
    */

    const distanceKm = Number(
      req.query.distanceKm
    );

    if (
      !distanceKm ||
      distanceKm <= 0
    ) {
      return res.status(400).json({
        message:
          "Please provide a valid distanceKm",
      });
    }

    const speed =
      latestLocation.speed || 0;

    const eta = calculateETA(
      distanceKm,
      speed
    );

    res.json({
      busId: bus._id,
      busNumber: bus.busNumber,
      distanceKm,
      speedKmPerHour: speed,
      etaMinutes: eta,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getBusETA,
};