import api from "./api";

export const getDashboardStats = async () => {
  const response = await api.get("/dashboard/stats");
  return response.data;
};

export const getBusETA = async (busId, options = {}) => {
  const params = typeof options === "number" ? { distanceKm: options } : options;
  const response = await api.get(`/eta/${busId}`, { params });
  return response.data;
};
