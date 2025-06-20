import { Server } from 'socket.io';
import http from 'http';
import { socketAuth } from './middleware/authMiddleware';
import setupMessageHandlers from './handlers/messageHandler';
import { AuthenticatedSocket, SocketIOServer } from '../types/socket';

// Initialize Socket.IO server
export function initializeSocketIO(server: http.Server): SocketIOServer {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    // In production, you may want to enable more options
    // transports: ['websocket', 'polling'],
    // pingTimeout: 60000,
  });

  // Apply authentication middleware to all socket connections
  io.use(socketAuth);

  // Handle socket connections
  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User connected: ${socket.user?._id || 'unknown'}`);
    
    // Set up message handlers for this socket
    setupMessageHandlers(io, socket);
    
    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user?._id || 'unknown'}`);
    });
  });

  return io;
} 