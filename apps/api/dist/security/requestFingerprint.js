"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestFingerprint = requestFingerprint;
const crypto_1 = __importDefault(require("crypto"));
const securityPolicies_1 = require("../config/runtime/securityPolicies");
function requestFingerprint(input) {
    const raw = [
        securityPolicies_1.SECURITY_POLICIES.fingerprintSalt,
        input.ip || 'ip:unknown',
        input.userAgent || 'ua:unknown',
        input.method || 'method:unknown',
        input.path || 'path:unknown',
        input.userId || 'user:anon',
    ].join('|');
    return crypto_1.default.createHash('sha256').update(raw).digest('hex').slice(0, 24);
}
