import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { format } from 'date-fns';
import dotenv from 'dotenv';
import { AppointmentStatus } from "../types";

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
    console.error("FATAL ERROR: GEMINI_API_KEY environment variable not set for Gemini.");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

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

const findClientAppointmentsTool = {
    functionDeclarations: [
        {
            name: 'findClientAppointments',
            description: "Finds all upcoming appointments for the current client. Use this before attempting to cancel or modify an appointment.",
            parameters: {
                type: Type.OBJECT,
                properties: {},
                required: []
            }
        }
    ]
};

const updateAppointmentStatusTool = {
    functionDeclarations: [
        {
            name: 'updateAppointmentStatus',
            description: "Updates the status of an existing appointment. Use this to confirm, cancel, or postpone an appointment. You must first know the appointment's exact date and time, for example by using `findClientAppointments`.",
            parameters: {
                type: Type.OBJECT,
                properties: {
                    date: {
                        type: Type.STRING,
                        description: 'The date of the appointment to update, in YYYY-MM-DD format.'
                    },
                    time: {
                        type: Type.STRING,
                        description: 'The time of the appointment to update, in 24-hour HH:mm format.'
                    },
                    newStatus: {
                        type: Type.STRING,
                        description: `The new status. Must be one of: ${Object.values(AppointmentStatus).join(', ')}.`
                    }
                },
                required: ['date', 'time', 'newStatus']
            }
        }
    ]
};

const getClientInfoTool = {
    functionDeclarations: [
        {
            name: 'getClientInfo',
            description: "Retrieves the client's stored information, such as name, email, and phone number. Use this when the client asks what information you have about them.",
            parameters: {
                type: Type.OBJECT,
                properties: {},
                required: []
            }
        }
    ]
};

export const generateAIResponse = async (knowledgeBase: string, userMessage: string, conversationHistory: {role: string, parts: {text: string}[]}[], fileParts: any[]): Promise<GenerateContentResponse> => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("Gemini API key is not configured on the server.");
    }
    
    const today = format(new Date(), 'EEEE, MMMM d, yyyy');

    const systemInstruction = `You are a friendly and highly capable business assistant for a small business. Your primary goal is to provide excellent customer service by answering client questions and assisting them with tasks directly.
    **CRITICAL INSTRUCTION: You MUST detect the user's language and respond EXCLUSIVELY in that same language. If the user speaks Darija, your entire response MUST be in Darija. This language adherence is paramount, especially when confirming details or providing information after executing a tool. NEVER repeat greetings (e.g., "Ahlan!") in every message; greet once at the beginning of a conversation or when contextually appropriate, but not in every turn.**

    The current date is ${today}.
    
    You have been provided with a comprehensive knowledge base. This knowledge base contains all the necessary information about the business, including services, policies, and other relevant details, regardless of its original format (text, image, document, etc.). **It is absolutely critical that you NEVER mention that your knowledge comes from files, images, documents, or any specific data source. You must NEVER imply that the client has provided you with this information. Always refer to your information generally as 'my knowledge base', 'the information I have', or 'our available services/details'. Treat all information as part of a single, unified knowledge base.**

    Your capabilities:
    1.  **Answer Questions**: Use the information available in your knowledge base to answer any questions about the business. If the answer isn't in the provided information, politely inform the user you don't have the specific details.
    
    2.  **Book Appointments**: You can book appointments. When a client requests an appointment, gather the title, date, and time. Then use the 'bookAppointment' tool. This will create a *tentative* appointment (In Progress). You MUST then ask the client to confirm the details. If they confirm, use the 'updateAppointmentStatus' tool to change the status to 'Confirmed'.
    
    3.  **Manage Appointments**: You can cancel or postpone appointments. 
        - First, use the 'findClientAppointments' tool to see the client's upcoming appointments. 
        - Present the options to the client and ask them to specify which one they want to change.
        - Once they specify, use the 'updateAppointmentStatus' tool with the correct date, time, and new status ('Canceled' or 'Postponed').
        - If an appointment is postponed, ask them when they would like to reschedule.

    4.  **Update Client Details**: If a user provides their name or email, use the 'createOrUpdateClient' tool to save it and confirm with them that you have updated their information.

    5.  **Retrieve Client Information**: If the user asks what information you have about them, use the 
getClientInfo
 tool to retrieve their details and present them.

    You should be able to handle all client queries. Be conversational, professional, and always aim to resolve the user's request.

    --- KNOWLEDGE BASE (use as a secondary reference) ---
    ${knowledgeBase}
    --- END KNOWLEDGE BASE ---
    `;

    const userContentParts: any[] = [];
    if (fileParts && fileParts.length > 0) {
        // Prepend files to the user's message parts, so the model sees them as context first.
        userContentParts.push(...fileParts);
    }
    userContentParts.push({ text: userMessage });


    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [...conversationHistory, { role: 'user', parts: userContentParts }],
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.7,
                tools: [bookAppointmentTool, createOrUpdateClientTool, findClientAppointmentsTool, updateAppointmentStatusTool, getClientInfoTool]
            },
        });

        return response;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to get a response from the AI service.");
    }
};