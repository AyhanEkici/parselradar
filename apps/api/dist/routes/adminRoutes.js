"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const admin_1 = require("../middleware/admin");
const auth_1 = require("../middleware/auth");
const adminController_1 = require("../controllers/adminController");
const router = express_1.default.Router();
router.get('/properties', auth_1.auth, admin_1.admin, adminController_1.getAllProperties);
router.get('/properties/:id', auth_1.auth, admin_1.admin, adminController_1.getPropertyById);
router.patch('/properties/:id/review', auth_1.auth, admin_1.admin, adminController_1.reviewProperty);
router.patch('/properties/:id/status', auth_1.auth, admin_1.admin, adminController_1.updatePropertyStatus);
router.post('/deal-pool/:propertyId/accept', auth_1.auth, admin_1.admin, adminController_1.acceptDealPool);
router.post('/deal-pool/:entryId/share', auth_1.auth, admin_1.admin, adminController_1.shareDealPool);
// Admin operations suite
router.get('/users', auth_1.auth, admin_1.admin, adminController_1.getAdminUsers);
router.get('/analyses', auth_1.auth, admin_1.admin, adminController_1.getAdminAnalyses);
router.get('/credit-ledger', auth_1.auth, admin_1.admin, adminController_1.getAdminCreditLedger);
router.get('/stripe-sessions', auth_1.auth, admin_1.admin, adminController_1.getAdminStripeSessions);
router.get('/deployment', auth_1.auth, admin_1.admin, adminController_1.getAdminDeploymentOverview);
router.get('/runtime', auth_1.auth, admin_1.admin, adminController_1.getAdminRuntimeOverview);
router.get('/security-overview', auth_1.auth, admin_1.admin, adminController_1.getAdminSecurityOverview);
exports.default = router;
