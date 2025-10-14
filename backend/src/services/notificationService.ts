import Notification from '../models/Notification';
import { NotificationType } from '../types';

export const createNotification = async (recipientId: string, message: string, type: NotificationType, link?: string) => {
  try {
    const notification = new Notification({
      recipientId,
      message,
      type,
      link,
    });
    await notification.save();
    console.log("Notification created:", notification);
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};