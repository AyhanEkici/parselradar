
import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { ENV } from './config/env';
import { logInfo, logError, logStartup } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/authRoutes';
import creditRoutes from './routes/creditRoutes';
import stripeRoutes from './routes/stripeRoutes';
import propertyRoutes from './routes/propertyRoutes';
import documentRoutes from './routes/documentRoutes';
import consentRoutes from './routes/consentRoutes';
import analysisRoutes from './routes/analysisRoutes';
import reportRoutes from './routes/reportRoutes';
import adminRoutes from './routes/adminRoutes';
import auditRoutes from './routes/auditRoutes';
import helmet from 'helmet';
import { requestIdMiddleware } from './middleware/requestId';

const app = express();

// Helmet for security headers
app.use(helmet());

// Request ID middleware
app.use(requestIdMiddleware);

// Hardened CORS
const isProd = ENV.NODE_ENV === 'production';
const allowedOrigins = isProd
  ? [ENV.CLIENT_URL]
  : [ENV.CLIENT_URL, 'http://localhost:3001', 'http://127.0.0.1:3001'];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS: ' + origin));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    exposedHeaders: ['X-Request-Id'],
  })
);
app.options(
  '*',
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS: ' + origin));
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    exposedHeaders: ['X-Request-Id'],
  })
);

app.use(express.json());
app.use(cookieParser());

mongoose.connect(ENV.MONGODB_URI)
  .then(() => {
    logInfo('MongoDB connected');
  })
  .catch((err) => {
    logError('MongoDB connection error', err);
    process.exit(1);
  });

app.use('/auth', authRoutes);
app.use('/credits', creditRoutes);
app.use('/stripe', stripeRoutes);
app.use('/properties', propertyRoutes);
app.use('/properties', documentRoutes);
app.use('/properties', consentRoutes);
app.use('/analysis', analysisRoutes);
app.use('/reports', reportRoutes);

app.use('/admin', adminRoutes);
app.use('/', auditRoutes);

app.get('/health', (req, res) => {
  res.setHeader('X-Request-Id', req.requestId || '');
  res.json({ status: 'ok', requestId: req.requestId });
});

app.use(errorHandler);

app.listen(Number(ENV.PORT), () => {
  logStartup();
});
