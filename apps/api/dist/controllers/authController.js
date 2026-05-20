"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSessionDiagnostics = exports.getMe = exports.logout = exports.login = exports.register = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const auditLog_1 = require("../utils/auditLog");
const env_1 = require("../config/env");
const roleHydrationVerifier_1 = require("../session/roleHydrationVerifier");
const sessionIntegrityValidator_1 = require("../session/sessionIntegrityValidator");
function normalizeEmail(email) {
    return String(email || '').trim().toLowerCase();
}
function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function safeAuthDebug(event, payload) {
    if (process.env.AUTH_SAFE_DEBUG !== 'true')
        return;
    console.info(`[auth-debug] ${event}`, payload);
}
function isMongoReady() {
    return mongoose_1.default.connection.readyState === 1;
}
const register = async (req, res) => {
    const { password, name } = req.body;
    const email = normalizeEmail(req.body?.email);
    safeAuthDebug('register_attempt', { routeHit: '/auth/register', emailNormalized: Boolean(email) });
    if (!email || !password || !name)
        return res.status(400).json({ error: 'Eksik bilgi' });
    if (!isMongoReady())
        return res.status(503).json({ error: 'Veri deposu hazır değil' });
    const exists = await User_1.default.findOne({ email });
    if (exists)
        return res.status(409).json({ error: 'Bu e-posta zaten kayıtlı' });
    const passwordHash = await bcrypt_1.default.hash(password, 10);
    const user = await User_1.default.create({ email, passwordHash, passwordChangedAt: new Date(), name, role: 'USER' });
    console.log('[authController register] SIGNING TOKEN', {
        jwtSecretLength: env_1.JWT_SECRET?.length,
        jwtSecretStart: env_1.JWT_SECRET?.substring(0, 5),
    });
    const token = jsonwebtoken_1.default.sign({ id: String(user._id), userId: String(user._id), sub: String(user._id), email: user.email, role: user.role }, env_1.JWT_SECRET, { expiresIn: '7d' });
    global.lastJwtDebug = {
        timestamp: new Date().toISOString(),
        type: 'token_signed_register',
        jwtSecretLength: env_1.JWT_SECRET?.length,
        jwtSecretStart: env_1.JWT_SECRET?.substring(0, 5),
        tokenLength: token.length,
        userId: String(user._id),
    };
    console.log('[authController register] TOKEN SIGNED', { tokenLength: token.length });
    res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7
    });
    res.json({ token, user: { id: String(user._id), email: user.email, name: user.name, role: user.role } });
    await (0, auditLog_1.logAuditEvent)({
        type: 'auth_register',
        actorUserId: user._id.toString(),
        actorRole: user.role,
        targetType: 'User',
        targetId: user._id.toString(),
        message: 'Register success',
        metadata: { email, name },
        ip: req.ip,
        userAgent: req.get('user-agent'),
        success: true,
    });
};
exports.register = register;
const login = async (req, res) => {
    const { password } = req.body;
    const email = normalizeEmail(req.body?.email);
    safeAuthDebug('login_attempt', {
        routeHit: '/auth/login',
        emailNormalized: email,
        passwordLength: String(password || '').length,
    });
    if (!isMongoReady())
        return res.status(503).json({ error: 'Veri deposu hazır değil' });
    let user = await User_1.default.findOne({ email }).select('+passwordHash');
    if (!user && email) {
        // Backward-compatible recovery for legacy mixed-case emails.
        user = await User_1.default.findOne({ email: { $regex: `^${escapeRegExp(email)}$`, $options: 'i' } }).select('+passwordHash');
        if (user && user.email !== email) {
            user.email = email;
            await user.save();
        }
    }
    safeAuthDebug('login_user_lookup', {
        userFound: Boolean(user),
        role: user?.role || 'UNKNOWN',
        hasPasswordHash: Boolean(user?.passwordHash),
    });
    if (!user)
        return res.status(401).json({ error: 'Kullanıcı bulunamadı' });
    if (!user?.passwordHash)
        return res.status(401).json({ error: 'Şifre doğrulama alanı eksik' });
    const valid = await bcrypt_1.default.compare(password, user.passwordHash);
    safeAuthDebug('login_password_check', { passwordValid: valid, role: user.role });
    if (!valid)
        return res.status(401).json({ error: 'Şifre hatalı' });
    console.log('[authController login] SIGNING TOKEN', {
        jwtSecretLength: env_1.JWT_SECRET?.length,
        jwtSecretStart: env_1.JWT_SECRET?.substring(0, 5),
        userId: String(user._id),
    });
    const token = jsonwebtoken_1.default.sign({ id: String(user._id), userId: String(user._id), sub: String(user._id), email: user.email, role: user.role }, env_1.JWT_SECRET, { expiresIn: '7d' });
    global.lastJwtDebug = {
        timestamp: new Date().toISOString(),
        type: 'token_signed_login',
        jwtSecretLength: env_1.JWT_SECRET?.length,
        jwtSecretStart: env_1.JWT_SECRET?.substring(0, 5),
        tokenLength: token.length,
        userId: String(user._id),
    };
    console.log('[authController login] TOKEN SIGNED', { tokenLength: token.length });
    res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7
    });
    const roleState = (0, roleHydrationVerifier_1.roleHydrationVerifier)(user.role);
    if (!roleState.valid)
        return res.status(401).json({ error: 'Geçersiz rol durumu' });
    safeAuthDebug('login_token_issued', {
        tokenIssued: Boolean(token),
        role: roleState.normalizedRole,
    });
    res.json({ token, user: { id: String(user._id), email: user.email, name: user.name, role: roleState.normalizedRole } });
    await (0, auditLog_1.logAuditEvent)({
        type: 'auth_login',
        actorUserId: user._id.toString(),
        actorRole: user.role,
        targetType: 'User',
        targetId: user._id.toString(),
        message: 'Login success',
        metadata: { email },
        ip: req.ip,
        userAgent: req.get('user-agent'),
        success: true,
    });
};
exports.login = login;
const logout = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/'
    });
    res.json({ ok: true });
    (0, auditLog_1.logAuditEvent)({
        type: 'auth_logout',
        actorUserId: undefined,
        actorRole: undefined,
        targetType: 'User',
        targetId: undefined,
        message: 'Logout',
        metadata: {},
        ip: req.ip,
        userAgent: req.get('user-agent'),
        success: true,
    });
};
exports.logout = logout;
const getMe = (req, res) => {
    const user = req.user;
    if (!user)
        return res.status(401).json({ error: 'Yetkisiz' });
    res.json({ id: user._id, email: user.email, name: user.name, role: user.role });
};
exports.getMe = getMe;
const getSessionDiagnostics = (req, res) => {
    const authHeader = req.headers['authorization'];
    const bearer = typeof authHeader === 'string' && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
    const cookieToken = req.cookies?.token;
    const token = bearer || cookieToken;
    const integrity = (0, sessionIntegrityValidator_1.sessionIntegrityValidator)(token);
    const roleState = (0, roleHydrationVerifier_1.roleHydrationVerifier)(req.user?.role);
    return res.json({
        authenticated: Boolean(req.user),
        tokenPresent: Boolean(token),
        tokenSource: bearer ? 'bearer' : cookieToken ? 'cookie' : 'none',
        sessionTrust: integrity.sessionTrust,
        tokenReason: integrity.reason,
        roleHydrated: roleState.valid,
        role: req.user?.role || 'UNKNOWN',
        roleReason: roleState.reason,
        userId: req.user?._id || null,
    });
};
exports.getSessionDiagnostics = getSessionDiagnostics;
