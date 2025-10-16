import { Request, Response, Router } from 'express';
import Client from '../models/Client';
import { sendMessage } from '../services/communicationService';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ message: 'Message content is required.' });
  }

  try {
    const clients = await Client.find(); // Fetch all clients

    // Send message to each client
    for (const client of clients) {
      if (client.phone) { // Assuming clients have a phone number for messaging
        // This is a placeholder. You'd integrate with your actual communication service here.
        // For example, if using Twilio, you'd call a Twilio service function.
        await sendMessage(client.phone, message);
        // In a real app, you'd handle different channels (WhatsApp, SMS) based on client preferences or channel availability
      }
    }

    res.status(200).json({ message: 'Broadcast message initiated successfully.' });
  } catch (error: any) {
    console.error('Error sending broadcast message:', error);
    res.status(500).json({ message: `Failed to send broadcast message: ${error.message}` });
  }
});

export default router;