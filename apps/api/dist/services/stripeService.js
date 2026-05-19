"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripe = void 0;
const stripe_1 = __importDefault(require("stripe"));
const env_1 = require("../config/env");
const key = env_1.ENV.NODE_ENV === 'production'
    ? env_1.ENV.STRIPE_SECRET_KEY || env_1.ENV.STRIPE_LIVE_SECRET_KEY
    : env_1.ENV.STRIPE_SECRET_KEY || env_1.ENV.STRIPE_TEST_SECRET_KEY;
exports.stripe = new stripe_1.default(key, { apiVersion: '2023-10-16' });
