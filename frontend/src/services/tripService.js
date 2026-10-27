import api from "./api";

export const getTrips = async () => {
  const response = await api.get("/trips");
  return response.data;
};

export const getTripById = async (id) => {
  const response = await api.get(`/trips/${id}`);
  return response.data;
};

export const createTrip = async (tripData) => {
  const response = await api.post("/trips", tripData);
  return response.data;
};

export const startTrip = async (id) => {
  const response = await api.put(`/trips/${id}/start`);
  return response.data;
};

export const endTrip = async (id) => {
  const response = await api.put(`/trips/${id}/end`);
  return response.data;
};

export const cancelTrip = async (id) => {
  const response = await api.put(`/trips/${id}/cancel`);
  return response.data;
};
