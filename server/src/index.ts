import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import authRoutes from './routes/auth';
import zoneRoutes from './routes/zones';
import alertRoutes from './routes/alerts';
import reportRoutes from './routes/reports';
import analyticsRoutes from './routes/analytics';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration for production & local development
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || '*',
    credentials: true,
  })
);
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/zones', zoneRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Serve frontend static build if client/dist exists (Full-stack unified deployment)
const possibleClientPaths = [
  path.resolve(__dirname, '../../client/dist'),
  path.resolve(__dirname, '../client/dist'),
  path.resolve(process.cwd(), 'client/dist'),
  path.resolve(process.cwd(), '../client/dist'),
];

const clientDistPath = possibleClientPaths.find((p) => fs.existsSync(p));

if (clientDistPath) {
  console.log(`Serving frontend static assets from: ${clientDistPath}`);
  app.use(express.static(clientDistPath));

  // Express 5 compatible SPA fallback
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && req.path !== '/health') {
      return res.sendFile(path.join(clientDistPath, 'index.html'));
    }
    next();
  });
}

app.listen(PORT, () => {
  console.log(`FireBerg Server running on port ${PORT}`);
});
