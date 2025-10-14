import Conversation, { IConversation } from '../models/Conversation';
import Client from '../models/Client';
import Appointment from '../models/Appointment';
import AIConfig from '../models/AIConfig';
import KnowledgeFile from '../models/KnowledgeFile';
import fs from 'fs';
import { generateAIResponse } from './geminiService';
import { addMinutes, format, parseISO } from 'date-fns';
import { AppointmentStatus, NotificationType } from '../types';
import { Document } from 'mongoose';
import { createNotification } from './notificationService';

const MAX_HISTORY_MESSAGES = 20; // Limit to last 20 messages to maintain focus and prevent context drift

export const processAndRespond = async (conversation: IConversation & Document, userMessageText: string) => {
    try {
        // 1. Add client's message to conversation
        conversation.messages.push({
            sender: 'client',
            text: userMessageText,
            isAI: false,
            timestamp: new Date().toISOString()
        } as any);
        conversation.unread = true;

        // 2. Prepare for AI call
        const aiConfig = await AIConfig.findOne();
        if (!aiConfig) throw new Error('AI configuration not found.');

        const knowledgeFiles = await KnowledgeFile.find();
        const fileParts = knowledgeFiles.map(file => {
            try {
                const data = fs.readFileSync(file.path, { encoding: 'base64' });
                return { inlineData: { mimeType: file.type, data } };
            } catch (error) {
                console.error(`Error reading knowledge file ${file.name}:`, error);
                return null;
            }
        }).filter(part => part !== null);

        const history = conversation.messages.map(msg => {
            // This is a simplified mapping. For a more robust solution, you would need to store the full content parts in your database.
            return { role: msg.sender === 'client' ? 'user' : 'model', parts: [{ text: msg.text }] };
        }).slice(-MAX_HISTORY_MESSAGES); // Truncate history to the last MAX_HISTORY_MESSAGES

        // Initial call to AI
        let aiResponse = await generateAIResponse(
            aiConfig.knowledgeBase,
            userMessageText,
            history.slice(0, -1), // Exclude the current user message
            fileParts as any[]
        );

        let aiResponsePart = aiResponse.candidates?.[0]?.content.parts[0];

        // Loop to handle multi-turn function calls
        while (aiResponsePart?.functionCall) {
            const { name, args } = aiResponsePart.functionCall;
            let toolResult: any;

            // Execute the tool
            if (name === 'bookAppointment') {
                const { title, date, time, durationMinutes = 60 } = args as { title: string; date: string; time: string; durationMinutes?: number };
                try {
                    const startDateTime = parseISO(`${date}T${time}`);
                    const endDateTime = addMinutes(startDateTime, durationMinutes);
                    const appointment = new Appointment({
                        clientId: conversation.clientId,
                        title,
                        start: startDateTime.toISOString(),
                        end: endDateTime.toISOString(),
                        status: AppointmentStatus.InProgress,
                    });
                    console.log("Attempting to save appointment:", appointment);
                    await appointment.save();
                    console.log("Appointment saved successfully with ID:", appointment.id);
                    await createNotification('admin', `New appointment booked: ${title} on ${date} at ${time}.`, NotificationType.NewAppointment, `/appointments/${appointment.id}`);
                    toolResult = { success: true, appointmentId: appointment.id, title, date, time };
                } catch (e) {
                    toolResult = { success: false, error: "Invalid date or time format provided by user." };
                }
            } else if (name === 'createOrUpdateClient') {
                const { name: clientName, email: clientEmail } = args as { name: string; email?: string };
                const client = await Client.findById(conversation.clientId);
                                    if (client) {
                                        client.name = clientName;
                                        if (clientEmail) client.email = clientEmail;
                                        await client.save();
                                        await createNotification('admin', `Client ${client.name} (${client.id}) information updated.`, NotificationType.ClientChange, `/clients/${client.id}`);
                                        toolResult = { success: true, client: { name: client.name, email: client.email } };                } else {
                    toolResult = { success: false, error: "Client record not found." };
                }
            } else if (name === 'findClientAppointments') {
                const appointments = await Appointment.find({
                    clientId: conversation.clientId,
                    start: { $gte: new Date() }
                }).sort({ start: 'asc' });
                toolResult = { appointments: appointments.map(a => ({ title: a.title, start: format(a.start, 'Pp') })) };
            } else if (name === 'updateAppointmentStatus') {
                console.log("Attempting to execute updateAppointmentStatus tool.");
                const { date, time, newStatus } = args as { date: string; time: string; newStatus: AppointmentStatus };
                if (!Object.values(AppointmentStatus).includes(newStatus)) {
                    toolResult = { success: false, error: "Invalid appointment status provided by user." };
                } else {
                    try {
                        const startDateTime = parseISO(`${date}T${time}`);
                        console.log("Attempting to find appointment with clientId:", conversation.clientId, "and startDateTime:", startDateTime);
                        const appointment = await Appointment.findOne({ clientId: conversation.clientId, start: startDateTime });
                        console.log("Appointment findOne result:", appointment);
                        if (appointment) {
                            appointment.status = newStatus;
                            await appointment.save();
                            await createNotification('admin', `Appointment \"${appointment.title}\" status updated to ${newStatus}.`, NotificationType.AppointmentChange, `/appointments/${appointment.id}`);
                            toolResult = { success: true, status: newStatus, title: appointment.title };
                        } else {
                            toolResult = { success: false, error: "Appointment not found at the specified date and time." };
                        }
                    } catch (e) {
                        toolResult = { success: false, error: "Invalid date or time format provided by user." };
                    }
                }
            } else if (name === 'getClientInfo') {
                const client = await Client.findById(conversation.clientId);
                if (client) {
                    toolResult = { name: client.name, email: client.email, phone: client.phone };
                } else {
                    toolResult = { error: "Client record not found." };
                }
            }

            // Add the function call and its result to the history
            history.push({ role: 'model', parts: [aiResponsePart] });
            history.push({ role: 'tool', parts: [{ functionResponse: { name, response: toolResult } }] });

            // Second call to AI with the tool result
            aiResponse = await generateAIResponse(
                aiConfig.knowledgeBase,
                "", // No new user message, the AI continues from the tool result
                history,
                fileParts as any[]
            );
            aiResponsePart = aiResponse.candidates?.[0]?.content.parts[0];
        }

        if (aiResponsePart?.text) {
            const aiText = aiResponsePart.text;
            conversation.messages.push({ sender: 'ai', text: aiText, isAI: true, timestamp: new Date().toISOString() } as any);
        } else {
            // Fallback response
            const fallbackText = "I'm sorry, I wasn't able to process that. Can you please try again?";
            conversation.messages.push({ sender: 'ai', text: fallbackText, isAI: true, timestamp: new Date().toISOString() } as any);
        }

        return await conversation.save();
    } catch (error) {
        console.error("Error in processAndRespond:", error);
        conversation.markModified('messages');
        await conversation.save();
        throw error;
    }
};
