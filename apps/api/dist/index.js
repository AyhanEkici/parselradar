"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const env_1 = require("./config/env");
const logger_1 = require("./utils/logger");
const errorHandler_1 = require("./middleware/errorHandler");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const creditRoutes_1 = __importDefault(require("./routes/creditRoutes"));
const stripeRoutes_1 = __importDefault(require("./routes/stripeRoutes"));
const stripeController_1 = require("./controllers/stripeController");
const propertyRoutes_1 = __importDefault(require("./routes/propertyRoutes"));
const documentRoutes_1 = __importDefault(require("./routes/documentRoutes"));
const consentRoutes_1 = __importDefault(require("./routes/consentRoutes"));
const analysisRoutes_1 = __importDefault(require("./routes/analysisRoutes"));
const reportRoutes_1 = __importDefault(require("./routes/reportRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const auditRoutes_1 = __importDefault(require("./routes/auditRoutes"));
const investorRoutes_1 = __importDefault(require("./routes/investorRoutes"));
const portfolioRoutes_1 = __importDefault(require("./routes/portfolioRoutes"));
const portfolioAnalyticsRoutes_1 = __importDefault(require("./routes/portfolioAnalyticsRoutes"));
const exportRoutes_1 = __importDefault(require("./routes/exportRoutes"));
const organizationRoutes_1 = __importDefault(require("./routes/organizationRoutes"));
const workspaceRoutes_1 = __importDefault(require("./routes/workspaceRoutes"));
const sharedAnalysisRoutes_1 = __importDefault(require("./routes/sharedAnalysisRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const observabilityRoutes_1 = __importDefault(require("./routes/observabilityRoutes"));
const connectorActivationRoutes_1 = __importDefault(require("./routes/connectorActivationRoutes"));
const helmet_1 = __importDefault(require("helmet"));
const requestId_1 = require("./middleware/requestId");
const healthController_1 = require("./health/healthController");
const readinessController_1 = require("./health/readinessController");
const livenessController_1 = require("./health/livenessController");
const workerFactory_1 = require("./runtime/workerFactory");
const queueEvents_1 = require("./runtime/queueEvents");
const queueFactory_1 = require("./runtime/queueFactory");
const redisClient_1 = require("./redis/redisClient");
const buildInfo_1 = require("./generated/buildInfo");
const degradedRuntime_1 = require("./runtime/degradedRuntime");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const app = (0, express_1.default)();
(0, degradedRuntime_1.installRuntimeProcessGuards)();
(0, degradedRuntime_1.recordStartupPhase)('express_initialized', 'Express application created.');
(0, degradedRuntime_1.markRequiredSystemReady)('express', 'Express app initialized.');
(0, degradedRuntime_1.assessRuntimeDegradation)();
// Hardened CORS
const isProd = env_1.ENV.NODE_ENV === 'production';
const vercelProd = 'https://parselradar.vercel.app';
const railwayProd = 'https://parselradar-production.up.railway.app';
const railwayOriginPattern = /^https:\/\/[a-z0-9-]+(?:-[a-z0-9-]+)*\.up\.railway\.app$/i;
const local3000 = 'http://localhost:3000';
const local5173 = 'http://localhost:5173';
// Old regex: /^https:\/\/parselradar-[a-z0-9-]+\.vercel\.app$/
const vercelPreviewPattern = /^https:\/\/parselradar.*\.vercel\.app$/;
const allowedOrigins = [
    env_1.ENV.CLIENT_URL,
    env_1.ENV.API_URL,
    vercelProd,
    railwayProd,
    local3000,
    local5173,
    'http://localhost:3001',
    'http://127.0.0.1:3001',
].filter((value, index, array) => Boolean(value) && array.indexOf(value) === index);
function isOriginAllowed(origin) {
    if (!origin)
        return true;
    if (allowedOrigins.includes(origin))
        return true;
    if (vercelPreviewPattern.test(origin))
        return true;
    if (railwayOriginPattern.test(origin))
        return true;
    return false;
}
// Trust proxy for production (needed for secure cookies behind proxy/load balancer)
if (isProd) {
    app.set('trust proxy', 1);
}
// Helmet for security headers
app.use((0, helmet_1.default)());
// Request ID middleware
app.use(requestId_1.requestIdMiddleware);
// Safe CORS diagnostics (no auth/cookie/token content)
app.use((req, _res, next) => {
    if (process.env.CORS_SAFE_DEBUG === 'true') {
        const requestOrigin = req.get('origin') || undefined;
        console.info('[cors-debug]', {
            origin: requestOrigin || 'none',
            allowed: isOriginAllowed(requestOrigin),
            method: req.method,
            path: req.path,
            nodeEnv: env_1.ENV.NODE_ENV,
            prod: isProd,
        });
    }
    next();
});
// Diagnostic build info endpoint (JSON only)
app.get('/__buildinfo', (_req, res) => {
    const runtimeGitShaCandidate = [
        process.env.GIT_SHA,
        process.env.VERCEL_GIT_COMMIT_SHA,
        process.env.RAILWAY_GIT_COMMIT_SHA,
        process.env.GITHUB_SHA,
        process.env.CI_COMMIT_SHA,
        process.env.SOURCE_VERSION,
    ].find((value) => typeof value === 'string' && value.trim().length > 0) ||
        undefined;
    const runtimeGitSha = runtimeGitShaCandidate || buildInfo_1.BUILD_INFO.gitSha;
    const gitShaSource = runtimeGitShaCandidate ? 'runtime_env' : 'build_info';
    res.json({
        gitSha: runtimeGitSha,
        gitShaSource,
        buildGitSha: buildInfo_1.BUILD_INFO.gitSha,
        buildTime: buildInfo_1.BUILD_INFO.buildTime,
        platformVersion: buildInfo_1.BUILD_INFO.platformVersion,
        routeVersion: buildInfo_1.BUILD_INFO.routeVersion,
        nodeEnv: env_1.ENV.NODE_ENV,
        runtimeDiagnostics: (0, degradedRuntime_1.getRuntimeDiagnostics)(),
    });
});
// Mount Stripe webhook route BEFORE express.json()
app.post('/stripe/webhook', express_1.default.raw({ type: 'application/json' }), stripeController_1.stripeWebhook);
// CORS and options
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        if (isOriginAllowed(origin))
            return callback(null, true);
        return callback(new Error('Not allowed by CORS: ' + origin));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    exposedHeaders: ['X-Request-Id'],
    optionsSuccessStatus: 204,
}));
app.options('*', (0, cors_1.default)({
    origin: function (origin, callback) {
        if (isOriginAllowed(origin))
            return callback(null, true);
        return callback(new Error('Not allowed by CORS: ' + origin));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    exposedHeaders: ['X-Request-Id'],
    optionsSuccessStatus: 204,
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Serve uploaded files for document preview/download
app.use('/uploads', express_1.default.static(path_1.default.resolve(__dirname, 'uploads')));
mongoose_1.default.connect(env_1.ENV.MONGODB_URI)
    .then(() => {
    (0, logger_1.logInfo)('MongoDB connected');
    (0, degradedRuntime_1.recordStartupPhase)('mongo_connected', 'MongoDB connected successfully.');
    (0, degradedRuntime_1.markRequiredSystemReady)('mongo', 'MongoDB connected.');
})
    .catch((err) => {
    (0, logger_1.logError)('MongoDB connection error', err);
    (0, degradedRuntime_1.recordStartupPhase)('mongo_failed', 'MongoDB connection failed.');
    (0, degradedRuntime_1.recordRequiredSystem)('mongo', 'failed', `MongoDB connection failed: ${String(err?.message || err)}`);
});
app.use('/auth', authRoutes_1.default);
(0, degradedRuntime_1.markRequiredSystemReady)('authRoutes', 'Auth routes registered.');
app.use('/credits', creditRoutes_1.default);
// Mount remaining stripe routes (excluding webhook)
app.use('/stripe', (req, res, next) => {
    if (req.path === '/webhook')
        return next();
    return (0, stripeRoutes_1.default)(req, res, next);
});
app.use('/properties', propertyRoutes_1.default);
app.use('/properties', documentRoutes_1.default);
app.use('/properties', consentRoutes_1.default);
app.use('/analysis', analysisRoutes_1.default);
app.use('/reports', reportRoutes_1.default);
app.use('/investor', investorRoutes_1.default);
app.use('/investor', portfolioRoutes_1.default);
app.use('/investor', portfolioAnalyticsRoutes_1.default);
app.use('/exports', exportRoutes_1.default);
// Workspace + organization surfaces (mounted at root)
app.use('/', organizationRoutes_1.default);
app.use('/', workspaceRoutes_1.default);
app.use('/', sharedAnalysisRoutes_1.default);
// Notification and admin observability/connectors surfaces (root-mounted with internal prefixes)
app.use('/', notificationRoutes_1.default);
app.use('/', observabilityRoutes_1.default);
app.use('/', connectorActivationRoutes_1.default);
app.use('/admin', adminRoutes_1.default);
app.use('/', auditRoutes_1.default);
(0, degradedRuntime_1.markRequiredSystemReady)('coreRbac', 'Auth and admin gating routes registered.');
app.get('/health', healthController_1.healthController);
app.get('/health/live', livenessController_1.livenessController);
app.get('/health/ready', readinessController_1.readinessController);
// Debug endpoint: inspect Authorization header and verify token
app.get('/__auth-debug', (req, res) => {
    const authHeader = req.headers['authorization'] || '';
    const hasBearerPrefix = String(authHeader).startsWith('Bearer ');
    const rawTokenSlice7 = hasBearerPrefix ? String(authHeader).slice(7) : '';
    const rawTokenTrimmed = rawTokenSlice7.trim();
    const firstChar = rawTokenSlice7.charCodeAt(0);
    const firstCharTrimmed = rawTokenTrimmed.charCodeAt(0);
    let verifyResult = null;
    if (rawTokenSlice7) {
        try {
            const decoded = jsonwebtoken_1.default.verify(rawTokenSlice7, env_1.ENV.JWT_SECRET);
            verifyResult = { success: true, usedTrimmed: false, decodedId: decoded.id };
        }
        catch (e1) {
            // try trimmed
            try {
                const decoded = jsonwebtoken_1.default.verify(rawTokenTrimmed, env_1.ENV.JWT_SECRET);
                verifyResult = { success: true, usedTrimmed: true, decodedId: decoded.id, note: 'needed trim' };
            }
            catch (e2) {
                verifyResult = { success: false, errorWithRaw: e1.message, errorWithTrimmed: e2.message };
            }
        }
    }
    res.json({
        authHeaderPresent: Boolean(authHeader),
        authHeaderLength: String(authHeader).length,
        hasBearerPrefix,
        tokenLengthAfterSlice7: rawTokenSlice7.length,
        tokenLengthAfterTrim: rawTokenTrimmed.length,
        firstCharCode: firstChar,
        firstCharCodeTrimmed: firstCharTrimmed,
        tokenStart: rawTokenSlice7.substring(0, 10),
        tokenStartTrimmed: rawTokenTrimmed.substring(0, 10),
        verifyResult,
    });
});
app.get('/__jwt-diagnostics', (req, res) => {
    const jwtSecretPresent = Boolean(env_1.ENV.JWT_SECRET);
    const jwtSecretLength = env_1.ENV.JWT_SECRET?.length || 0;
    const jwtSecretSample = env_1.ENV.JWT_SECRET
        ? `${env_1.ENV.JWT_SECRET.substring(0, 5)}...${env_1.ENV.JWT_SECRET.substring(Math.max(0, env_1.ENV.JWT_SECRET.length - 5))}`
        : 'MISSING';
    // Live sign/verify test
    let signVerifyResult = {};
    try {
        const testPayload = { id: 'test-user-id', email: 'test@test.com', role: 'USER' };
        const testToken = jsonwebtoken_1.default.sign(testPayload, env_1.ENV.JWT_SECRET, { expiresIn: '1h' });
        try {
            const decoded = jsonwebtoken_1.default.verify(testToken, env_1.ENV.JWT_SECRET);
            signVerifyResult = { success: true, tokenLength: testToken.length, decodedId: decoded.id };
        }
        catch (verifyErr) {
            signVerifyResult = { success: false, phase: 'verify', error: verifyErr.message, tokenLength: testToken.length };
        }
    }
    catch (signErr) {
        signVerifyResult = { success: false, phase: 'sign', error: signErr.message };
    }
    // Test with a real user token if provided in query
    let externalTokenResult = null;
    const testToken = req.query.token;
    if (testToken) {
        try {
            const decoded = jsonwebtoken_1.default.verify(testToken, env_1.ENV.JWT_SECRET);
            externalTokenResult = { success: true, decoded };
        }
        catch (err) {
            externalTokenResult = { success: false, error: err.message };
        }
    }
    res.json({
        jwtSecretPresent,
        jwtSecretLength,
        jwtSecretSample,
        nodeEnv: env_1.ENV.NODE_ENV,
        signVerifyTest: signVerifyResult,
        externalTokenTest: externalTokenResult,
    });
});
// Ensure unmatched API routes return JSON (prevents HTML "Cannot GET" responses)
app.use((req, res) => {
    const requestId = req.requestId || '';
    res.setHeader('X-Request-Id', requestId);
    res.status(404).json({
        error: 'API route not found',
        path: req.originalUrl,
        requestId,
    });
});
app.use(errorHandler_1.errorHandler);
const server = app.listen(Number(env_1.ENV.PORT), () => {
    (0, degradedRuntime_1.recordStartupPhase)('server_listening', `API listening on port ${env_1.ENV.PORT}.`);
    (0, logger_1.logStartup)();
});
async function shutdownRuntime() {
    await Promise.allSettled([
        (0, workerFactory_1.shutdownWorkers)(),
        (0, queueEvents_1.closeQueueEvents)(),
        (0, queueFactory_1.closeQueues)(),
        (0, redisClient_1.closeRedisClient)(),
    ]);
}
async function handleShutdown(signal) {
    (0, logger_1.logInfo)(`Received ${signal}, shutting down runtime.`);
    await shutdownRuntime();
    server.close(() => process.exit(0));
}
process.on('SIGINT', () => {
    handleShutdown('SIGINT').catch(() => process.exit(1));
});
process.on('SIGTERM', () => {
    handleShutdown('SIGTERM').catch(() => process.exit(1));
});
