"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalApiLimiter = exports.stripeLimiter = exports.analysisLimiter = exports.authLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auditLog_1 = require("../utils/auditLog");
async function jsonRateLimitHandler(req, res) {
    await (0, auditLog_1.logAuditEvent)({
        type: 'rate_limit',
        actorUserId: req.user?._id?.toString(),
        actorRole: req.user?.role,
        targetType: 'IP',
        targetId: req.ip,
        message: 'Rate limit hit',
        metadata: { path: req.path, method: req.method },
        ip: req.ip,
        userAgent: req.get('user-agent'),
        success: false,
    });
    res.status(429).json({ error: 'Too many requests', code: 'RATE_LIMITED' });
}
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    skipSuccessfulRequests: true,
    handler: jsonRateLimitHandler,
    standardHeaders: true,
    legacyHeaders: false,
});
exports.analysisLimiter = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 3,
    handler: jsonRateLimitHandler,
    standardHeaders: true,
    legacyHeaders: false,
});
exports.stripeLimiter = (0, express_rate_limit_1.default)({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 10,
    handler: jsonRateLimitHandler,
    standardHeaders: true,
    legacyHeaders: false,
});
exports.generalApiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 60,
    handler: jsonRateLimitHandler,
    standardHeaders: true,
    legacyHeaders: false,
});
