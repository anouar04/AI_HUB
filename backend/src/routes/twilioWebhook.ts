import { Request, Response, Router } from 'express';
import Client from '../models/Client';
import Conversation from '../models/Conversation';
import { CommunicationChannel } from '../types';
import { processAndRespond } from '../services/conversationService';

const router = Router();

// POST handler for incoming Twilio messages
router.post('/', async (req: Request, res: Response) => {
  const from = req.body.From; // e.g., 'whatsapp:+14155238886'
  const body = req.body.Body; // The message text
  const profileName = req.body.ProfileName; // User's WhatsApp name
  let replyText = ''; // This will hold the AI's response text

  console.log(`--- Twilio Webhook Received ---`);
  console.log(`From: ${from}, Name: ${profileName}, Message: ${body}`);

  if (!from || !body) {
      console.log('Missing From or Body, skipping.');
      // Still send a response to Twilio to avoid errors on their end
      return res.type('text/xml').send('<Response></Response>');
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

      // 4. Process the message and get the updated conversation
      const updatedConversation = await processAndRespond(conversation, body);
      console.log(`Message processed for conversation: ${conversation.id}`);

      // Extract the last message, which should be the AI's reply
      const lastMessage = updatedConversation.messages[updatedConversation.messages.length - 1];
      if (lastMessage && lastMessage.isAI) {
        replyText = lastMessage.text;
      }


  } catch (err: any) {
      console.error('Error processing Twilio webhook:', err.message);
      // Set a generic error message to send back to the user
      replyText = "I'm sorry, but I encountered a technical issue. Please try again later.";
  } finally {
      // 5. Respond to Twilio with the AI's message or an empty response to acknowledge receipt.
      // A TwiML library is recommended for more complex responses.
      let twimlResponse = '<Response>';
      if (replyText) {
          // Basic XML escaping for the message content to prevent TwiML errors
          const escapedMessage = replyText
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&apos;');
          twimlResponse += `<Message>${escapedMessage}</Message>`;
      }
      twimlResponse += '</Response>';
      
      res.type('text/xml').send(twimlResponse);
  }
});

export default router;
