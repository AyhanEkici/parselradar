"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RATE_LIMIT_PROFILES = void 0;
exports.RATE_LIMIT_PROFILES = {
    publicRead: {
        windowMs: 60000,
        limit: 120,
    },
    authenticated: {
        windowMs: 60000,
        limit: 300,
    },
    admin: {
        windowMs: 60000,
        limit: 600,
    },
    sensitiveAuth: {
        windowMs: 60000,
        limit: 30,
    },
};
