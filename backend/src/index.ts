import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import { connectDB } from './config/database';
import { notFound, errorHandler } from './middleware/error';
import http from 'http';
import { initializeSocketIO } from './sockets';

// Routes
import userRoutes from './routes/userRoutes';
import creatorRoutes from './routes/creatorRoutes';
import reviewRoutes from './routes/reviewRoutes';
import messageRoutes from './routes/messageRoutes';
import conversationRoutes from './routes/conversationRoutes';
import uploadRoutes from './routes/uploadRoutes';
import likeRoutes from './routes/likeRoutes';
import promotionRoutes from './routes/promotionRoutes';
import promotionApplicationRoutes from './routes/promotionApplicationRoutes';
import brandVerificationRoutes from './routes/brandVerificationRoutes';
import orderRoutes from './routes/orderRoutes';
import creatorDashboardRoutes from './routes/creatorDashboardRoutes';
import facebookAuthRoutes from './routes/facebookAuth';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Create HTTP server from Express app
const server = http.createServer(app);

// Initialize Socket.IO
const io = initializeSocketIO(server);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging in development mode
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Make uploads folder static
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Create uploads directory if it doesn't exist
import fs from 'fs';
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Welcome route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Influencer Marketplace API' });
});

// Add a test route directly in the main file
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'API is working' });
});

// Add a test message route directly in the main file  
app.post('/api/direct-message-test', (req, res) => {
  const { receiverId, content } = req.body;
  res.json({
    success: true,
    message: 'Direct message test successful',
    receivedData: { receiverId, content },
    timestamp: new Date().toISOString()
  });
});

// Set up routes
app.use('/api/users', userRoutes);
app.use('/api/creators', creatorRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/promotion-applications', promotionApplicationRoutes);
app.use('/api/brand-verification', brandVerificationRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/creator-dashboard', creatorDashboardRoutes);
app.use('/api/auth/facebook', facebookAuthRoutes);

// Log all registered routes for debugging
console.log('Registered routes:');
app._router.stack.forEach((r: any) => {
  if (r.route && r.route.path) {
    console.log(`${Object.keys(r.route.methods).join(',')} ${r.route.path}`);
  } else if (r.name === 'router' && r.handle.stack) {
    r.handle.stack.forEach((nestedRoute: any) => {
      if (nestedRoute.route) {
        const path = r.regexp.toString().includes('/api/messages') 
          ? '/api/messages' + nestedRoute.route.path 
          : r.regexp.toString().includes('/api/conversations')
            ? '/api/conversations' + nestedRoute.route.path
            : '';
            
        if (path.includes('/api/messages') || path.includes('/api/conversations')) {
          console.log(`${Object.keys(nestedRoute.route.methods).join(',')} ${path}`);
        }
      }
    });
  }
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Socket.IO initialized and listening for connections');
});

export { app, server, io };