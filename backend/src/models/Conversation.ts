
import { Schema, model, Document } from 'mongoose';
import { Conversation as ConversationType, CommunicationChannel } from '../types';

export interface IConversation extends Omit<ConversationType, 'id'>, Document {}

const MessageSchema = new Schema({
    sender: { type: String, enum: ['user', 'client', 'model', 'ai'], required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    isAI: { type: Boolean, default: false },
}, { _id: true });

// Fix: Use `toString()` as `toHexString` does not exist on type `ObjectId`.
MessageSchema.virtual('id').get(function() { return this._id.toString(); });

MessageSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret) => { delete ret._id; }
});
MessageSchema.set('toObject', { virtuals: true });


const ConversationSchema = new Schema<IConversation>({
  clientId: { type: String, required: true },
  channel: { type: String, enum: Object.values(CommunicationChannel), required: true },
  messages: [MessageSchema],
  unread: { type: Boolean, default: false },
}, {
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => { delete ret._id; delete ret.__v; }
  },
  toObject: { virtuals: true }
});

ConversationSchema.virtual('id').get(function() { 
    // Fix: Use `toString()` which is safer and preferred over `toHexString()`.
    return this._id.toString(); 
});

export default model<IConversation>('Conversation', ConversationSchema);