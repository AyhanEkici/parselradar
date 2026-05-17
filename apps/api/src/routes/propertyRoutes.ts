import express from 'express';
import { createProperty, getMyProperties, getPropertyById } from '../controllers/propertyController';
import { auth } from '../middleware/auth';

const router = express.Router();


router.post('/', auth, createProperty);
router.get('/', auth, getMyProperties);
router.get('/:propertyId', auth, getPropertyById);


export default router;
