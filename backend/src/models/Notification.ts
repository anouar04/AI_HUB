import { Schema, model, Document } from 'mongoose';
import { NotificationType } from '../types';

export interface INotification extends Document {
  recipientId: string;
  message: string;
  type: NotificationType;
  read: boolean;
  timestamp: Date;
  link?: string;
}

const NotificationSchema = new Schema<INotification>({
  recipientId: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: Object.values(NotificationType), required: true },
  read: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
  link: { type: String },
});

NotificationSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

NotificationSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => { delete ret._id; }
});

export default model<INotification>('Notification', NotificationSchema);