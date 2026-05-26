import express from 'express';

import { createProperty, getMyProperties, getPropertyById, patchSourceGuidanceCheck } from '../controllers/propertyController';
import { auth } from '../middleware/auth';


const router = express.Router();

// PATCH source guidance check (manual check persistence)
router.patch('/:propertyId/source-guidance/:sourceKey', auth, patchSourceGuidanceCheck);


router.post('/', auth, createProperty);
router.get('/', auth, getMyProperties);
router.get('/:propertyId', auth, getPropertyById);


export default router;
