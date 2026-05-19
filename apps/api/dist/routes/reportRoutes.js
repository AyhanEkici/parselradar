"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const reportController_1 = require("../controllers/reportController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/:analysisRunId/purchase-pdf', auth_1.auth, reportController_1.purchasePDF);
router.get('/', auth_1.auth, reportController_1.getReports);
router.get('/:id/download', auth_1.auth, reportController_1.downloadReport);
exports.default = router;
