
import Conversation, { IConversation } from '../models/Conversation';
import Client from '../models/Client';
import Appointment from '../models/Appointment';
import AIConfig from '../models/AIConfig';
import { generateAIResponse } from './geminiService';
import { addMinutes, parseISO } from 'date-fns';
import { AppointmentStatus } from '../types';

export const processAndRespond = async (conversation: IConversation, userMessageText: string) => {
    try {
        // 1. Add client's message to conversation
        conversation.messages.push({
            sender: 'client',
            text: userMessageText,
            isAI: false,
            timestamp: new Date().toISOString()
        } as any);
        conversation.unread = true;
        
        // 2. Prepare for and call AI
        const aiConfig = await AIConfig.findOne();
        if (!aiConfig) throw new Error('AI configuration not found.');

        const history = conversation.messages.map(msg => ({
            role: msg.sender === 'client' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        // Exclude the last message (the one we're processing) from history for the call
        const aiResponse = await generateAIResponse(aiConfig.knowledgeBase, userMessageText, history.slice(0, -1));
        const aiResponsePart = aiResponse.candidates?.[0]?.content.parts[0];
        
        if (!aiResponsePart) {
             console.error("No valid AI response part found.");
             await conversation.save();
             return conversation;
        }

        // 3. Process AI response (function calls or text)
        if (aiResponsePart.functionCall) {
            const { name, args } = aiResponsePart.functionCall;
            if (name === 'bookAppointment') {
                const { title, date, time, durationMinutes = 60 } = args as { title: string; date: string; time: string; durationMinutes?: number };
                const startDateTime = parseISO(`${date}T${time}`);
                const endDateTime = addMinutes(startDateTime, durationMinutes);

                const appointment = new Appointment({
                    clientId: conversation.clientId,
                    title,
                    start: startDateTime.toISOString(),
                    end: endDateTime.toISOString(),
                    status: AppointmentStatus.Confirmed,
                });
                await appointment.save();

                const confirmationText = `OK, I've booked your appointment for "${title}" on ${date} at ${time}. Is there anything else?`;
                conversation.messages.push({ sender: 'user', text: confirmationText, isAI: true, timestamp: new Date().toISOString() } as any);
            } else if (name === 'createOrUpdateClient') {
                const { name: clientName, email: clientEmail } = args as { name: string; email?: string };
                const client = await Client.findById(conversation.clientId);
                if (client) {
                    client.name = clientName;
                    if (clientEmail) client.email = clientEmail;
                    await client.save();
                    const confirmationText = `Thanks, I've updated your name to ${clientName}. How can I help you today?`;
                    conversation.messages.push({ sender: 'user', text: confirmationText, isAI: true, timestamp: new Date().toISOString() } as any);
                }
            }
        } else if (aiResponsePart.text) {
            const aiText = aiResponsePart.text;
            // Check for escalation first
            if (aiText.trim() === "ESCALATE") {
                const lastMessage = conversation.messages[conversation.messages.length - 1];
                if (lastMessage) lastMessage.escalated = true;
                // Add a message to inform the user
                 conversation.messages.push({ sender: 'user', text: "I'm sorry, I can't help with that. I'll have a human team member get back to you shortly.", isAI: true, timestamp: new Date().toISOString() } as any);
            } else {
                conversation.messages.push({ sender: 'user', text: aiText, isAI: true, timestamp: new Date().toISOString() } as any);
            }
        }
        
        return await conversation.save();
    } catch (error) {
        console.error("Error in processAndRespond:", error);
        // Save the conversation state even if AI fails
        conversation.markModified('messages');
        await conversation.save();
        throw error;
    }
};
