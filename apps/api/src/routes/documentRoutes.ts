import express from 'express';
import { uploadDocument, getDocuments, viewDocument, downloadDocument, deleteDocument } from '../controllers/documentController';
import { auth } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = express.Router();

router.post('/:propertyId/documents', auth, upload.single('file'), uploadDocument);
router.get('/:propertyId/documents', auth, getDocuments);
router.get('/:propertyId/documents/:documentId/view', auth, viewDocument);
router.get('/:propertyId/documents/:documentId/download', auth, downloadDocument);
router.delete('/:propertyId/documents/:documentId', auth, deleteDocument);

export default router;
