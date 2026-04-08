import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export const useSocket = (onEvent, eventName) => {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_API_URL || 'http://localhost:4000');

    socketRef.current.on(eventName, (data) => {
      onEvent(data);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [eventName, onEvent]);

  return socketRef.current;
};

export const emitSocketEvent = (eventName, data) => {
  const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:4000');
  socket.emit(eventName, data);
  socket.disconnect();
};
