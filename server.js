import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Route imports
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import habitRoutes from './routes/habitRoutes.js';
import localStorageRoutes from './routes/LocalStorageRoutes.js';
import spinWheelRoutes from './routes/spinWheelRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import faviconRoute from './routes/faviconRoute.js';

// Initialize dotenv
dotenv.config();

// Initialize express app
const app = express();

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB connection caching (for serverless environments)
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb && mongoose.connection.readyState === 1) {
    console.log('✅ Using cached MongoDB connection');
    return cachedDb;
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ MongoDB connected');
    cachedDb = db;
    return db;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    throw err;
  }
}

// Middleware
app.use(express.json({ limit: '1mb' }));
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));

// Static file serving (e.g., favicon)
app.use(express.static(path.join(__dirname, 'public')));

// Request logger (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`🔹 [${req.method}] ${req.originalUrl}`);
    console.log('🔸 Headers:', req.headers);
    console.log('🔸 Body:', req.body);
    next();
  });
}

// Database connection middleware
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (err) {
    console.error('❌ DB Middleware Error:', err);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Routes
app.use(faviconRoute); // Serve favicon
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Backend is active',
    deployed: true,
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/local-storage', localStorageRoutes);
app.use('/api/spin-wheel', spinWheelRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Fallback route for undefined endpoints
app.use('*', (req, res) => {
  console.warn(`🔸 Route not found: ${req.originalUrl}`);
  res.status(404).json({ error: 'API route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('🔥 Global Error Handler:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start the server in local dev environment
connectToDatabase()
  .then(() => {
    if (process.env.VERCEL !== '1') { // Check if running locally and not on Vercel
      const PORT = process.env.PORT || 5000;
      app.listen(PORT, () => {
        console.log(`🚀 Server running at http://localhost:${PORT}`);
      });
    }
  })
  .catch((err) => {
    console.error('❌ Startup DB connection failed:', err);
  });

export default app;
