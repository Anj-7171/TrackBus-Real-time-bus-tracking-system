const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Bus = require("../models/Bus");
const Driver = require("../models/Driver");
const Route = require("../models/Route");
const Trip = require("../models/Trip");
const Location = require("../models/Location");

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/bus_tracking");
    console.log("Connected to MongoDB for database seeding...");

    // Clear existing collections
    await User.deleteMany();
    await Bus.deleteMany();
    await Driver.deleteMany();
    await Route.deleteMany();
    await Trip.deleteMany();
    await Location.deleteMany();
    console.log("Cleared existing data.");

    // 1. Create Users
    const passwordHash = await bcrypt.hash("password123", 10);

    const adminUser = await User.create({
      name: "System Administrator",
      email: "demoadmin@test.com",
      password: passwordHash,
      role: "admin",
    });

    const driverUser = await User.create({
      name: "Marcus Vance",
      email: "demodriver@test.com",
      password: passwordHash,
      role: "driver",
    });

    const passengerUser = await User.create({
      name: "Sarah Connor",
      email: "demopassenger@test.com",
      password: passwordHash,
      role: "passenger",
    });

    console.log("Created users (Admin, Driver, Passenger).");

    // 2. Create Routes
    const campusRoute = await Route.create({
      routeNumber: "RT-101",
      routeName: "Campus Main Express",
      stops: [
        {
          name: "Main University Gate",
          order: 1,
          location: { type: "Point", coordinates: [79.1559, 12.9692] },
        },
        {
          name: "Library Square",
          order: 2,
          location: { type: "Point", coordinates: [79.1595, 12.9721] },
        },
        {
          name: "Tech Park Block 5",
          order: 3,
          location: { type: "Point", coordinates: [79.164, 12.975] },
        },
        {
          name: "Hostels & Cafeteria Hub",
          order: 4,
          location: { type: "Point", coordinates: [79.168, 12.978] },
        },
      ],
    });

    const cityRoute = await Route.create({
      routeNumber: "RT-202",
      routeName: "Metro Transit Loop",
      stops: [
        {
          name: "Central Metro Terminal",
          order: 1,
          location: { type: "Point", coordinates: [79.150, 12.965] },
        },
        {
          name: "Civic Center",
          order: 2,
          location: { type: "Point", coordinates: [79.154, 12.968] },
        },
        {
          name: "North Campus Gate",
          order: 3,
          location: { type: "Point", coordinates: [79.158, 12.971] },
        },
      ],
    });

    console.log("Created routes (RT-101, RT-202).");

    // 3. Create Buses
    const bus1 = await Bus.create({
      busNumber: "101",
      registrationNumber: "TN-23-AX-1010",
      capacity: 45,
      status: "active",
      currentLocation: {
        type: "Point",
        coordinates: [79.1575, 12.9705],
      },
    });

    const bus2 = await Bus.create({
      busNumber: "102",
      registrationNumber: "TN-23-AX-1020",
      capacity: 50,
      status: "active",
      currentLocation: {
        type: "Point",
        coordinates: [79.162, 12.9735],
      },
    });

    const bus3 = await Bus.create({
      busNumber: "201",
      registrationNumber: "TN-23-BX-2010",
      capacity: 40,
      status: "inactive",
      currentLocation: {
        type: "Point",
        coordinates: [79.151, 12.966],
      },
    });

    console.log("Created fleet buses (101, 102, 201).");

    // 4. Create Driver Profile
    const driverProfile = await Driver.create({
      user: driverUser._id,
      licenseNumber: "DL-2026-9988",
      phone: "+91 98765 43210",
      assignedBus: bus1._id,
      status: "on_trip",
    });

    console.log("Created driver profile.");

    // 5. Create Active Trip
    const activeTrip = await Trip.create({
      bus: bus1._id,
      driver: driverProfile._id,
      route: campusRoute._id,
      startTime: new Date(Date.now() - 25 * 60000), // started 25 mins ago
      status: "active",
    });

    // 6. Create Historical Completed Trip
    await Trip.create({
      bus: bus2._id,
      driver: driverProfile._id,
      route: cityRoute._id,
      startTime: new Date(Date.now() - 120 * 60000),
      endTime: new Date(Date.now() - 45 * 60000),
      status: "completed",
    });

    // 7. Seed initial GPS location history
    await Location.create({
      bus: bus1._id,
      trip: activeTrip._id,
      location: {
        type: "Point",
        coordinates: [79.1575, 12.9705],
      },
      speed: 38,
      heading: 85,
      recordedAt: new Date(),
    });

    console.log("Database seeded successfully!");
    console.log("\n--- Demo Logins (Password: password123) ---");
    console.log("Admin: demoadmin@test.com");
    console.log("Driver: demodriver@test.com");
    console.log("Passenger: demopassenger@test.com");

    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
};

seedData();
