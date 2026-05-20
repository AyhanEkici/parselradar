
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
import investorRoutes from './routes/investorRoutes';
import portfolioRoutes from './routes/portfolioRoutes';
import portfolioAnalyticsRoutes from './routes/portfolioAnalyticsRoutes';
import exportRoutes from './routes/exportRoutes';
import organizationRoutes from './routes/organizationRoutes';
import workspaceRoutes from './routes/workspaceRoutes';
import sharedAnalysisRoutes from './routes/sharedAnalysisRoutes';
import notificationRoutes from './routes/notificationRoutes';
import observabilityRoutes from './routes/observabilityRoutes';
import connectorActivationRoutes from './routes/connectorActivationRoutes';
import helmet from 'helmet';
import { requestIdMiddleware } from './middleware/requestId';
import { healthController } from './health/healthController';
import { readinessController } from './health/readinessController';
import { livenessController } from './health/livenessController';
import { shutdownWorkers } from './runtime/workerFactory';
import { closeQueueEvents } from './runtime/queueEvents';
import { closeQueues } from './runtime/queueFactory';
import { closeRedisClient } from './redis/redisClient';
import { BUILD_INFO } from './generated/buildInfo';
import {
  assessRuntimeDegradation,
  installRuntimeProcessGuards,
  markRequiredSystemReady,
  recordRequiredSystem,
  recordStartupPhase,
  getRuntimeDiagnostics,
} from './runtime/degradedRuntime';



const app = express();
installRuntimeProcessGuards();
recordStartupPhase('express_initialized', 'Express application created.');
markRequiredSystemReady('express', 'Express app initialized.');
assessRuntimeDegradation();

// Hardened CORS
const isProd = ENV.NODE_ENV === 'production';
const vercelProd = 'https://parselradar.vercel.app';
const railwayProd = 'https://parselradar-production.up.railway.app';
const railwayOriginPattern = /^https:\/\/[a-z0-9-]+(?:-[a-z0-9-]+)*\.up\.railway\.app$/i;
const local3000 = 'http://localhost:3000';
const local5173 = 'http://localhost:5173';
// Old regex: /^https:\/\/parselradar-[a-z0-9-]+\.vercel\.app$/
const vercelPreviewPattern = /^https:\/\/parselradar.*\.vercel\.app$/;
const allowedOrigins = [
  ENV.CLIENT_URL,
  ENV.API_URL,
  vercelProd,
  railwayProd,
  local3000,
  local5173,
  'http://localhost:3001',
  'http://127.0.0.1:3001',
].filter((value, index, array) => Boolean(value) && array.indexOf(value) === index);

function isOriginAllowed(origin?: string) {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  if (vercelPreviewPattern.test(origin)) return true;
  if (railwayOriginPattern.test(origin)) return true;
  return false;
}

// Trust proxy for production (needed for secure cookies behind proxy/load balancer)
if (isProd) {
  app.set('trust proxy', 1);
}

// Helmet for security headers
app.use(helmet());


// Request ID middleware
app.use(requestIdMiddleware);

// Safe CORS diagnostics (no auth/cookie/token content)
app.use((req, _res, next) => {
  if (process.env.CORS_SAFE_DEBUG === 'true') {
    const requestOrigin = req.get('origin') || undefined;
    console.info('[cors-debug]', {
      origin: requestOrigin || 'none',
      allowed: isOriginAllowed(requestOrigin),
      method: req.method,
      path: req.path,
      nodeEnv: ENV.NODE_ENV,
      prod: isProd,
    });
  }
  next();
});

// Diagnostic build info endpoint (JSON only)
app.get('/__buildinfo', (_req, res) => {
  const runtimeGitShaCandidate =
    [
      process.env.GIT_SHA,
      process.env.VERCEL_GIT_COMMIT_SHA,
      process.env.RAILWAY_GIT_COMMIT_SHA,
      process.env.GITHUB_SHA,
      process.env.CI_COMMIT_SHA,
      process.env.SOURCE_VERSION,
    ].find((value) => typeof value === 'string' && value.trim().length > 0) ||
    undefined;
  const runtimeGitSha = runtimeGitShaCandidate || BUILD_INFO.gitSha;
  const gitShaSource = runtimeGitShaCandidate ? 'runtime_env' : 'build_info';

  res.json({
    gitSha: runtimeGitSha,
    gitShaSource,
    buildGitSha: BUILD_INFO.gitSha,
    buildTime: BUILD_INFO.buildTime,
    platformVersion: BUILD_INFO.platformVersion,
    routeVersion: BUILD_INFO.routeVersion,
    nodeEnv: ENV.NODE_ENV,
    runtimeDiagnostics: getRuntimeDiagnostics(),
  });
});

// Mount Stripe webhook route BEFORE express.json()
app.post('/stripe/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// CORS and options
app.use(
  cors({
    origin: function (origin, callback) {
      if (isOriginAllowed(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS: ' + origin));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    exposedHeaders: ['X-Request-Id'],
    optionsSuccessStatus: 204,
  })
);
app.options(
  '*',
  cors({
    origin: function (origin, callback) {
      if (isOriginAllowed(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS: ' + origin));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    exposedHeaders: ['X-Request-Id'],
    optionsSuccessStatus: 204,
  })
);

app.use(express.json());

app.use(cookieParser());

// Serve uploaded files for document preview/download
app.use('/uploads', express.static(path.resolve(__dirname, 'uploads')));

mongoose.connect(ENV.MONGODB_URI)
  .then(() => {
    logInfo('MongoDB connected');
    recordStartupPhase('mongo_connected', 'MongoDB connected successfully.');
    markRequiredSystemReady('mongo', 'MongoDB connected.');
  })
  .catch((err) => {
    logError('MongoDB connection error', err);
    recordStartupPhase('mongo_failed', 'MongoDB connection failed.');
    recordRequiredSystem('mongo', 'failed', `MongoDB connection failed: ${String((err as any)?.message || err)}`);
  });


app.use('/auth', authRoutes);
markRequiredSystemReady('authRoutes', 'Auth routes registered.');
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
app.use('/investor', investorRoutes);
app.use('/investor', portfolioRoutes);
app.use('/investor', portfolioAnalyticsRoutes);
app.use('/exports', exportRoutes);

// Workspace + organization surfaces (mounted at root)
app.use('/', organizationRoutes);
app.use('/', workspaceRoutes);
app.use('/', sharedAnalysisRoutes);

// Notification and admin observability/connectors surfaces (root-mounted with internal prefixes)
app.use('/', notificationRoutes);
app.use('/', observabilityRoutes);
app.use('/', connectorActivationRoutes);

app.use('/admin', adminRoutes);
app.use('/', auditRoutes);
markRequiredSystemReady('coreRbac', 'Auth and admin gating routes registered.');

app.get('/health', healthController);
app.get('/health/live', livenessController);
app.get('/health/ready', readinessController);

// Ensure unmatched API routes return JSON (prevents HTML "Cannot GET" responses)
app.use((req, res) => {
  const requestId = (req as any).requestId || '';
  res.setHeader('X-Request-Id', requestId);
  res.status(404).json({
    error: 'API route not found',
    path: req.originalUrl,
    requestId,
  });
});

app.use(errorHandler);

const server = app.listen(Number(ENV.PORT), () => {
  recordStartupPhase('server_listening', `API listening on port ${ENV.PORT}.`);
  logStartup();
});

async function shutdownRuntime() {
  await Promise.allSettled([
    shutdownWorkers(),
    closeQueueEvents(),
    closeQueues(),
    closeRedisClient(),
  ]);
}

async function handleShutdown(signal: string) {
  logInfo(`Received ${signal}, shutting down runtime.`);
  await shutdownRuntime();
  server.close(() => process.exit(0));
}

process.on('SIGINT', () => {
  handleShutdown('SIGINT').catch(() => process.exit(1));
});

process.on('SIGTERM', () => {
  handleShutdown('SIGTERM').catch(() => process.exit(1));
});
