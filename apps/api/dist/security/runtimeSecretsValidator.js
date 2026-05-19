"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runtimeSecretsValidator = runtimeSecretsValidator;
function runtimeSecretsValidator() {
    const checks = [
        { key: 'MONGODB_URI', present: Boolean(process.env.MONGODB_URI) },
        { key: 'JWT_SECRET', present: Boolean(process.env.JWT_SECRET) },
        { key: 'CLIENT_URL', present: Boolean(process.env.CLIENT_URL) },
        { key: 'STRIPE_SECRET_KEY', present: Boolean(process.env.STRIPE_SECRET_KEY) },
    ];
    const missing = checks.filter((c) => !c.present).map((c) => c.key);
    return {
        status: missing.length === 0 ? 'VALID' : 'MISSING_REQUIRED',
        missing,
        checks,
    };
}
