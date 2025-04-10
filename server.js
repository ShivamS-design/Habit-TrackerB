import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import connectDB from './db.js';
import * as routes from './routes/index.js';

dotenv.config();

const app = express();

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json({ limit: '1mb' }));
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

// Serve static files (like favicon.ico)
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
connectDB();

// Debug: log all requests
app.use((req, res, next) => {
  console.log(`🔹 [${req.method}] ${req.originalUrl}`);
  next();
});

// Route registrations
app.use(routes.faviconRoute);
app.use('/api/auth', routes.authRoutes);
app.use('/api/tasks', routes.taskRoutes);
app.use('/api/habits', routes.habitRoutes);
app.use('/api/local-storage', routes.localStorageRoutes);
app.use('/api/spin-wheel', routes.spinWheelRoutes);
app.use('/api/leaderboard', routes.leaderboardRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Backend is active',
    deployed: true
  });
});

// Catch-all 404
app.use('*', (req, res) => {
  console.warn(`⚠️  Route not found: ${req.originalUrl}`);
  res.status(404).json({ error: 'API route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('🔥 Global Error Handler:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Only start local server if not on Vercel
if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running locally on http://localhost:${PORT}`);
  });
}

export default app;
