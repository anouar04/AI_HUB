import { Schema, model, Document } from 'mongoose';
import { Appointment as AppointmentType, AppointmentStatus } from '../types';

// Fix: Override start and end to be Date for Mongoose, while they are strings in API types.
export interface IAppointment extends Omit<AppointmentType, 'id' | 'start' | 'end'>, Document {
  start: Date;
  end: Date;
}

const AppointmentSchema = new Schema<IAppointment>({
  clientId: { type: String, required: true },
  title: { type: String, required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  status: { type: String, enum: Object.values(AppointmentStatus), required: true },
}, {
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => { delete ret._id; delete ret.__v; }
  },
  toObject: { virtuals: true }
});

AppointmentSchema.virtual('id').get(function() { 
  // Fix: Use `toString()` which is safer and preferred over `toHexString()`.
  return this._id.toString(); 
});

export default model<IAppointment>('Appointment', AppointmentSchema);