import { Request, Response, Router } from 'express';
import Conversation from '../models/Conversation';
import { processAndRespond } from '../services/conversationService';


const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const conversations = await Conversation.find();
    res.json(conversations);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// This route handles a new INCOMING message for an existing conversation
// It is used by the frontend to simulate messages or for other polling-based channels.
router.post('/:id/messages', async (req: Request, res: Response) => {
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
router.post('/:id/reply', async (req: Request, res: Response) => {
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
router.put('/:id', async (req: Request, res: Response) => {
    console.log('Request Body:', req.body);
    console.log('Request Headers:', req.headers);
    try {
        const updatedConversation = await Conversation.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedConversation) return res.status(404).json({ message: 'Conversation not found' });
        res.json(updatedConversation);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
});

// PUT route to clear all messages for a specific conversation
router.put('/:id/clear-messages', async (req: Request, res: Response) => {
    console.log(`Received request to clear conversation: ${req.params.id}`);
    try {
        const conversation = await Conversation.findByIdAndUpdate(
            req.params.id,
            { $set: { messages: [] } }, // Set messages array to empty
            { new: true }
        );
        if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
        res.json(conversation);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
});

export default router;
