"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logInfo = logInfo;
exports.logWarn = logWarn;
exports.logError = logError;
exports.logStartup = logStartup;
// apps/api/src/utils/logger.ts
const env_1 = require("../config/env");
function logInfo(msg, meta, requestId) {
    const rid = requestId ? `[requestId:${requestId}]` : '';
    if (env_1.ENV.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.info('[INFO]', rid, msg, meta || '');
    }
}
function logWarn(msg, meta, requestId) {
    const rid = requestId ? `[requestId:${requestId}]` : '';
    // eslint-disable-next-line no-console
    console.warn('[WARN]', rid, msg, meta || '');
}
function logError(msg, meta, requestId) {
    const rid = requestId ? `[requestId:${requestId}]` : '';
    // eslint-disable-next-line no-console
    console.error('[ERROR]', rid, msg, meta || '');
}
function logStartup(requestId) {
    logInfo('API startup', { env: env_1.ENV.NODE_ENV, port: env_1.ENV.PORT }, requestId);
}
