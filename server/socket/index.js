module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });

    // You can also add more direct socket event listeners here if needed,
    // though the controller handles emitting all business logic updates.
  });
};
