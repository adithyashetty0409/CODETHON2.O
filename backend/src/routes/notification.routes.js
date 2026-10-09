import express from 'express';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../services/store.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

// GET /api/notifications
router.get('/', async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const notifications = await getUserNotifications(userId);
    const unreadCount = notifications.filter((n) => !n.read).length;

    return res.json({
      success: true,
      count: notifications.length,
      unreadCount,
      data: notifications,
    });
  } catch (error) {
    console.error('Fetch notifications error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications.',
    });
  }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;
    await markNotificationAsRead(id, userId);

    return res.json({
      success: true,
      message: 'Notification marked as read.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update notification state.',
    });
  }
});

// PUT /api/notifications/read-all
router.put('/read-all', async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    await markAllNotificationsAsRead(userId);

    return res.json({
      success: true,
      message: 'All notifications marked as read.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update notifications.',
    });
  }
});

export default router;
