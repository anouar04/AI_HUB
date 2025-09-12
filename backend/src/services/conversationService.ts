

import Conversation, { IConversation } from '../models/Conversation';
import Client from '../models/Client';
import Appointment from '../models/Appointment';
import AIConfig from '../models/AIConfig';
import { generateAIResponse } from './geminiService';
// Fix: Import date-fns functions from the main package to resolve call signature errors.
import { addMinutes, format, parseISO } from 'date-fns';
import { AppointmentStatus } from '../types';
import { Document } from 'mongoose';

// Fix: Use an intersection type to explicitly include Mongoose Document methods for the 'conversation' parameter.
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
                    status: AppointmentStatus.InProgress,
                });
                await appointment.save();

                const confirmationText = `OK, I've tentatively booked your appointment for "${title}" on ${date} at ${time}. Please let me know if this is correct to confirm it.`;
                conversation.messages.push({ 
                    sender: 'user', 
                    text: confirmationText, 
                    isAI: true, 
                    timestamp: new Date().toISOString(),
                    toolCallResult: {
                        toolName: 'bookAppointment',
                        toolArgs: { title, date, time, durationMinutes }
                    }
                } as any);
            } else if (name === 'createOrUpdateClient') {
                const { name: clientName, email: clientEmail } = args as { name: string; email?: string };
                const client = await Client.findById(conversation.clientId);
                if (client) {
                    client.name = clientName;
                    if (clientEmail) client.email = clientEmail;
                    await client.save();
                    const confirmationText = `Thanks, I've updated your name to ${clientName}. How can I help you today?`;
                    conversation.messages.push({ 
                        sender: 'user', 
                        text: confirmationText, 
                        isAI: true, 
                        timestamp: new Date().toISOString(),
                        toolCallResult: {
                            toolName: 'createOrUpdateClient',
                            toolArgs: { name: clientName, email: clientEmail }
                        }
                    } as any);
                }
            } else if (name === 'findClientAppointments') {
                const appointments = await Appointment.find({
                    clientId: conversation.clientId,
                    start: { $gte: new Date() }
                }).sort({ start: 'asc' });
            
                let responseText;
                if (appointments.length === 0) {
                    responseText = "It looks like you don't have any upcoming appointments.";
                } else {
                    const appointmentList = appointments.map(a => `- ${a.title} on ${format(a.start, 'MMM d, yyyy')} at ${format(a.start, 'p')}`).join('\n');
                    responseText = `I see you have the following upcoming appointments:\n${appointmentList}\nWhich one would you like to manage?`;
                }
                conversation.messages.push({
                    sender: 'user',
                    text: responseText,
                    isAI: true,
                    timestamp: new Date().toISOString(),
                    toolCallResult: { toolName: name, toolArgs: args }
                } as any);
            } else if (name === 'updateAppointmentStatus') {
                const { date, time, newStatus } = args as { date: string; time: string; newStatus: AppointmentStatus };
            
                if (!Object.values(AppointmentStatus).includes(newStatus)) {
                    const invalidStatusText = `I'm sorry, I can only set the status to one of the following: Confirmed, Canceled, or Postponed.`;
                    conversation.messages.push({ sender: 'user', text: invalidStatusText, isAI: true, timestamp: new Date().toISOString(), toolCallResult: { toolName: name, toolArgs: args } } as any);
                } else {
                    try {
                        const startDateTime = parseISO(`${date}T${time}`);
            
                        const appointment = await Appointment.findOne({
                            clientId: conversation.clientId,
                            start: startDateTime
                        });
                
                        if (!appointment) {
                            const responseText = "I couldn't find an appointment at that exact date and time. Could you please double-check?";
                            conversation.messages.push({ sender: 'user', text: responseText, isAI: true, timestamp: new Date().toISOString(), toolCallResult: { toolName: name, toolArgs: args } } as any);
                        } else {
                            appointment.status = newStatus;
                            await appointment.save();
                
                            let responseText = `I have updated your appointment for "${appointment.title}" to "${newStatus}".`;
                            if (newStatus === AppointmentStatus.Canceled) {
                                responseText = `I have canceled your appointment for "${appointment.title}". Let me know if you need to reschedule.`;
                            } else if (newStatus === AppointmentStatus.Postponed) {
                                responseText = `I have marked your appointment for "${appointment.title}" as postponed. When would you like to reschedule?`;
                            } else if (newStatus === AppointmentStatus.Confirmed) {
                                responseText = `Great! I've confirmed your appointment for "${appointment.title}". We look forward to seeing you!`;
                            }
                
                            conversation.messages.push({ sender: 'user', text: responseText, isAI: true, timestamp: new Date().toISOString(), toolCallResult: { toolName: name, toolArgs: args } } as any);
                        }
                    } catch (e) {
                        console.error("Error parsing date/time for updateAppointmentStatus", e);
                        const errorText = "There was an issue processing the date and time. Please provide them in YYYY-MM-DD and HH:mm format.";
                        conversation.messages.push({ sender: 'user', text: errorText, isAI: true, timestamp: new Date().toISOString(), toolCallResult: { toolName: name, toolArgs: args } } as any);
                    }
                }
            }
        } else if (aiResponsePart.text) {
            const aiText = aiResponsePart.text;
            conversation.messages.push({ sender: 'user', text: aiText, isAI: true, timestamp: new Date().toISOString() } as any);
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