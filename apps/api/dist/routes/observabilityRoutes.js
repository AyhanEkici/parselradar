"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const admin_1 = require("../middleware/admin");
const observabilityController_1 = require("../controllers/observabilityController");
const router = express_1.default.Router();
router.get('/admin/observability', auth_1.auth, admin_1.admin, observabilityController_1.getAdminObservability);
router.get('/admin/analytics', auth_1.auth, admin_1.admin, observabilityController_1.getAdminAnalytics);
router.get('/admin/telemetry', auth_1.auth, admin_1.admin, observabilityController_1.getAdminTelemetry);
exports.default = router;
