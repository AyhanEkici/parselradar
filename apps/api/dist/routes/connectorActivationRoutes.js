"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const admin_1 = require("../middleware/admin");
const connectorActivationController_1 = require("../controllers/connectorActivationController");
const router = express_1.default.Router();
// V17 routes
router.get('/admin/connectors', auth_1.auth, admin_1.admin, connectorActivationController_1.getAdminConnectors);
router.get('/admin/connectors/audit-trail', auth_1.auth, admin_1.admin, connectorActivationController_1.getAdminConnectorAuditTrail);
router.get('/admin/connectors/:connectorKey/activation-plan', auth_1.auth, admin_1.admin, connectorActivationController_1.getAdminConnectorActivationPlan);
// V19 extended detail route (replaces V17 GET /:connectorKey with activation state)
router.get('/admin/connectors/:connectorKey', auth_1.auth, admin_1.admin, connectorActivationController_1.getAdminConnectorActivationState);
// V19 new routes
router.post('/admin/connectors/:connectorKey/credentials', auth_1.auth, admin_1.admin, connectorActivationController_1.postAdminConnectorCredentials);
router.post('/admin/connectors/:connectorKey/test', auth_1.auth, admin_1.admin, connectorActivationController_1.postAdminConnectorTestV19);
router.post('/admin/connectors/:connectorKey/activate', auth_1.auth, admin_1.admin, connectorActivationController_1.postAdminConnectorActivate);
router.post('/admin/connectors/:connectorKey/deactivate', auth_1.auth, admin_1.admin, connectorActivationController_1.postAdminConnectorDeactivate);
router.get('/admin/connectors/:connectorKey/audit', auth_1.auth, admin_1.admin, connectorActivationController_1.getAdminConnectorAuditByKey);
router.patch('/admin/connectors/:connectorKey/source-approval', auth_1.auth, admin_1.admin, connectorActivationController_1.patchAdminConnectorSourceApproval);
exports.default = router;
