
// Fix: Use qualified express types to avoid conflicts with global types.
import express, { Request, Response } from 'express';
import AIConfig from '../models/AIConfig';

const router = express.Router();

// GET the AI config (should only be one)
router.get('/', async (req: Request, res: Response) => {
  try {
    let config = await AIConfig.findOne();
    // If no config exists, create a default one
    if (!config) {
        config = new AIConfig({
            knowledgeBase: 'Our business hours are Monday to Friday, 9 AM to 5 PM.',
            afterHoursResponse: "Thanks for your message! We'll get back to you during business hours.",
            afterHoursEnabled: true,
        });
        await config.save();
    }
    res.json(config);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// PUT (update) the AI config
router.put('/', async (req: Request, res: Response) => {
  try {
    // This will find the single document and update it, or create it if it doesn't exist.
    const updatedConfig = await AIConfig.findOneAndUpdate({}, req.body, { new: true, upsert: true });
    res.json(updatedConfig);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

export default router;