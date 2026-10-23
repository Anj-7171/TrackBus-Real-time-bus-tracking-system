const Trip = require("../models/Trip");
const Bus = require("../models/Bus");
const Driver = require("../models/Driver");

const createTrip = async (req, res) => {
  try {
    const {
      bus,
      driver,
      route,
      startTime,
    } = req.body;

    const trip = await Trip.create({
      bus,
      driver,
      route,
      startTime,
      status: "scheduled",
    });

    const populatedTrip =
      await Trip.findById(trip._id)
        .populate("bus")
        .populate("driver")
        .populate("route");

    res.status(201).json(populatedTrip);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getTrips = async (req, res) => {
  try {
    const trips = await Trip.find()
      .populate("bus")
      .populate("driver")
      .populate("route")
      .sort({ createdAt: -1 });

    res.json(trips);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(
      req.params.id
    )
      .populate("bus")
      .populate("driver")
      .populate("route");

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found",
      });
    }

    res.json(trip);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const startTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(
      req.params.id
    );

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found",
      });
    }

    trip.status = "active";
    trip.startTime = new Date();

    await trip.save();

    await Bus.findByIdAndUpdate(trip.bus, {
      status: "active",
    });

    await Driver.findByIdAndUpdate(
      trip.driver,
      {
        status: "on_trip",
      }
    );

    const updatedTrip =
      await Trip.findById(trip._id)
        .populate("bus")
        .populate("driver")
        .populate("route");

    res.json(updatedTrip);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const endTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(
      req.params.id
    );

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found",
      });
    }

    trip.status = "completed";
    trip.endTime = new Date();

    await trip.save();

    await Bus.findByIdAndUpdate(trip.bus, {
      status: "inactive",
    });

    await Driver.findByIdAndUpdate(
      trip.driver,
      {
        status: "available",
      }
    );

    const updatedTrip =
      await Trip.findById(trip._id)
        .populate("bus")
        .populate("driver")
        .populate("route");

    res.json(updatedTrip);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const cancelTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(
      req.params.id
    );

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found",
      });
    }

    trip.status = "cancelled";

    await trip.save();

    res.json(trip);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createTrip,
  getTrips,
  getTripById,
  startTrip,
  endTrip,
  cancelTrip,
};