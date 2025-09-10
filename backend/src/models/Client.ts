
import { Schema, model, Document } from 'mongoose';
import { Client as ClientType } from '../types';

// Fix: Override createdAt to be a Date for Mongoose, while it's a string in API types.
export interface IClient extends Omit<ClientType, 'id' | 'createdAt'>, Document {
  createdAt: Date;
}

const ClientSchema = new Schema<IClient>({
  name: { type: String, required: true },
  phone: { type: String, unique: true, sparse: true },
  email: String,
  address: String,
  notes: String,
  // Fix: Use a function for default to ensure it's evaluated on creation and is type-safe.
  createdAt: { type: Date, default: () => new Date() },
}, {
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret._id;
      delete ret.__v;
    }
  },
  toObject: { virtuals: true }
});

ClientSchema.virtual('id').get(function() {
  // Fix: Use `toString()` which is safer and preferred over `toHexString()`.
  return this._id.toString();
});

export default model<IClient>('Client', ClientSchema);