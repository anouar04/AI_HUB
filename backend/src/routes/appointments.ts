
// Fix: Use qualified express types to avoid conflicts with global types.
import express, { Request, Response } from 'express';
import Appointment from '../models/Appointment';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const appointments = await Appointment.find().sort({ start: -1 });
    res.json(appointments);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  const appointment = new Appointment(req.body);
  try {
    const newAppointment = await appointment.save();
    res.status(201).json(newAppointment);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const updatedAppointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedAppointment) return res.status(404).json({ message: 'Appointment not found' });
    res.json(updatedAppointment);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

export default router;