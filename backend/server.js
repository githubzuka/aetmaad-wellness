import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import compression from 'compression';
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
import eventRoutes from './src/routes/eventRoutes.js';
import donationRoutes from './src/routes/donationRoutes.js';
import { notFound, errorHandler } from './src/middleware/errorMiddleware.js';
import { initCronJobs } from './src/jobs/cronJobs.js';

// Load environment variables
dotenv.config();

// Resolve __dirname in ES Module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// 1. Force HTTPS in Production
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
});

// 2. CORS Configuration (Allows Vite Frontend on port 3000 & 5173)
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);

// 3. Body Parsing & Compression Middleware
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Serve Static Files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 5. API Health Check
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Hyper-Local Community Ordering & Shop Management API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// 6. API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/impact', impactRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/donations', donationRoutes);

// 7. Serve Frontend Assets in Production
const frontendBuildPath = path.join(__dirname, '../../frontend/build');
app.use(express.static(frontendBuildPath));

// Fallback Route for SPA React Frontend
app.get('*', (req, res) => {
  if (req.url.startsWith('/api/')) {
    return res.status(404).json({ message: 'API Endpoint not found' });
  }
  res.sendFile(path.join(frontendBuildPath, 'index.html'));
});

// 8. Initialize Scheduled Background Tasks (node-cron)
initCronJobs();

// 9. Centralized Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// 10. Start Server (Defaulting to Port 5001)
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

export default app;