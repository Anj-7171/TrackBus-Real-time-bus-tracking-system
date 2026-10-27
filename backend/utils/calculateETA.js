/**
 * Calculate great-circle distance between two GPS coordinates using the Haversine formula.
 * @param {number} lat1 - Latitude of start point
 * @param {number} lon1 - Longitude of start point
 * @param {number} lat2 - Latitude of destination point
 * @param {number} lon2 - Longitude of destination point
 * @returns {number} Distance in kilometers
 */
const haversineDistanceKm = (lat1, lon1, lat2, lon2) => {
  const toRad = (angle) => (angle * Math.PI) / 180;
  const R = 6371; // Earth's mean radius in km

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Calculate Estimated Time of Arrival in minutes.
 * @param {number} distanceKm - Distance in kilometers
 * @param {number} speedKmH - Current speed in km/h
 * @returns {number} ETA in minutes
 */
const calculateETA = (distanceKm, speedKmH) => {
  // If speed is not provided or below 5 km/h (e.g. stopped at a light), use an average transit speed of 25 km/h
  const effectiveSpeed = speedKmH && speedKmH > 5 ? speedKmH : 25;
  const timeInHours = distanceKm / effectiveSpeed;
  return Math.max(1, Math.round(timeInHours * 60));
};

module.exports = calculateETA;
module.exports.haversineDistanceKm = haversineDistanceKm;
