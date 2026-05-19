"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuditEvents = void 0;
const AuditEvent_1 = __importDefault(require("../models/AuditEvent"));
const getAuditEvents = async (req, res) => {
    // Only admin middleware should allow this
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 25);
    const filter = {};
    if (req.query.type)
        filter.type = req.query.type;
    if (req.query.actorUserId)
        filter.actorUserId = req.query.actorUserId;
    const events = await AuditEvent_1.default.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
    const total = await AuditEvent_1.default.countDocuments(filter);
    res.json({
        events,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
    });
};
exports.getAuditEvents = getAuditEvents;
