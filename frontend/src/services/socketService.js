import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});

export const joinTripRoom = (tripId) => {
  if (socket && tripId) {
    socket.emit("joinTrip", tripId);
  }
};

export const emitBusLocation = (data) => {
  if (socket) {
    socket.emit("busLocationUpdate", data);
  }
};

export const subscribeToBusLocations = (callback) => {
  if (socket) {
    socket.on("busLocationUpdated", callback);
  }
  return () => {
    if (socket) {
      socket.off("busLocationUpdated", callback);
    }
  };
};

export default socket;
