const Location = require("../models/Location");
const Bus = require("../models/Bus");
const calculateETA = require("../utils/calculateETA");
const { haversineDistanceKm } = require("../utils/calculateETA");

const getBusETA = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.busId);

    if (!bus) {
      return res.status(404).json({
        message: "Bus not found",
      });
    }

    const latestLocation = await Location.findOne({
      bus: req.params.busId,
    }).sort({
      recordedAt: -1,
    });

    const busCoords =
      latestLocation?.location?.coordinates ||
      (bus.currentLocation?.coordinates &&
      (bus.currentLocation.coordinates[0] !== 0 || bus.currentLocation.coordinates[1] !== 0)
        ? bus.currentLocation.coordinates
        : null);

    let distanceKm = req.query.distanceKm ? Number(req.query.distanceKm) : null;

    // Automatic geodesic coordinate-based ETA calculation
    if ((!distanceKm || distanceKm <= 0) && req.query.destLat && req.query.destLng && busCoords) {
      const busLng = busCoords[0];
      const busLat = busCoords[1];
      const destLat = parseFloat(req.query.destLat);
      const destLng = parseFloat(req.query.destLng);

      distanceKm = haversineDistanceKm(busLat, busLng, destLat, destLng);
    }

    // Default fallback distance if neither was provided
    if (!distanceKm || distanceKm <= 0) {
      distanceKm = 3.5;
    }

    const speed = latestLocation?.speed || 25;
    const etaMinutes = calculateETA(distanceKm, speed);

    res.json({
      busId: bus._id,
      busNumber: bus.busNumber,
      distanceKm: parseFloat(distanceKm.toFixed(2)),
      speedKmPerHour: speed,
      etaMinutes,
      busLocation: busCoords ? { lat: busCoords[1], lng: busCoords[0] } : null,
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