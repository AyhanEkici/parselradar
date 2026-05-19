"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const notificationController_1 = require("../controllers/notificationController");
const router = express_1.default.Router();
router.get('/notifications', auth_1.auth, notificationController_1.getNotifications);
router.get('/notifications/preferences', auth_1.auth, notificationController_1.getNotificationPreferences);
router.patch('/notifications/preferences', auth_1.auth, notificationController_1.patchNotificationPreferences);
router.post('/notifications/:id/read', auth_1.auth, notificationController_1.markNotificationRead);
router.post('/notifications/:id/archive', auth_1.auth, notificationController_1.archiveNotification);
router.get('/notifications/digests', auth_1.auth, notificationController_1.getNotificationDigests);
router.post('/notifications/test-event', auth_1.auth, notificationController_1.createNotificationTestEvent);
exports.default = router;
