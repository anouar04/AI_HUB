import { Schema, model, Document } from 'mongoose';
import { KnowledgeFile as KnowledgeFileType } from '../types';

// Fix: Override uploadedAt to be a Date for Mongoose, while it's a string in API types.
export interface IKnowledgeFile extends Omit<KnowledgeFileType, 'id' | 'uploadedAt'>, Document {
  uploadedAt: Date;
}

const KnowledgeFileSchema = new Schema<IKnowledgeFile>({
  name: { type: String, required: true },
  type: { type: String, required: true },
  size: { type: Number, required: true },
  // Fix: Use a function for default to ensure it's evaluated on creation and is type-safe.
  uploadedAt: { type: Date, default: () => new Date() },
  path: { type: String, required: true },
}, {
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => { delete ret._id; delete ret.__v; }
  },
  toObject: { virtuals: true }
});

KnowledgeFileSchema.virtual('id').get(function() { 
    // Fix: Use `toString()` which is safer and preferred over `toHexString()`.
    return this._id.toString(); 
});

export default model<IKnowledgeFile>('KnowledgeFile', KnowledgeFileSchema);