import { roomManager } from '../services/roomManager.js';

export const registerSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    socket.on('room:join', (data) => {
      // Support both string input (roomId) and object input ({ roomId, username })
      let roomId = '';
      let username = '';

      if (typeof data === 'object' && data !== null) {
        roomId = data.roomId;
        username = data.username;
      } else {
        roomId = data;
      }

      if (!roomId) return;

      const finalUsername = username || `Guest_${socket.id.slice(0, 4)}`;
      
      const room = roomManager.getRoom(roomId);
      socket.join(roomId);
      socket.data.roomId = roomId;
      socket.data.username = finalUsername;

      roomManager.joinUser(roomId, socket.id, finalUsername);
      socket.emit('board:init', room.paths);
      
      // Emit the updated list of users in the room
      io.to(roomId).emit('room:users', roomManager.getUsers(roomId));
    });

    socket.on('path:add', ({ roomId, path }) => {
      roomManager.addPath(roomId, path);
      socket.to(roomId).emit('path:add', path);
    });

    socket.on('path:update', ({ roomId, path }) => {
      roomManager.updatePath(roomId, path);
      socket.to(roomId).emit('path:update', path);
    });

    socket.on('paths:replace', ({ roomId, paths }) => {
      roomManager.replacePaths(roomId, paths);
      socket.to(roomId).emit('paths:replace', paths);
    });

    socket.on('board:clear', (roomId) => {
      roomManager.clearBoard(roomId);
      socket.to(roomId).emit('board:clear');
    });

    socket.on('disconnect', () => {
      const roomId = socket.data.roomId;
      if (!roomId) return;

      roomManager.leaveUser(roomId, socket.id);
      
      // Emit the updated list of users in the room
      io.to(roomId).emit('room:users', roomManager.getUsers(roomId));
    });
  });
};
