module.exports = function(io) {
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join_room', (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined their notification room`);
    });

    socket.on('send_notification', (data) => {
      io.to(data.patientId).emit('receive_notification', data);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });
};