"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const propertyController_1 = require("../controllers/propertyController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/', auth_1.auth, propertyController_1.createProperty);
router.get('/', auth_1.auth, propertyController_1.getMyProperties);
router.get('/:propertyId', auth_1.auth, propertyController_1.getPropertyById);
exports.default = router;
