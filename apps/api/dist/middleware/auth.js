"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = exports.requireAuth = void 0;
const accessAudit_1 = require("../utils/accessAudit");
const authSessionAudit_1 = require("../session/authSessionAudit");
const canonicalAuthValidator_1 = require("../session/canonicalAuthValidator");
function safeAuthWarning(event, payload) {
    if (process.env.AUTH_SAFE_DEBUG === 'true') {
        console.warn(`[auth-warn] ${event}`, payload);
    }
}
function safeAuthDiag(event, payload) {
    if (process.env.AUTH_INVALIDATION_DIAG === 'true' || process.env.AUTH_SAFE_DEBUG === 'true') {
        console.info(`[auth-diag] ${event}`, payload);
    }
}
const requireAuth = async (req, res, next) => {
    const deny = async (reason, userId) => {
        await (0, authSessionAudit_1.authSessionAudit)({
            userId,
            role: undefined,
            decision: 'deny',
            reason,
            route: req.path,
            method: req.method,
            ip: req.ip,
            userAgent: req.get('user-agent') || undefined,
        });
        return res.status(401).json({ error: 'Geçersiz oturum', code: reason });
    };
    let token;
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.slice(7);
    }
    else if (req.cookies?.token) {
        token = req.cookies.token;
    }
    if (!token) {
        await (0, accessAudit_1.recordAccessDecision)({
            userId: undefined,
            role: undefined,
            resourceType: 'Auth',
            decision: 'deny',
            reason: 'missing_token',
            route: req.path,
            method: req.method,
            ip: req.ip,
            userAgent: req.get('user-agent') || undefined,
        });
        return deny('MISSING_AUTH_TOKEN');
    }
    try {
        const validation = await (0, canonicalAuthValidator_1.validateAuthToken)(token);
        safeAuthDiag('password_change_comparison', {
            requestPhase: `${req.method}:${req.path}`,
            ...validation.diagnostics,
        });
        if (!validation.ok) {
            const userId = validation.user?._id ? String(validation.user._id) : undefined;
            if (validation.code === canonicalAuthValidator_1.PASSWORD_CHANGED_AFTER_IAT_CODE) {
                safeAuthDiag('password_change_invalidation', {
                    requestPhase: `${req.method}:${req.path}`,
                    ...validation.diagnostics,
                });
            }
            return deny(validation.code, userId);
        }
        if (validation.code === 'TOKEN_VERIFIED_INVALID_PASSWORD_CHANGED_AT') {
            safeAuthWarning('invalid_password_changed_at', {
                userId: String(validation.user?._id || ''),
                route: req.path,
            });
        }
        const user = validation.user;
        if (!user) {
            return deny('TOKEN_VERIFY_EXCEPTION');
        }
        req.user = {
            _id: String(user._id),
            email: user.email,
            name: user.name,
            role: user.role,
        };
        await (0, authSessionAudit_1.authSessionAudit)({
            userId: String(user._id),
            role: user.role,
            decision: 'allow',
            reason: 'session_verified',
            route: req.path,
            method: req.method,
            ip: req.ip,
            userAgent: req.get('user-agent') || undefined,
        });
        next();
    }
    catch {
        await (0, accessAudit_1.recordAccessDecision)({
            userId: undefined,
            role: undefined,
            resourceType: 'Auth',
            decision: 'deny',
            reason: 'TOKEN_VERIFY_EXCEPTION',
            route: req.path,
            method: req.method,
            ip: req.ip,
            userAgent: req.get('user-agent') || undefined,
        });
        return res.status(401).json({ error: 'Geçersiz oturum', code: 'TOKEN_VERIFY_EXCEPTION' });
    }
};
exports.requireAuth = requireAuth;
exports.auth = exports.requireAuth;
