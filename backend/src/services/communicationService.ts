import dotenv from 'dotenv';
import twilio from 'twilio';

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

console.log('TWILIO_ACCOUNT_SID:', accountSid ? 'SET' : 'NOT SET');
console.log('TWILIO_AUTH_TOKEN:', authToken ? 'SET' : 'NOT SET');
console.log('TWILIO_PHONE_NUMBER:', twilioPhoneNumber ? 'SET' : 'NOT SET');

const twilioClient = twilio(accountSid, authToken);

export const sendMessage = async (to: string, message: string): Promise<void> => {
    if (!accountSid || !authToken || !twilioPhoneNumber) {
        console.error('Twilio credentials are not set in environment variables.');
        return;
    }

    try {
        await twilioClient.messages.create({
            body: message,
            from: twilioPhoneNumber,
            to: to
        });
        console.log(`Message sent to ${to}: ${message}`);
    } catch (error) {
        console.error(`Error sending message to ${to}:`, error);
    }
};