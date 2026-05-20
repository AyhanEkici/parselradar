"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = exports.requireAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const User_1 = __importDefault(require("../models/User"));
const accessAudit_1 = require("../utils/accessAudit");
const sessionIntegrityValidator_1 = require("../session/sessionIntegrityValidator");
const authConsistencyVerifier_1 = require("../session/authConsistencyVerifier");
const authSessionAudit_1 = require("../session/authSessionAudit");
const requireAuth = async (req, res, next) => {
    let token;
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.slice(7);
    }
    else if (req.cookies?.token) {
        token = req.cookies.token;
    }
    if (!token) {
        await (0, authSessionAudit_1.authSessionAudit)({
            userId: undefined,
            role: undefined,
            decision: 'deny',
            reason: 'missing_token',
            route: req.path,
            method: req.method,
            ip: req.ip,
            userAgent: req.get('user-agent') || undefined,
        });
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
        return res.status(401).json({ error: 'Yetkisiz' });
    }
    const integrity = (0, sessionIntegrityValidator_1.sessionIntegrityValidator)(token);
    if (!integrity.valid) {
        await (0, authSessionAudit_1.authSessionAudit)({
            userId: integrity.userId,
            role: undefined,
            decision: 'deny',
            reason: integrity.reason,
            route: req.path,
            method: req.method,
            ip: req.ip,
            userAgent: req.get('user-agent') || undefined,
        });
        return res.status(401).json({ error: 'Geçersiz oturum' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.JWT_SECRET);
        const tokenUserId = decoded.id || decoded.userId || decoded.sub;
        if (!tokenUserId) {
            return res.status(401).json({ error: 'Geçersiz oturum' });
        }
        const user = await User_1.default.findById(tokenUserId);
        if (!user) {
            await (0, accessAudit_1.recordAccessDecision)({
                userId: String(tokenUserId),
                role: undefined,
                resourceType: 'Auth',
                resourceId: String(tokenUserId),
                decision: 'deny',
                reason: 'token_user_not_found',
                route: req.path,
                method: req.method,
                ip: req.ip,
                userAgent: req.get('user-agent') || undefined,
            });
            return res.status(401).json({ error: 'Kullanıcı bulunamadı' });
        }
        const consistency = (0, authConsistencyVerifier_1.authConsistencyVerifier)({
            tokenUserId: String(tokenUserId),
            dbUserId: String(user._id),
            dbRole: user.role,
        });
        const passwordChangedAt = user.passwordChangedAt ? new Date(user.passwordChangedAt).getTime() : undefined;
        const tokenIssuedAt = typeof decoded.iat === 'number' ? decoded.iat * 1000 : undefined;
        if (passwordChangedAt && tokenIssuedAt && tokenIssuedAt < passwordChangedAt) {
            await (0, authSessionAudit_1.authSessionAudit)({
                userId: String(user._id),
                role: user.role,
                decision: 'deny',
                reason: 'password_changed',
                route: req.path,
                method: req.method,
                ip: req.ip,
                userAgent: req.get('user-agent') || undefined,
            });
            return res.status(401).json({ error: 'Geçersiz oturum' });
        }
        if (!consistency.consistent) {
            await (0, authSessionAudit_1.authSessionAudit)({
                userId: String(user._id),
                role: user.role,
                decision: 'deny',
                reason: consistency.reason,
                route: req.path,
                method: req.method,
                ip: req.ip,
                userAgent: req.get('user-agent') || undefined,
            });
            return res.status(401).json({ error: 'Geçersiz oturum' });
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
            reason: 'invalid_token',
            route: req.path,
            method: req.method,
            ip: req.ip,
            userAgent: req.get('user-agent') || undefined,
        });
        return res.status(401).json({ error: 'Geçersiz oturum' });
    }
};
exports.requireAuth = requireAuth;
exports.auth = exports.requireAuth;
