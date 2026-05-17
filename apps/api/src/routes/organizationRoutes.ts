import express from 'express';
import { auth } from '../middleware/auth';
import {
  addOrganizationMember,
  createOrganization,
  deleteOrganizationMember,
  getOrganizationById,
  getOrganizations,
  patchOrganizationMember,
} from '../controllers/organizationController';

const router = express.Router();

router.get('/organizations', auth, getOrganizations);
router.post('/organizations', auth, createOrganization);
router.get('/organizations/:id', auth, getOrganizationById);
router.post('/organizations/:id/members', auth, addOrganizationMember);
router.patch('/organizations/:id/members/:memberId', auth, patchOrganizationMember);
router.delete('/organizations/:id/members/:memberId', auth, deleteOrganizationMember);

export default router;
