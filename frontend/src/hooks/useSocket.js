import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../constants';

export const useSocket = (roomId, username, callbacks) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const callbacksRef = useRef(callbacks);

  // Keep callbacks updated without triggering reconnects
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  useEffect(() => {
    if (!roomId) return undefined;

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('room:join', { roomId, username });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('board:init', (...args) => callbacksRef.current.onBoardInit?.(...args));
    socket.on('path:add', (...args) => callbacksRef.current.onPathAdd?.(...args));
    socket.on('path:update', (...args) => callbacksRef.current.onPathUpdate?.(...args));
    socket.on('paths:replace', (...args) => callbacksRef.current.onPathsReplace?.(...args));
    socket.on('board:clear', (...args) => callbacksRef.current.onBoardClear?.(...args));
    socket.on('room:presence', (...args) => callbacksRef.current.onPresenceChange?.(...args));
    socket.on('room:users', (...args) => callbacksRef.current.onUsersChange?.(...args));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomId, username]);

  const emitPathAdd = (path) => {
    if (!roomId) return;
    socketRef.current?.emit('path:add', { roomId, path });
  };

  const emitPathUpdate = (path) => {
    if (!roomId) return;
    socketRef.current?.emit('path:update', { roomId, path });
  };

  const emitPathsReplace = (paths) => {
    if (!roomId) return;
    socketRef.current?.emit('paths:replace', { roomId, paths });
  };

  const emitBoardClear = () => {
    if (!roomId) return;
    socketRef.current?.emit('board:clear', roomId);
  };

  const disconnectSocket = () => {
    socketRef.current?.disconnect();
    socketRef.current = null;
  };

  return {
    isConnected,
    emitPathAdd,
    emitPathUpdate,
    emitPathsReplace,
    emitBoardClear,
    disconnectSocket,
  };
};
