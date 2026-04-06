import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

import authRoutes from './routes/auth';
import analyticsRoutes from './routes/analytics';
import inboxRoutes from './routes/inbox';
import aiRoutes from './routes/ai';
import engagementRoutes from './routes/engagement';
import scheduleRoutes from './routes/schedule';
import searchRoutes from './routes/search';
import notificationRoutes from './routes/notifications';
import settingsRoutes from './routes/settings';
import auditRoutes from './routes/audit';
import exportRoutes from './routes/export';
import { initTokenRefreshWorker } from './workers/tokenRefreshWorker';
import { initInboxPollerWorker } from './workers/inboxPollerWorker';
import { initPostSyncWorker } from './workers/postSyncWorker';
import { initSchedulerWorker } from './workers/schedulerWorker';
import { initEmailDigestWorker } from './workers/emailDigestWorker';
import path from 'path';

const app = express();
const httpServer = createServer(app);

// ─── Socket.io ───────────────────────────────────────────────────────────────
export const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.info(`[Socket.io] Client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.info(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    credentials: true,
  }),
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/auth', authRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/inbox', inboxRoutes);
app.use('/ai', aiRoutes);
app.use('/engagement', engagementRoutes);
app.use('/schedule', scheduleRoutes);
app.use('/search', searchRoutes);
app.use('/notifications', notificationRoutes);
app.use('/settings', settingsRoutes);
app.use('/audit', auditRoutes);
app.use('/export', exportRoutes);

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ─── Global error handler ────────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Error]', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Start server ─────────────────────────────────────────────────────────────
const PORT = Number(process.env.PORT ?? 3001);
httpServer.listen(PORT, async () => {
  console.info(`🚀 SocialHub API running on http://localhost:${PORT}`);
  
  // Dev Mode: Ensure demo user exists since auth middleware falls back to it
  if (process.env.NODE_ENV === 'development') {
    const { prisma } = require('./db');
    const existing = await prisma.user.findUnique({ where: { id: 'demo-user-id' } });
    if (!existing) {
      await prisma.user.create({
        data: {
          id: 'demo-user-id',
          email: 'demo@socialhub.app',
          passwordHash: 'dummy_hash_for_demo',
        }
      });
      console.info(`[Dev] Seeded demo-user-id into database.`);
    }
  }

  // Initialize Background Workers
  await initTokenRefreshWorker();
  await initInboxPollerWorker();
  await initPostSyncWorker();
  await initSchedulerWorker();
  await initEmailDigestWorker();
});

export default app;
