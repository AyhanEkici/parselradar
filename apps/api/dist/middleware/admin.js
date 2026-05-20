"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.admin = exports.requireAdmin = void 0;
const auditLog_1 = require("../utils/auditLog");
const accessAudit_1 = require("../utils/accessAudit");
const requireAdmin = async (req, res, next) => {
    const normalizedRole = String(req.user?.role || '').toUpperCase();
    if (!req.user || normalizedRole !== 'ADMIN') {
        await (0, accessAudit_1.recordAccessDecision)({
            userId: req.user?._id?.toString(),
            role: req.user?.role,
            resourceType: 'AdminRoute',
            resourceId: req.path,
            decision: 'deny',
            reason: 'admin_required',
            route: req.path,
            method: req.method,
            ip: req.ip,
            userAgent: req.get('user-agent') || undefined,
        });
        await (0, auditLog_1.logAuditEvent)({
            type: 'admin_forbidden',
            actorUserId: req.user?._id?.toString(),
            actorRole: req.user?.role,
            targetType: 'AdminRoute',
            targetId: req.path,
            message: 'Forbidden admin access attempt',
            metadata: { path: req.path, method: req.method },
            ip: req.ip,
            userAgent: req.get('user-agent'),
            success: false,
        });
        return res.status(403).json({ error: 'Yönetici yetkisi gerekli' });
    }
    await (0, accessAudit_1.recordAccessDecision)({
        userId: req.user._id?.toString(),
        role: normalizedRole,
        resourceType: 'AdminRoute',
        resourceId: req.path,
        decision: 'allow',
        reason: 'admin_verified',
        route: req.path,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('user-agent') || undefined,
    });
    next();
};
exports.requireAdmin = requireAdmin;
exports.admin = exports.requireAdmin;
