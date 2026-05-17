import express from 'express';
import { auth } from '../middleware/auth';
import {
  archiveNotification,
  createNotificationTestEvent,
  getNotificationDigests,
  getNotificationPreferences,
  getNotifications,
  markNotificationRead,
  patchNotificationPreferences,
} from '../controllers/notificationController';

const router = express.Router();

router.get('/notifications', auth, getNotifications);
router.get('/notifications/preferences', auth, getNotificationPreferences);
router.patch('/notifications/preferences', auth, patchNotificationPreferences);
router.post('/notifications/:id/read', auth, markNotificationRead);
router.post('/notifications/:id/archive', auth, archiveNotification);
router.get('/notifications/digests', auth, getNotificationDigests);
router.post('/notifications/test-event', auth, createNotificationTestEvent);

export default router;
