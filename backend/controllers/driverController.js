const Driver = require("../models/Driver");

const createDriver = async (req, res) => {
  try {
    const driver = await Driver.create(req.body);

    const populatedDriver =
      await Driver.findById(driver._id)
        .populate("user", "name email")
        .populate("assignedBus");

    res.status(201).json(populatedDriver);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find()
      .populate("user", "name email")
      .populate("assignedBus");

    res.json(drivers);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getDriverById = async (req, res) => {
  try {
    const driver = await Driver.findById(
      req.params.id
    )
      .populate("user", "name email")
      .populate("assignedBus");

    if (!driver) {
      return res.status(404).json({
        message: "Driver not found",
      });
    }

    res.json(driver);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateDriver = async (req, res) => {
  try {
    const driver =
      await Driver.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      )
        .populate("user", "name email")
        .populate("assignedBus");

    if (!driver) {
      return res.status(404).json({
        message: "Driver not found",
      });
    }

    res.json(driver);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteDriver = async (req, res) => {
  try {
    const driver =
      await Driver.findByIdAndDelete(
        req.params.id
      );

    if (!driver) {
      return res.status(404).json({
        message: "Driver not found",
      });
    }

    res.json({
      message: "Driver deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createDriver,
  getDrivers,
  getDriverById,
  updateDriver,
  deleteDriver,
};