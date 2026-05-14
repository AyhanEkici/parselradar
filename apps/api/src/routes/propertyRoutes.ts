import express from 'express';
import { createProperty, getProperties } from '../controllers/propertyController';
import { auth } from '../middleware/auth';

const router = express.Router();

router.post('/', auth, createProperty);
router.get('/', auth, getProperties);


export default router;
