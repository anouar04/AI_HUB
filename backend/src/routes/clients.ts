
import express from 'express';
import Client from '../models/Client';

const router = express.Router();

// GET all clients
router.get('/', async (req: express.Request, res: express.Response) => {
  try {
    const clients = await Client.find().sort({ createdAt: -1 });
    res.json(clients);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new client
router.post('/', async (req: express.Request, res: express.Response) => {
  const client = new Client(req.body);
  try {
    const newClient = await client.save();
    res.status(201).json(newClient);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// PUT (update) a client
router.put('/:id', async (req: express.Request, res: express.Response) => {
  try {
    const updatedClient = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedClient) return res.status(404).json({ message: 'Client not found' });
    res.json(updatedClient);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

export default router;