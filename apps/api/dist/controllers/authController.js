"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSessionDiagnostics = exports.getMe = exports.logout = exports.login = exports.register = void 0;
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
const register = async (req, res) => {
    const { password, name } = req.body;
    const email = normalizeEmail(req.body?.email);
    if (!email || !password || !name)
        return res.status(400).json({ error: 'Eksik bilgi' });
    const exists = await User_1.default.findOne({ email });
    if (exists)
        return res.status(409).json({ error: 'Bu e-posta zaten kayıtlı' });
    const passwordHash = await bcrypt_1.default.hash(password, 10);
    const user = await User_1.default.create({ email, passwordHash, name, role: 'USER' });
    const token = jsonwebtoken_1.default.sign({ id: user._id }, env_1.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7
    });
    res.json({ id: user._id, email: user.email, name: user.name, role: user.role, token });
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
    const user = await User_1.default.findOne({ email });
    if (!user)
        return res.status(401).json({ error: 'Kullanıcı bulunamadı' });
    const valid = await bcrypt_1.default.compare(password, user.passwordHash);
    if (!valid)
        return res.status(401).json({ error: 'Şifre hatalı' });
    const token = jsonwebtoken_1.default.sign({ id: user._id }, env_1.JWT_SECRET, { expiresIn: '7d' });
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
    res.json({ id: user._id, email: user.email, name: user.name, role: roleState.normalizedRole, token });
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
