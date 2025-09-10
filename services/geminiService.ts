import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { format } from 'date-fns';

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. AI features will be disabled.");
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


export const generateAIResponse = async (knowledgeBase: string, userMessage: string, conversationHistory: {role: string, parts: {text: string}[]}[]): Promise<GenerateContentResponse> => {
    if (!process.env.API_KEY) {
        // Fix: Create a mock GenerateContentResponse that satisfies the type and consuming logic.
        const text = "AI is not configured. (API key is missing)";
        return {
            candidates: [{
                content: {
                    parts: [{ text }],
                    role: 'model'
                }
            }],
            promptFeedback: {},
            get text() { return text; }
        } as unknown as GenerateContentResponse;
    }
    
    const today = format(new Date(), 'EEEE, MMMM d, yyyy');

    const systemInstruction = `You are a helpful business assistant for a small business. Your goal is to answer client questions and assist them with tasks.
    The current date is ${today}.
    
    Your capabilities:
    1.  **Answer Questions**: Use the Knowledge Base to answer questions about the business. If the answer isn't in the knowledge base, say you don't have that information and offer to escalate to a human.
    2.  **Book Appointments**: You can book appointments for clients. You must collect the appointment title, date, and time from the user before using the 'bookAppointment' tool. If any information is missing, you MUST ask the user for it. Do not guess any information.

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
                // Fix: 'tools' must be inside the 'config' object.
                tools: [bookAppointmentTool]
            },
        });

        return response;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        // Fix: Create a mock GenerateContentResponse that satisfies the type and consuming logic.
        const text = "There was an error processing the request with the AI. ESCALATE";
        return {
            candidates: [{
                content: {
                    parts: [{ text }],
                    role: 'model'
                }
            }],
            promptFeedback: {},
            get text() { return text; }
        } as unknown as GenerateContentResponse;
    }
};