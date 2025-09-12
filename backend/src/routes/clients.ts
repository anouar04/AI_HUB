import { Request, Response, Router } from 'express';
import Client from '../models/Client';

const router = Router();

// GET all clients
router.get('/', async (req: Request, res: Response) => {
  try {
    const clients = await Client.find().sort({ createdAt: -1 });
    res.json(clients);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new client
router.post('/', async (req: Request, res: Response) => {
  const client = new Client(req.body);
  try {
    const newClient = await client.save();
    res.status(201).json(newClient);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// PUT (update) a client
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const updatedClient = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedClient) return res.status(404).json({ message: 'Client not found' });
    res.json(updatedClient);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
