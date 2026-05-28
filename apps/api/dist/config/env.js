"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PORT = exports.CONNECTOR_SYNC_CRON_SECRET = exports.ADMIN_PASSWORD = exports.ADMIN_EMAIL = exports.STRIPE_WEBHOOK_SECRET = exports.STRIPE_SECRET_KEY = exports.API_URL = exports.CLIENT_URL = exports.MONGODB_URI = exports.JWT_SECRET = exports.NODE_ENV = exports.ENV = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: '../../.env' });
const required = [
    'MONGODB_URI',
    'JWT_SECRET',
    'CLIENT_URL',
];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}.\nCheck your .env file and deployment configuration.`);
}
exports.ENV = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    JWT_SECRET: process.env.JWT_SECRET,
    MONGODB_URI: process.env.MONGODB_URI,
    CLIENT_URL: process.env.CLIENT_URL,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
    STRIPE_LIVE_SECRET_KEY: process.env.STRIPE_LIVE_SECRET_KEY || '',
    STRIPE_TEST_SECRET_KEY: process.env.STRIPE_TEST_SECRET_KEY || '',
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
    STRIPE_PRICE_25_CREDITS: process.env.STRIPE_PRICE_25_CREDITS || '',
    STRIPE_PRICE_50_CREDITS: process.env.STRIPE_PRICE_50_CREDITS || '',
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || '',
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || '',
    CONNECTOR_SYNC_CRON_SECRET: process.env.CONNECTOR_SYNC_CRON_SECRET || '',
    PORT: process.env.PORT || '4000',
    API_URL: process.env.API_URL || '',
};
exports.NODE_ENV = exports.ENV.NODE_ENV, exports.JWT_SECRET = exports.ENV.JWT_SECRET, exports.MONGODB_URI = exports.ENV.MONGODB_URI, exports.CLIENT_URL = exports.ENV.CLIENT_URL, exports.API_URL = exports.ENV.API_URL, exports.STRIPE_SECRET_KEY = exports.ENV.STRIPE_SECRET_KEY, exports.STRIPE_WEBHOOK_SECRET = exports.ENV.STRIPE_WEBHOOK_SECRET, exports.ADMIN_EMAIL = exports.ENV.ADMIN_EMAIL, exports.ADMIN_PASSWORD = exports.ENV.ADMIN_PASSWORD, exports.CONNECTOR_SYNC_CRON_SECRET = exports.ENV.CONNECTOR_SYNC_CRON_SECRET, exports.PORT = exports.ENV.PORT;
