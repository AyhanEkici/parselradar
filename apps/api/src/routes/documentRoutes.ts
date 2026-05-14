import express from 'express';
import { uploadDocument, getDocuments } from '../controllers/documentController';
import { auth } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = express.Router();

router.post('/:propertyId/documents', auth, upload.single('file'), uploadDocument);
router.get('/:propertyId/documents', auth, getDocuments);

export default router;
