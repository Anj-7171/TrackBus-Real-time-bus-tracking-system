import React, { useState, useEffect, useMemo } from "react";
import Navbar from "../components/Navbar";
import MapView from "../components/MapView";
import Loading from "../components/Loading";
import { getBuses, getNearbyBuses } from "../services/busService";
import { getRoutes } from "../services/routeService";
import { getTrips } from "../services/tripService";
import { getBusETA } from "../services/dashboardService";
import { subscribeToBusLocations } from "../services/socketService";

function PassengerDashboard() {
  const [buses, setBuses] = useState([]);
  const [allBuses, setAllBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [trips, setTrips] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [selectedBusId, setSelectedBusId] = useState("");
  const [selectedStop, setSelectedStop] = useState(null);
  const [etaInfo, setEtaInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchingNear, setSearchingNear] = useState(false);
  const [error, setError] = useState("");
  const [geoNotice, setGeoNotice] = useState("");
  const [mapCenter, setMapCenter] = useState([12.9692, 79.1559]);
  const [mapZoom, setMapZoom] = useState(13);

  // Geospatial Search State
  const [searchRadiusKm, setSearchRadiusKm] = useState(5);
  const [searchOrigin, setSearchOrigin] = useState(null);

  // Fetch initial data
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");
        const [busData, routeData, tripData] = await Promise.all([
          getBuses().catch(() => []),
          getRoutes().catch(() => []),
          getTrips().catch(() => []),
        ]);

        if (mounted) {
          setBuses(busData);
          setAllBuses(busData);
          setRoutes(routeData);
          setTrips(tripData);

          const activeWithCoords = busData.find(
            (b) =>
              b.currentLocation?.coordinates &&
              (b.currentLocation.coordinates[0] !== 0 || b.currentLocation.coordinates[1] !== 0)
          );
          if (activeWithCoords) {
            setMapCenter([
              activeWithCoords.currentLocation.coordinates[1],
              activeWithCoords.currentLocation.coordinates[0],
            ]);
          } else if (routeData.length > 0 && routeData[0].stops?.length > 0) {
            const firstStop = routeData[0].stops[0];
            const coords = firstStop.location?.coordinates;
            if (coords) {
              setMapCenter([coords[1], coords[0]]);
            }
          }
        }
      } catch (err) {
        if (mounted) {
          setError("Failed to fetch fleet tracking data.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  // Subscribe to live WebSocket bus location updates
  useEffect(() => {
    const unsubscribe = subscribeToBusLocations((data) => {
      const updateBusList = (prevBuses) => {
        const exists = prevBuses.some((b) => b._id === data.busId);
        if (exists) {
          return prevBuses.map((b) => {
            if (b._id === data.busId) {
              return {
                ...b,
                status: "active",
                speed: data.speed,
                heading: data.heading,
                currentLocation: {
                  type: "Point",
                  coordinates: [data.longitude, data.latitude],
                },
              };
            }
            return b;
          });
        }
        return prevBuses;
      };

      setBuses((prev) => updateBusList(prev));
      setAllBuses((prev) => updateBusList(prev));

      if (selectedBusId === data.busId) {
        calculateDynamicETA(data.busId);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [selectedBusId, selectedStop]);

  // Selected route object
  const activeRoute = useMemo(() => {
    return routes.find((r) => r._id === selectedRouteId) || null;
  }, [routes, selectedRouteId]);

  // Stops and polyline
  const { currentStops, polylineCoordinates } = useMemo(() => {
    if (!activeRoute || !activeRoute.stops) {
      return { currentStops: [], polylineCoordinates: [] };
    }

    const sortedStops = [...activeRoute.stops].sort((a, b) => (a.order || 0) - (b.order || 0));
    const coords = sortedStops
      .filter((s) => s.location?.coordinates)
      .map((s) => [s.location.coordinates[1], s.location.coordinates[0]]);

    return {
      currentStops: sortedStops,
      polylineCoordinates: coords,
    };
  }, [activeRoute]);

  // Dynamic Geodesic ETA calculation
  const calculateDynamicETA = async (busId, targetStop = null) => {
    const stopToUse = targetStop || selectedStop;
    try {
      let options = {};
      if (stopToUse && stopToUse.location?.coordinates) {
        options = {
          destLat: stopToUse.location.coordinates[1],
          destLng: stopToUse.location.coordinates[0],
        };
      } else if (searchOrigin) {
        options = {
          destLat: searchOrigin[0],
          destLng: searchOrigin[1],
        };
      } else {
        options = { distanceKm: 4 };
      }

      const data = await getBusETA(busId, options);
      setEtaInfo(data);
    } catch {
      setEtaInfo(null);
    }
  };

  const handleSelectBus = (bus) => {
    setSelectedBusId(bus._id);
    if (
      bus.currentLocation?.coordinates &&
      (bus.currentLocation.coordinates[0] !== 0 || bus.currentLocation.coordinates[1] !== 0)
    ) {
      setMapCenter([bus.currentLocation.coordinates[1], bus.currentLocation.coordinates[0]]);
      setMapZoom(15);
    }
    calculateDynamicETA(bus._id);
  };

  const handleSelectStop = (stop) => {
    setSelectedStop(stop);
    if (selectedBusId) {
      calculateDynamicETA(selectedBusId, stop);
    }
  };

  const handleSelectRoute = (routeId) => {
    setSelectedRouteId(routeId);
    if (!routeId) return;

    const r = routes.find((item) => item._id === routeId);
    if (r && r.stops && r.stops.length > 0) {
      const coords = r.stops[0].location?.coordinates;
      if (coords) {
        setMapCenter([coords[1], coords[0]]);
        setMapZoom(13);
      }
    }
  };

  // Perform MongoDB Geospatial $near Search
  const performGeospatialSearch = (latitude, longitude) => {
    setSearchingNear(true);
    setError("");
    setGeoNotice("");

    const radiusMeters = searchRadiusKm * 1000;
    setSearchOrigin([latitude, longitude]);
    setMapCenter([latitude, longitude]);
    setMapZoom(14);

    getNearbyBuses(latitude, longitude, radiusMeters)
      .then((nearby) => {
        setBuses(nearby);
        setGeoNotice(
          `Found ${nearby.length} active bus(es) within ${searchRadiusKm} km using MongoDB $near geospatial query.`
        );
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Geospatial search failed.");
      })
      .finally(() => {
        setSearchingNear(false);
      });
  };

  const handleNearMeClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          performGeospatialSearch(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          // If user denies GPS permission or running in non-secure context, use current map center
          performGeospatialSearch(mapCenter[0], mapCenter[1]);
        },
        { timeout: 6000 }
      );
    } else {
      performGeospatialSearch(mapCenter[0], mapCenter[1]);
    }
  };

  const handleResetSearch = () => {
    setSearchOrigin(null);
    setGeoNotice("");
    setBuses(allBuses);
    setSelectedRouteId("");
  };

  const selectedBus = buses.find((b) => b._id === selectedBusId) || allBuses.find((b) => b._id === selectedBusId);

  return (
    <div className="dashboard-layout">
      <Navbar />

      <main className="dashboard-content">
        <div className="page-header">
          <div>
            <h1>Real-Time Bus Tracking</h1>
            <p>Live GPS telemetry, geospatial search, and geodesic ETA calculation</p>
          </div>

          <div className="quick-stats-pills">
            <span className="pill">
              🚍 <strong>{buses.length}</strong> Buses Showing
            </span>
            <span className="pill active-pill">
              🟢 <strong>{buses.filter((b) => b.status === "active").length}</strong> Active Now
            </span>
            <span className="pill">
              🗺️ <strong>{routes.length}</strong> Routes
            </span>
          </div>
        </div>

        {/* MongoDB Geospatial Search Bar */}
        <div className="geospatial-bar card">
          <div className="geo-controls">
            <div className="geo-label">
              <span className="geo-icon">📍</span>
              <strong>MongoDB Geospatial ($near) Search:</strong>
            </div>

            <div className="geo-inputs">
              <label>Radius:</label>
              <select
                value={searchRadiusKm}
                onChange={(e) => setSearchRadiusKm(Number(e.target.value))}
                className="select-input-sm"
              >
                <option value={1}>1 km</option>
                <option value={3}>3 km</option>
                <option value={5}>5 km</option>
                <option value={10}>10 km</option>
                <option value={20}>20 km</option>
              </select>

              <button
                onClick={handleNearMeClick}
                disabled={searchingNear}
                className="btn btn-primary btn-sm"
              >
                {searchingNear ? "Searching $near..." : "🔍 Find Buses Near Me"}
              </button>

              {searchOrigin && (
                <button
                  onClick={handleResetSearch}
                  className="btn btn-secondary btn-sm"
                >
                  ✕ Clear Radius Filter
                </button>
              )}
            </div>
          </div>

          {geoNotice && <div className="alert-box success geo-alert">{geoNotice}</div>}
        </div>

        {error && <div className="alert-box error">{error}</div>}

        <div className="tracking-grid">
          {/* Main Map View Column */}
          <div className="map-column">
            <div className="card map-card">
              <div className="card-header">
                <h3>Live Fleet Map</h3>
                <div className="filter-controls">
                  <select
                    value={selectedRouteId}
                    onChange={(e) => handleSelectRoute(e.target.value)}
                    className="select-input"
                  >
                    <option value="">All Routes</option>
                    {routes.map((route) => (
                      <option key={route._id} value={route._id}>
                        {route.routeNumber} - {route.routeName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {loading ? (
                <Loading message="Syncing with GPS satellites and backend..." />
              ) : (
                <MapView
                  buses={buses}
                  stops={currentStops}
                  routeCoordinates={polylineCoordinates}
                  center={mapCenter}
                  zoom={mapZoom}
                  height="580px"
                  onSelectBus={handleSelectBus}
                  onSelectStop={handleSelectStop}
                  searchCenter={searchOrigin}
                  searchRadius={searchOrigin ? searchRadiusKm * 1000 : null}
                />
              )}

              <div className="map-legend">
                <span className="legend-item">
                  <span className="badge-dot green"></span> Active Bus
                </span>
                <span className="legend-item">
                  <span className="badge-dot gray"></span> Idle / Inactive
                </span>
                <span className="legend-item">
                  <span className="badge-dot blue"></span> Route Stop
                </span>
                {searchOrigin && (
                  <span className="legend-item">
                    <span className="badge-dot pink"></span> Geospatial Perimeter
                  </span>
                )}
                <span className="legend-item">
                  <span className="route-line-sample"></span> Path
                </span>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Active Buses & ETA Card */}
          <div className="sidebar-column">
            {/* ETA Info Box */}
            {selectedBus && (
              <div className="card eta-card">
                <div className="card-header">
                  <h3>⏱️ Geodesic ETA Tracker</h3>
                  <button
                    className="btn-icon"
                    onClick={() => {
                      setSelectedBusId("");
                      setEtaInfo(null);
                      setSelectedStop(null);
                    }}
                  >
                    ✕
                  </button>
                </div>
                <div className="eta-body">
                  <div className="eta-highlight">
                    <span className="eta-label">
                      {selectedStop ? `Arrival at ${selectedStop.name}` : "Estimated Arrival"}
                    </span>
                    <span className="eta-value">
                      {etaInfo ? `${etaInfo.etaMinutes} mins` : "~ 6 mins"}
                    </span>
                    {etaInfo && (
                      <span className="eta-dist">
                        Distance: <strong>{etaInfo.distanceKm} km</strong> (Speed: {etaInfo.speedKmPerHour} km/h)
                      </span>
                    )}
                  </div>
                  <div className="eta-details">
                    <p>
                      <strong>Bus:</strong> {selectedBus.busNumber} ({selectedBus.registrationNumber})
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <span className={`status-pill ${selectedBus.status}`}>
                        {selectedBus.status}
                      </span>
                    </p>
                    {selectedStop && (
                      <p>
                        <strong>Target Stop:</strong> {selectedStop.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Active Buses List */}
            <div className="card">
              <div className="card-header">
                <h3>Fleet Status ({buses.length})</h3>
                {searchOrigin && (
                  <span className="badge-sm-pink">Geospatial Filtered</span>
                )}
              </div>

              <div className="bus-list">
                {buses.length === 0 ? (
                  <p className="empty-message">No buses in current radius / route.</p>
                ) : (
                  buses.map((bus) => {
                    const isSelected = bus._id === selectedBusId;
                    const isLive = bus.status === "active";
                    const coords = bus.currentLocation?.coordinates;
                    const hasCoords = coords && (coords[0] !== 0 || coords[1] !== 0);

                    return (
                      <div
                        key={bus._id}
                        className={`bus-item ${isSelected ? "selected" : ""}`}
                        onClick={() => handleSelectBus(bus)}
                      >
                        <div className="bus-item-icon">{isLive ? "🟢" : "⚪"}</div>
                        <div className="bus-item-details">
                          <div className="bus-title">
                            <strong>Bus {bus.busNumber}</strong>
                            <span className="reg">{bus.registrationNumber}</span>
                          </div>
                          <div className="bus-meta">
                            <span>Capacity: {bus.capacity}</span>
                            <span>{hasCoords ? "📍 GPS Active" : "No GPS signal"}</span>
                          </div>
                        </div>
                        <button className="btn-sm">Locate</button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Active Route Stops */}
            {activeRoute && (
              <div className="card">
                <div className="card-header">
                  <h3>Route Stops ({currentStops.length})</h3>
                </div>
                <div className="stops-timeline">
                  {currentStops.map((stop, index) => {
                    const isTarget = selectedStop && selectedStop.name === stop.name;
                    return (
                      <div
                        key={stop._id || index}
                        className={`timeline-item ${isTarget ? "selected-stop" : ""}`}
                        onClick={() => handleSelectStop(stop)}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="timeline-badge">{index + 1}</div>
                        <div className="timeline-content">
                          <strong>{stop.name}</strong>
                          {stop.location?.coordinates && (
                            <span className="coords-text">
                              [{stop.location.coordinates[1].toFixed(3)},{" "}
                              {stop.location.coordinates[0].toFixed(3)}]
                            </span>
                          )}
                        </div>
                        <button className="btn-sm">ETA</button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default PassengerDashboard;
