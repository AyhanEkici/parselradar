"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const organizationController_1 = require("../controllers/organizationController");
const router = express_1.default.Router();
router.get('/organizations', auth_1.auth, organizationController_1.getOrganizations);
router.post('/organizations', auth_1.auth, organizationController_1.createOrganization);
router.get('/organizations/:id', auth_1.auth, organizationController_1.getOrganizationById);
router.post('/organizations/:id/members', auth_1.auth, organizationController_1.addOrganizationMember);
router.patch('/organizations/:id/members/:memberId', auth_1.auth, organizationController_1.patchOrganizationMember);
router.delete('/organizations/:id/members/:memberId', auth_1.auth, organizationController_1.deleteOrganizationMember);
exports.default = router;
