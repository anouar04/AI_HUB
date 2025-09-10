
// Fix: Use qualified express types to avoid conflicts with global types.
import express, { Request, Response } from 'express';
import Identifier from '../models/Identifier';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
    try {
        const identifiers = await Identifier.find();
        res.json(identifiers);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/', async (req: Request, res: Response) => {
    const identifier = new Identifier(req.body);
    try {
        const newIdentifier = await identifier.save();
        res.status(201).json(newIdentifier);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
});

router.put('/:id', async (req: Request, res: Response) => {
    try {
        const updatedIdentifier = await Identifier.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedIdentifier) return res.status(404).json({ message: 'Identifier not found' });
        res.json(updatedIdentifier);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
});

router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const deletedIdentifier = await Identifier.findByIdAndDelete(req.params.id);
        if (!deletedIdentifier) return res.status(404).json({ message: 'Identifier not found' });
        res.json({ message: 'Identifier deleted successfully' });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

export default router;