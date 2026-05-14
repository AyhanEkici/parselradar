import express from 'express';
import { createProperty, getProperties, getProperty, updateProperty } from '../controllers/propertyController';
import { auth } from '../middleware/auth';

const router = express.Router();

router.post('/', auth, createProperty);
router.get('/', auth, getProperties);
router.get('/:id', auth, getProperty);
router.patch('/:id', auth, updateProperty);

export default router;
