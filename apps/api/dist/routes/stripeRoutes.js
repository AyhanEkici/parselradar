"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const stripeController_1 = require("../controllers/stripeController");
const rateLimiter_1 = require("../middleware/rateLimiter");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/create-checkout-session', rateLimiter_1.stripeLimiter, auth_1.auth, stripeController_1.createCheckoutSession);
router.post('/webhook', express_1.default.raw({ type: 'application/json' }), stripeController_1.stripeWebhook);
exports.default = router;
