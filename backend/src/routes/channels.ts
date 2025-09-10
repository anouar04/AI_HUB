
// Fix: Use qualified express types to avoid conflicts with global types.
import express, { Request, Response } from 'express';
import Channel from '../models/Channel';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
    try {
        const channels = await Channel.find();
        res.json(channels);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/', async (req: Request, res: Response) => {
    const channel = new Channel(req.body);
    try {
        const newChannel = await channel.save();
        res.status(201).json(newChannel);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
});

router.put('/:id', async (req: Request, res: Response) => {
    try {
        const updatedChannel = await Channel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedChannel) return res.status(404).json({ message: 'Channel not found' });
        res.json(updatedChannel);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
});

router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const deletedChannel = await Channel.findByIdAndDelete(req.params.id);
        if (!deletedChannel) return res.status(404).json({ message: 'Channel not found' });
        res.json({ message: 'Channel deleted successfully' });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

export default router;