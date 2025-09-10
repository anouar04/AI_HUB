
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { format } from 'date-fns';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.API_KEY) {
    console.error("FATAL ERROR: API_KEY environment variable not set for Gemini.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const bookAppointmentTool = {
    functionDeclarations: [
        {
            name: 'bookAppointment',
            description: 'Books a new appointment for a client. Ask for any missing information before calling the function.',
            parameters: {
                type: Type.OBJECT,
                properties: {
                    title: {
                        type: Type.STRING,
                        description: 'The title or reason for the appointment. e.g., "Annual Check-up".'
                    },
                    date: {
                        type: Type.STRING,
                        description: 'The date of the appointment in YYYY-MM-DD format.'
                    },
                    time: {
                        type: Type.STRING,
                        description: 'The time of the appointment in 24-hour HH:mm format.'
                    },
                    durationMinutes: {
                        type: Type.NUMBER,
                        description: 'The duration of the appointment in minutes. Defaults to 60 if not provided.'
                    }
                },
                required: ['title', 'date', 'time']
            }
        }
    ]
};

const createOrUpdateClientTool = {
    functionDeclarations: [
        {
            name: 'createOrUpdateClient',
            description: "Updates a client's information, such as their name or email. Use this when a user introduces themselves or provides new contact details.",
            parameters: {
                type: Type.OBJECT,
                properties: {
                    name: {
                        type: Type.STRING,
                        description: 'The full name of the client.'
                    },
                    email: {
                        type: Type.STRING,
                        description: 'The email address of the client.'
                    },
                },
                required: ['name']
            }
        }
    ]
};

export const generateAIResponse = async (knowledgeBase: string, userMessage: string, conversationHistory: {role: string, parts: {text: string}[]}[]): Promise<GenerateContentResponse> => {
    if (!process.env.API_KEY) {
        throw new Error("Gemini API key is not configured on the server.");
    }
    
    const today = format(new Date(), 'EEEE, MMMM d, yyyy');

    const systemInstruction = `You are a helpful business assistant for a small business. Your goal is to answer client questions and assist them with tasks.
    The current date is ${today}.
    
    Your capabilities:
    1.  **Answer Questions**: Use the Knowledge Base to answer questions about the business. If the answer isn't in the knowledge base, say you don't have that information and offer to escalate to a human.
    2.  **Book Appointments**: You can book appointments for clients. You must collect the appointment title, date, and time from the user before using the 'bookAppointment' tool. If any information is missing, you MUST ask the user for it. Do not guess any information.
    3.  **Update Client Details**: If the user provides their name or email, use the 'createOrUpdateClient' tool to save it.

    If you cannot help or the user is getting frustrated, you MUST respond with the exact phrase: "ESCALATE".

    --- KNOWLEDGE BASE ---
    ${knowledgeBase}
    --- END KNOWLEDGE BASE ---
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [...conversationHistory, { role: 'user', parts: [{text: userMessage}] }],
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.7,
                tools: [bookAppointmentTool, createOrUpdateClientTool]
            },
        });

        return response;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to get a response from the AI service.");
    }
};
