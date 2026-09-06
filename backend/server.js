import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';
import authRoutes from './src/routes/authRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import shopRoutes from './src/routes/shopRoutes.js';
import productRoutes from './src/routes/productRoutes.js';
import orderRoutes from './src/routes/orderRoutes.js';
import notificationRoutes from './src/routes/notificationRoutes.js';
import impactRoutes from './src/routes/impactRoutes.js';
import chatRoutes from './src/routes/chatRoutes.js';
import { notFound, errorHandler } from './src/middleware/errorMiddleware.js';
import { initCronJobs } from './src/jobs/cronJobs.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Health Check
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Hyper-Local Community Ordering & Shop Management API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/impact', impactRoutes);
app.use('/api/chat', chatRoutes);

// Initialize scheduled background tasks (node-cron)
initCronJobs();

// Centralized Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

export default app;