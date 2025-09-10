import { Schema, model, Document } from 'mongoose';
import { Channel as ChannelType, ChannelType as EnumChannelType } from '../types';

export interface IChannel extends Omit<ChannelType, 'id'>, Document {}

const ChannelSchema = new Schema<IChannel>({
  name: { type: String, required: true },
  type: { type: String, enum: Object.values(EnumChannelType), required: true },
  externalId: { type: String, required: true },
  enabled: { type: Boolean, required: true },
  status: { type: String, enum: ['Active', 'Inactive'], required: true },
}, {
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => { delete ret._id; delete ret.__v; }
  },
  toObject: { virtuals: true }
});

ChannelSchema.virtual('id').get(function() { 
    // Fix: Use `toString()` which is safer and preferred over `toHexString()`.
    return this._id.toString(); 
});

export default model<IChannel>('Channel', ChannelSchema);