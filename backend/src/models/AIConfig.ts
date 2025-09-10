import { Schema, model, Document } from 'mongoose';
import { AIConfig as AIConfigType } from '../types';

export interface IAIConfig extends AIConfigType, Document {}

const AIConfigSchema = new Schema<IAIConfig>({
  knowledgeBase: { type: String, required: true },
  afterHoursResponse: { type: String, required: true },
  afterHoursEnabled: { type: Boolean, required: true },
}, {
  // Use a capped collection of size 1 to ensure there's only one config document
  capped: { size: 4096, max: 1 },
  toJSON: {
    transform: (doc, ret) => { delete ret._id; delete ret.__v; }
  }
});

export default model<IAIConfig>('AIConfig', AIConfigSchema);
