"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
function errorHandler(err, req, res, next) {
    const statusCode = typeof err === 'object' &&
        err !== null &&
        'statusCode' in err &&
        typeof err.statusCode === 'number'
        ? err.statusCode
        : 500;
    const message = typeof err === 'object' &&
        err !== null &&
        'message' in err &&
        typeof err.message === 'string'
        ? err.message
        : 'Internal server error';
    const requestId = req.requestId || '';
    // Log error with requestId
    (0, logger_1.logError)('API error', { requestId, err });
    // Safe error response
    const errorResponse = {
        error: message,
        requestId,
    };
    if (env_1.ENV.NODE_ENV !== 'production' && err instanceof Error) {
        errorResponse.stack = err.stack;
    }
    res.setHeader('X-Request-Id', requestId);
    res.status(statusCode).json(errorResponse);
}
