"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const sharedAnalysisController_1 = require("../controllers/sharedAnalysisController");
const router = express_1.default.Router();
router.post('/workspace/:organizationId/shared-analysis', auth_1.auth, sharedAnalysisController_1.createSharedAnalysis);
router.get('/workspace/:organizationId/shared-analysis', auth_1.auth, sharedAnalysisController_1.getSharedAnalyses);
exports.default = router;
