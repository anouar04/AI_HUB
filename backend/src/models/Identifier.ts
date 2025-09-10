import { Schema, model, Document } from 'mongoose';
import { Identifier as IdentifierType } from '../types';

export interface IIdentifier extends Omit<IdentifierType, 'id'>, Document {}

const IdentifierSchema = new Schema<IIdentifier>({
  name: { type: String, required: true },
  tag: { type: String, required: true },
  n8nType: { type: String, required: true },
  status: { type: String, enum: ['Active', 'Inactive'], required: true },
  accessToken: { type: String, default: '' },
  businessAccountId: { type: String, default: '' },
}, {
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => { delete ret._id; delete ret.__v; }
  },
  toObject: { virtuals: true }
});

IdentifierSchema.virtual('id').get(function() { 
    // Fix: Use `toString()` which is safer and preferred over `toHexString()`.
    return this._id.toString(); 
});

export default model<IIdentifier>('Identifier', IdentifierSchema);