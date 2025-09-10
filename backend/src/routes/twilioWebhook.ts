import express from 'express';
import Client from '../models/Client';
import Conversation from '../models/Conversation';
import { CommunicationChannel } from '../types';
import { processAndRespond } from '../services/conversationService';

const router = express.Router();

// POST handler for incoming Twilio messages
router.post('/', async (req: express.Request, res: express.Response) => {
  const from = req.body.From; // e.g., 'whatsapp:+14155238886'
  const body = req.body.Body; // The message text
  const profileName = req.body.ProfileName; // User's WhatsApp name

  console.log(`--- Twilio Webhook Received ---`);
  console.log(`From: ${from}, Name: ${profileName}, Message: ${body}`);

  if (!from || !body) {
      console.log('Missing From or Body, skipping.');
      return res.status(400).send('Missing From or Body');
  }

  try {
      // 1. Sanitize phone number
      const clientPhone = from.replace('whatsapp:', '');

      // 2. Find or create client
      let client = await Client.findOne({ phone: clientPhone });
      if (!client) {
          client = new Client({
              name: profileName || 'New WhatsApp Client',
              phone: clientPhone,
              notes: 'Client created via incoming WhatsApp message.'
          });
          await client.save();
          console.log(`New client created: ${client.name} (${client.id})`);
      }

      // 3. Find or create conversation
      let conversation = await Conversation.findOne({ clientId: client.id, channel: CommunicationChannel.WhatsApp });
      if (!conversation) {
          conversation = new Conversation({
              clientId: client.id,
              channel: CommunicationChannel.WhatsApp,
              messages: [],
              unread: false, // will be set to true in the service
          });
          await conversation.save();
          console.log(`New conversation created for client: ${client.id}`);
      }

      // 4. Process the message using the shared service
      await processAndRespond(conversation, body);
      console.log(`Message processed for conversation: ${conversation.id}`);

  } catch (err: any) {
      console.error('Error processing Twilio webhook:', err.message);
  } finally {
      // 5. ALWAYS respond to Twilio to acknowledge receipt
      res.type('text/xml').send('<Response></Response>');
  }
});

export default router;