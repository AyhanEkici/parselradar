import express from 'express';
import { createProperty, getMyProperties } from '../controllers/propertyController';
import { auth } from '../middleware/auth';

const router = express.Router();


router.post('/', auth, createProperty);
router.get('/', auth, getMyProperties);


export default router;
