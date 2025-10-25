let ioRef = null;
export const initSockets = (io) => {
  ioRef = io;

  // Handle socket connections and room joining
  io.on('connection', (socket) => {
    socket.on('joinProject', (projectId) => {
      socket.join(projectId);
    });

    socket.on('leaveProject', (projectId) => {
      socket.leave(projectId);
    });
  });
};

export const emitToProject = (projectId, event, payload) => {
  if (!ioRef) return;
  ioRef.to(projectId).emit(event, payload);
};

export const io = ioRef;
