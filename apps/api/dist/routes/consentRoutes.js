"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const consentController_1 = require("../controllers/consentController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/:propertyId/consent', auth_1.auth, consentController_1.submitConsent);
exports.default = router;
