"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.admin = void 0;
const auditLog_1 = require("../utils/auditLog");
const admin = async (req, res, next) => {
    if (!req.user || req.user.role !== 'ADMIN') {
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
    next();
};
exports.admin = admin;
