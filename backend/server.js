import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
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
import replyRoutes from './src/routes/replyRoutes.js';
import contactRoutes from './src/routes/contactRoutes.js';
import { notFound, errorHandler } from './src/middleware/errorMiddleware.js';
import {
  authLimiter,
  publicWriteLimiter,
  apiLimiter,
  detectMaliciousInput,
} from './src/middleware/securityMiddleware.js';
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

// 2. CORS Configuration
// Production frontends are supplied via CORS_ORIGINS (comma-separated).
// Local dev origins are always allowed so development keeps working.
const defaultOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

const configuredOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = [...defaultOrigins, ...configuredOrigins];

// Allow any *.vercel.app preview/production deployment automatically
const isAllowedOrigin = (origin) => {
  if (!origin) return true; // same-origin / server-to-server / curl
  if (allowedOrigins.includes(origin)) return true;
  if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)) return true;
  if (/^https:\/\/[a-z0-9-]+\.onrender\.com$/i.test(origin)) return true;
  return false;
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        // Reject unknown origins rather than silently allowing them
        callback(new Error(`Origin not allowed by CORS: ${origin}`));
      }
    },
    credentials: true,
  })
);

// 3. Body Parsing & Compression Middleware
// Security headers (nosniff, X-Frame-Options, referrer policy, HSTS, etc.)
app.use(
  helmet({
    contentSecurityPolicy: false, // disabled so the SPA + CDN assets still load
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(compression());
// Hard cap on request body size to blunt payload-flood attacks
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

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

// Reject injection / traversal payloads before they reach any handler
app.use('/api', detectMaliciousInput);

// General ceiling to blunt scraping and request floods
app.use('/api', apiLimiter);

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/impact', impactRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/donations', publicWriteLimiter, donationRoutes);
app.use('/api/replies', replyRoutes);
app.use('/api/contact', publicWriteLimiter, contactRoutes);

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