"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const creditController_1 = require("../controllers/creditController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/', auth_1.auth, creditController_1.getCredits);
router.post('/dev-add', auth_1.auth, creditController_1.devAddCredits);
exports.default = router;
