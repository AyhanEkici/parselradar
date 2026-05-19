"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const analysisController_1 = require("../controllers/analysisController");
const rateLimiter_1 = require("../middleware/rateLimiter");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/:propertyId/quick-score', rateLimiter_1.analysisLimiter, auth_1.auth, analysisController_1.quickScore);
router.post('/:propertyId/parsel-insight', rateLimiter_1.analysisLimiter, auth_1.auth, analysisController_1.parselInsight);
router.post('/:propertyId/developer-fit', rateLimiter_1.analysisLimiter, auth_1.auth, analysisController_1.developerFit);
exports.default = router;
