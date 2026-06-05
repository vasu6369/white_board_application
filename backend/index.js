import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { PORT } from './src/config/constants.js';
import { registerSocketHandlers } from './src/handlers/socketHandler.js';

const server = createServer();
const io = new Server(server, {
  cors: {
    origin: true,
  },
});

registerSocketHandlers(io);

server.listen(PORT, () => {
  console.log(`Collaboration server running on http://localhost:${PORT}`);
});