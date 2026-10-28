# 🚌 TrackBus — Real-Time Bus Tracking System Using MongoDB

A web-based bus tracking system that enables passengers to monitor bus locations, estimated arrival times, and route information in real time.

## 📌 Overview

**TrackBus** is a real-time bus tracking system designed to improve public transportation accessibility and convenience. The application enables passengers to track buses, visualize routes, and access estimated arrival times through an interactive web interface.

The system collects GPS coordinates from buses at regular intervals, processes location updates through a backend server, and stores tracking information in MongoDB. Passengers can access bus locations and route information, while administrators can manage buses, drivers, and routes and monitor active trips.

By leveraging MongoDB's flexible document storage and geospatial capabilities, TrackBus demonstrates how NoSQL databases can support applications that process continuous location updates.

## 🎯 Objectives

- Enable passengers to track bus locations in real time.
- Provide estimated arrival times to help passengers plan their journeys.
- Visualize bus routes and locations on an interactive map.
- Maintain trip history for tracking and reference.
- Provide administrative functionality for managing buses, drivers, and routes.
- Utilize MongoDB for storing and querying location-based data efficiently.

## ✨ Key Features

### 📍 Live Bus Tracking
Receive periodic GPS location updates from buses and display their current positions through the tracking interface.

### 🗺️ Interactive Route Visualization
Visualize bus locations and routes using Leaflet and OpenStreetMap.

### ⏱️ Estimated Time of Arrival (ETA)
Provide estimated bus arrival times to help passengers plan their trips and reduce uncertainty while waiting.

### 📋 Trip History
Maintain historical trip information for reference and monitoring.

### 👨‍✈️ Driver Login and Trip Management
Support driver authentication and trip-related operations.

### 🛠️ Administrative Dashboard
Allow administrators to manage bus information, drivers, and routes while monitoring active trips.

### 🌐 Geospatial Search
Leverage MongoDB geospatial capabilities to support location-based queries.

### 🔄 Real-Time Status Updates
Process periodic location updates to provide current bus tracking information.

## 🏗️ System Architecture

TrackBus follows a client-server architecture with separate frontend, backend, and database layers.

```text
+--------------------------------+
|          Driver App            |
|     GPS Location Updates       |
+--------------------------------+
                |
                v
+--------------------------------+
|       Backend API Server       |
|        Node.js + Express       |
|                                |
|  - Process GPS Coordinates     |
|  - Handle REST API Requests    |
|  - Manage Trips and Routes     |
+--------------------------------+
                |
                v
+--------------------------------+
|          MongoDB               |
|                                |
|  - Bus Location Data           |
|  - Route and Trip Information  |
|  - Bus and Driver Records      |
|  - Geospatial Queries          |
+--------------------------------+
                |
                v
+--------------------------------+
|        React.js Frontend       |
|                                |
|  - Passenger Dashboard         |
|  - Interactive Maps            |
|  - Bus Location Visualization  |
|  - ETA and Route Information   |
|  - Administrative Dashboard    |
+--------------------------------+
```

### Architecture Components

**1. Driver Application**

Transmits GPS coordinates periodically so that the backend can receive updated bus locations.

**2. Backend Server**

Built using Node.js and Express, the backend processes incoming requests, handles location updates, and facilitates communication between the frontend and MongoDB.

**3. MongoDB Database**

Stores bus locations and other application information using a flexible document-oriented data model. Geospatial capabilities support location-based queries.

**4. Passenger and Administrative Interface**

Built using React.js, the frontend presents bus locations, route information, and estimated arrival times. It also provides an interface for administrative operations.

## 🛠️ Technology Stack

| Component | Technology | Purpose |
|---|---|---|
| Frontend | React.js | Builds the user interface |
| Map Visualization | Leaflet | Displays interactive maps and bus locations |
| Map Data | OpenStreetMap | Provides map data and geographic visualization |
| Backend | Node.js | Runs server-side application logic |
| Backend Framework | Express.js | Handles HTTP requests and REST APIs |
| Database | MongoDB | Stores application and location data |
| API Architecture | REST API | Enables communication between application components |
| Version Control | Git and GitHub | Supports source-code management |

## 🗄️ Why MongoDB?

MongoDB is used as the database layer because real-time bus tracking involves frequent location updates and geographically oriented queries.

Key advantages include:

- **Flexible Document Storage:** GPS coordinates and related tracking information can be represented using flexible, JSON-like documents.
- **High-Volume Updates:** Supports workloads involving frequent writes of changing location data.
- **Geospatial Indexing:** Enables location-based queries, including searches for nearby buses.
- **Scalability:** Provides options for scaling data storage as the application grows.
- **Structured Application Data:** Can store information associated with buses, drivers, routes, and trips.

These capabilities make MongoDB a suitable choice for the data management requirements of a real-time transportation application.

## 📂 Project Structure

The repository separates the frontend and backend components.

```text
TrackBus-Real-time-bus-tracking-system/
│
├── frontend/
│   └── React.js application
│
├── backend/
│   └── Node.js and Express application
│
├── .gitignore
└── README.md
```

*Note: This is a high-level representation. Actual files and subdirectories may differ depending on the repository's implementation.*

## ⚙️ Installation and Setup

Follow these steps to configure the project locally.

### Prerequisites

Ensure that the following tools are installed:

- [Node.js](https://nodejs.org/)
- npm
- [MongoDB](https://www.mongodb.com/)
- [Git](https://git-scm.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/Anj-7171/TrackBus-Real-time-bus-tracking-system.git
```

Navigate to the project directory:

```bash
cd TrackBus-Real-time-bus-tracking-system
```

### 2. Configure the Backend

Navigate to the backend directory:

```bash
cd backend
```

Install the dependencies specified by the backend project:

```bash
npm install
```

Configure the MongoDB connection and any required environment variables according to the backend configuration.

For example, a local MongoDB connection string may look like:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/trackbus
```

Use the actual variable names expected by the application.

Start the backend using the script defined in its `package.json`.

### 3. Configure the Frontend

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install the frontend dependencies:

```bash
npm install
```

Configure the backend API endpoint if required by the application.

Start the frontend using the development script defined in its `package.json`.

### 4. Run the Application

Once the backend, database, and frontend are configured and running, open the local development URL displayed in the frontend terminal.

Ensure that the frontend can communicate with the backend and that the backend can connect to MongoDB.

*The exact startup commands and configuration variables depend on the scripts and settings in the repository.*

## 🔄 Application Workflow

The intended workflow of the system is as follows:

1. **Location Collection:** The driver application obtains the bus's GPS coordinates.
2. **Location Transmission:** Coordinates are transmitted periodically to the backend server.
3. **Request Processing:** The Node.js and Express backend processes incoming location updates.
4. **Data Storage:** The backend stores the relevant information in MongoDB.
5. **Data Retrieval:** The backend provides tracking information through REST APIs.
6. **Map Visualization:** The React.js frontend displays bus locations and route information using Leaflet and OpenStreetMap.
7. **Passenger Access:** Passengers can view available tracking information and estimated arrival times.
8. **Administration:** Authorized administrators can manage buses, drivers, and routes and monitor active trips.

## 🚀 Future Enhancements

Potential enhancements to TrackBus include:

- **Predictive ETA:** Improve arrival-time estimates using traffic conditions, historical travel times, and bus speeds.
- **Advanced Route Optimization:** Identify efficient routes based on traffic patterns and passenger demand.
- **Push Notifications:** Notify passengers about approaching buses, delays, and route changes.
- **Mobile Application:** Extend the tracking experience to Android and iOS devices.
- **Analytics Dashboard:** Analyze trip durations, delays, route performance, and bus utilization.
- **Historical Location Playback:** Visualize previous bus journeys using stored GPS records.
- **Improved Geospatial Queries:** Expand nearby-bus searches and location-based filtering.
- **Scalable Location Processing:** Optimize the processing and storage of frequent GPS updates.

These are proposed enhancements rather than claims about features already implemented.

## 🎓 Learning Outcomes

The project explores several important software engineering concepts:

- Full-stack web application development.
- REST API design and frontend–backend integration.
- NoSQL database design using MongoDB.
- Geospatial data storage and location-based querying.
- Interactive map integration using Leaflet and OpenStreetMap.
- Processing periodic GPS location updates.
- Designing modular applications for transportation management.

## 🤝 Contributing

Contributions and suggestions are welcome.

1. Fork the repository.
2. Create a new branch for your feature or fix.
3. Implement and test your changes.
4. Commit your changes with a descriptive message.
5. Submit a pull request explaining your contribution.

## 📄 License

A license has not been specified in this README. Add a suitable `LICENSE` file if you intend to distribute the project under an open-source license.

## 👩‍💻 Author

**Anjana Nair**

GitHub: [Anj-7171](https://github.com/Anj-7171)

## 🔗 Project Repository

[TrackBus — Real-Time Bus Tracking System](https://github.com/Anj-7171/TrackBus-Real-time-bus-tracking-system)

---

*TrackBus — Making public transportation more accessible through real-time location tracking.*
