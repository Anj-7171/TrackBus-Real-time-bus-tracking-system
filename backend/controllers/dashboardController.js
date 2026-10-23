const User = require("../models/User");
const Bus = require("../models/Bus");
const Driver = require("../models/Driver");
const Trip = require("../models/Trip");

const getDashboardStats = async (
  req,
  res
) => {
  try {
    const [
      totalUsers,
      totalBuses,
      totalDrivers,
      totalTrips,
      activeTrips,
    ] = await Promise.all([
      User.countDocuments(),
      Bus.countDocuments(),
      Driver.countDocuments(),
      Trip.countDocuments(),

      Trip.countDocuments({
        status: "active",
      }),
    ]);

    res.json({
      totalUsers,
      totalBuses,
      totalDrivers,
      totalTrips,
      activeTrips,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
};