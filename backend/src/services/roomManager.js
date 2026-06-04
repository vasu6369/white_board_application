class RoomManager {
  constructor() {
    this.rooms = new Map();
  }

  getRoom(roomId) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, { paths: [], users: new Map() });
    }
    return this.rooms.get(roomId);
  }

  addPath(roomId, path) {
    const room = this.getRoom(roomId);
    room.paths.push(path);
  }

  updatePath(roomId, path) {
    const room = this.getRoom(roomId);
    room.paths = room.paths.map((item) => (item.id === path.id ? path : item));
  }

  replacePaths(roomId, paths) {
    const room = this.getRoom(roomId);
    room.paths = paths;
  }

  clearBoard(roomId) {
    const room = this.getRoom(roomId);
    room.paths = [];
  }

  joinUser(roomId, socketId, username) {
    const room = this.getRoom(roomId);
    room.users.set(socketId, username);
  }

  leaveUser(roomId, socketId) {
    const room = this.getRoom(roomId);
    room.users.delete(socketId);
  }

  getUsers(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return [];
    return Array.from(room.users.values());
  }

  getRoomPresence(io, roomId) {
    return io.sockets.adapter.rooms.get(roomId)?.size || 0;
  }
}

export const roomManager = new RoomManager();
