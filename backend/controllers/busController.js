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

module.exports = {
  createBus,
  getBuses,
  getBusById,
  updateBus,
  deleteBus,
};