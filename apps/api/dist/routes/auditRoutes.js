"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const admin_1 = require("../middleware/admin");
const auth_1 = require("../middleware/auth");
const auditController_1 = require("../controllers/auditController");
const router = express_1.default.Router();
// GET /admin/audit-events (admin only)
router.get('/admin/audit-events', auth_1.auth, admin_1.admin, auditController_1.getAuditEvents);
exports.default = router;
