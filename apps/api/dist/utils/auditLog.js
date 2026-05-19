"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAuditEvent = logAuditEvent;
const AuditEvent_1 = __importDefault(require("../models/AuditEvent"));
const SENSITIVE_KEYS = [
    'password', 'token', 'jwt', 'secret', 'stripeSecret', 'accessToken', 'refreshToken', 'cookie', 'session', 'authorization', 'apiKey', 'stripeKey', 'stripeToken', 'card', 'cvv', 'exp', 'number', 'cvc', 'ssn', 'privateKey', 'publicKey', 'clientSecret', 'clientToken', 'idToken', 'raw', 'payload', 'signature', 'sig', 'webhookSecret', 'webhookSignature', 'stripeSignature', 'stripeWebhookSecret', 'stripeWebhookSignature'
];
function sanitize(obj) {
    if (!obj || typeof obj !== 'object')
        return obj;
    if (Array.isArray(obj))
        return obj.map(sanitize);
    const clean = {};
    for (const k of Object.keys(obj)) {
        if (SENSITIVE_KEYS.some(s => k.toLowerCase().includes(s)))
            continue;
        const v = obj[k];
        if (typeof v === 'object')
            clean[k] = sanitize(v);
        else
            clean[k] = v;
    }
    return clean;
}
async function logAuditEvent(event) {
    try {
        await AuditEvent_1.default.create({
            ...event,
            metadata: sanitize(event.metadata),
            createdAt: new Date(),
        });
    }
    catch (err) {
        // Never crash business flow
        // Optionally log to console in dev
        if (process.env.NODE_ENV === 'development') {
            // eslint-disable-next-line no-console
            console.error('Audit log failure:', err);
        }
    }
}
