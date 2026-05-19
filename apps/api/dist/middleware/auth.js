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
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.JWT_SECRET);
        const user = await User_1.default.findById(decoded.id);
        if (!user) {
            await (0, accessAudit_1.recordAccessDecision)({
                userId: decoded.id,
                role: undefined,
                resourceType: 'Auth',
                resourceId: decoded.id,
                decision: 'deny',
                reason: 'token_user_not_found',
                route: req.path,
                method: req.method,
                ip: req.ip,
                userAgent: req.get('user-agent') || undefined,
            });
            return res.status(401).json({ error: 'Kullanıcı bulunamadı' });
        }
        req.user = {
            _id: String(user._id),
            email: user.email,
            name: user.name,
            role: user.role,
        };
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
