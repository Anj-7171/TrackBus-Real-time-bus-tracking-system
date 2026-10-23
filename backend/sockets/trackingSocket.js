const registerTrackingSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(
      "Tracking client connected:",
      socket.id
    );

    socket.on("joinTrip", (tripId) => {
      socket.join(`trip-${tripId}`);
    });

    socket.on("busLocationUpdate", (data) => {
      io.emit("busLocationUpdated", data);
    });

    socket.on("disconnect", () => {
      console.log(
        "Tracking client disconnected:",
        socket.id
      );
    });
  });
};

module.exports = registerTrackingSocket;