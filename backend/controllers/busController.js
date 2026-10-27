const Bus = require("../models/Bus");

const createBus = async (req, res) => {
  try {
    const bus = await Bus.create(req.body);

    res.status(201).json(bus);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getBuses = async (req, res) => {
  try {
    const buses = await Bus.find();

    res.json(buses);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getBusById = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);

    if (!bus) {
      return res.status(404).json({
        message: "Bus not found",
      });
    }

    res.json(bus);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateBus = async (req, res) => {
  try {
    const bus = await Bus.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.json(bus);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteBus = async (req, res) => {
  try {
    await Bus.findByIdAndDelete(req.params.id);

    res.json({
      message: "Bus deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getNearbyBuses = async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 5000 } = req.query;

    if (longitude === undefined || latitude === undefined) {
      return res.status(400).json({
        message: "Please provide both longitude and latitude coordinates",
      });
    }

    const lng = parseFloat(longitude);
    const lat = parseFloat(latitude);
    const distanceMeters = parseInt(maxDistance, 10);

    // MongoDB 2dsphere geospatial query with $near operator
    const buses = await Bus.find({
      currentLocation: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
          $maxDistance: distanceMeters,
        },
      },
    });

    res.json(buses);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createBus,
  getBuses,
  getBusById,
  getNearbyBuses,
  updateBus,
  deleteBus,
};