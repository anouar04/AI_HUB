// Fix: Use qualified express types to avoid conflicts with global types.
import express from 'express';
import Conversation from '../models/Conversation';
import { processAndRespond } from '../services/conversationService';


const router = express.Router();

router.get('/', async (req: express.Request, res: express.Response) => {
  try {
    const conversations = await Conversation.find();
    res.json(conversations);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// This route handles a new INCOMING message for an existing conversation
// It is used by the frontend to simulate messages or for other polling-based channels.
router.post('/:id/messages', async (req: express.Request, res: express.Response) => {
    const { text } = req.body;
    const conversationId = req.params.id;

    try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }
        
        const updatedConversation = await processAndRespond(conversation, text);
        res.status(201).json(updatedConversation);

    } catch (err: any) {
        res.status(500).json({ message: `Server error: ${err.message}` });
    }
});

// This route is for when the ADMIN sends a message from the UI
router.post('/:id/reply', async (req: express.Request, res: express.Response) => {
    const { text } = req.body;
    const conversationId = req.params.id;
    try {
        const conversation = await Conversation.findByIdAndUpdate(
            conversationId,
            { 
                $push: { 
                    messages: { 
                        sender: 'user', 
                        text, 
                        isAI: false, 
                        timestamp: new Date().toISOString() 
                    } as any 
                }
            },
            { new: true }
        );
        if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
        res.json(conversation);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
});


// PUT to update conversation (e.g., mark as read)
router.put('/:id', async (req: express.Request, res: express.Response) => {
    try {
        const updatedConversation = await Conversation.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedConversation) return res.status(404).json({ message: 'Conversation not found' });
        res.json(updatedConversation);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
});

export default router;