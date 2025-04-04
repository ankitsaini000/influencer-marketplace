import userRoutes from './routes/userRoutes';
import creatorRoutes from './routes/creatorRoutes';
import messageRoutes from './routes/messageRoutes';
import reviewRoutes from './routes/reviewRoutes';
import uploadRoutes from './routes/uploadRoutes';
import express from 'express';
import path from 'path';

// API Routes
const app = express();
app.use('/api/users', userRoutes);
app.use('/api/creators', creatorRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/upload', uploadRoutes);

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Set port and start server
const PORT = 5001; // Changed from 5000 to 5001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
