const Route = require("../models/Route");

const createRoute = async (req, res) => {
  try {
    const route = await Route.create(req.body);

    res.status(201).json(route);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getRoutes = async (req, res) => {
  try {
    const routes = await Route.find();

    res.json(routes);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getRoute = async (req, res) => {
  try {
    const route = await Route.findById(
      req.params.id
    );

    res.json(route);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateRoute = async (req, res) => {
  try {
    const route = await Route.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.json(route);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteRoute = async (req, res) => {
  try {
    await Route.findByIdAndDelete(
      req.params.id
    );

    res.json({
      message: "Route deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createRoute,
  getRoutes,
  getRoute,
  updateRoute,
  deleteRoute,
};