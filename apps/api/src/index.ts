
import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { ENV } from './config/env';
import { logInfo, logError, logStartup } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/authRoutes';
import creditRoutes from './routes/creditRoutes';
import stripeRoutes from './routes/stripeRoutes';
import { stripeWebhook } from './controllers/stripeController';
import expressRaw from 'express';
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

// Hardened CORS
const isProd = ENV.NODE_ENV === 'production';
const vercelProd = 'https://parselradar.vercel.app';
// Old regex: /^https:\/\/parselradar-[a-z0-9-]+\.vercel\.app$/
const vercelPreviewPattern = /^https:\/\/parselradar.*\.vercel\.app$/;
const allowedOrigins = isProd
  ? [ENV.CLIENT_URL, vercelProd]
  : [ENV.CLIENT_URL, vercelProd, 'http://localhost:3001', 'http://127.0.0.1:3001'];

// Trust proxy for production (needed for secure cookies behind proxy/load balancer)
if (isProd) {
  app.set('trust proxy', 1);
}

// Helmet for security headers
app.use(helmet());


// Request ID middleware
app.use(requestIdMiddleware);

// Mount Stripe webhook route BEFORE express.json()
app.post('/stripe/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// CORS and options
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      if (vercelPreviewPattern.test(origin)) return callback(null, true);
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
      if (vercelPreviewPattern.test(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS: ' + origin));
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    exposedHeaders: ['X-Request-Id'],
  })
);

app.use(express.json());

app.use(cookieParser());

// Serve uploaded files for document preview/download
app.use('/uploads', express.static(path.resolve(__dirname, 'uploads')));

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
// Mount remaining stripe routes (excluding webhook)
app.use('/stripe', (req, res, next) => {
  if (req.path === '/webhook') return next();
  return stripeRoutes(req, res, next);
});
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
