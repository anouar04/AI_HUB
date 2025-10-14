import { Request, Response, Router } from 'express';
import Notification from '../models/Notification';

const router = Router();

// Get all notifications for a recipient
router.get('/', async (req: Request, res: Response) => {
  try {
    // In a real app, you'd get the recipientId from the authenticated user
    // For now, let's assume a default admin recipient or pass it as a query param
    const recipientId = req.query.recipientId || 'admin'; // Placeholder
    const notifications = await Notification.find({ recipientId }).sort({ timestamp: -1 });
    res.json(notifications);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Mark a specific notification as read
router.put('/:id/read', async (req: Request, res: Response) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });

    notification.read = true;
    await notification.save();
    res.json(notification);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// Mark all notifications for a recipient as read
router.put('/read-all', async (req: Request, res: Response) => {
  try {
    const recipientId = req.body.recipientId || 'admin'; // Placeholder
    await Notification.updateMany({ recipientId, read: false }, { read: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

export default router;