"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const documentController_1 = require("../controllers/documentController");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const router = express_1.default.Router();
router.post('/:propertyId/documents', auth_1.auth, upload_1.upload.single('file'), documentController_1.uploadDocument);
router.get('/:propertyId/documents', auth_1.auth, documentController_1.getDocuments);
router.get('/:propertyId/documents/:documentId/view', auth_1.auth, documentController_1.viewDocument);
router.get('/:propertyId/documents/:documentId/download', auth_1.auth, documentController_1.downloadDocument);
router.delete('/:propertyId/documents/:documentId', auth_1.auth, documentController_1.deleteDocument);
exports.default = router;
