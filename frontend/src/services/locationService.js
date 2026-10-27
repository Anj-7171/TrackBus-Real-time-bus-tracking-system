import api from "./api";

export const updateLocation = async (locationData) => {
  const response = await api.post("/locations", locationData);
  return response.data;
};

export const getLatestLocation = async (busId) => {
  const response = await api.get(`/locations/${busId}/latest`);
  return response.data;
};
