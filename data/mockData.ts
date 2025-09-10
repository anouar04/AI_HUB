
import type { Client, Appointment, Conversation, Notification, AIConfig, Channel, Identifier, KnowledgeFile } from '../types';
import { AppointmentStatus, CommunicationChannel, NotificationType, ChannelType } from '../types';
import { subDays, addHours, formatISO, subMinutes } from 'date-fns';

const now = new Date();

export const MOCK_CLIENTS: Client[] = [
  { id: '1', name: 'Alice Johnson', phone: '555-0101', email: 'alice.j@example.com', address: '123 Maple St', notes: 'Prefers morning appointments.', createdAt: subDays(now, 10).toISOString() },
  { id: '2', name: 'Bob Williams', phone: '555-0102', email: 'bob.w@example.com', address: '456 Oak Ave', notes: 'Interested in new services.', createdAt: subDays(now, 25).toISOString() },
  { id: '3', name: 'Charlie Brown', phone: '555-0103', email: 'charlie.b@example.com', address: '789 Pine Ln', notes: '', createdAt: subDays(now, 40).toISOString() },
  { id: '4', name: 'Diana Prince', phone: '555-0104', email: 'diana.p@example.com', address: '101 Power Ct', notes: 'VIP Client', createdAt: subDays(now, 5).toISOString() },
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  { id: '1', clientId: '1', title: 'Consultation', start: addHours(now, 2).toISOString(), end: addHours(now, 3).toISOString(), status: AppointmentStatus.Confirmed },
  { id: '2', clientId: '2', title: 'Follow-up', start: addHours(now, 4).toISOString(), end: addHours(now, 4.5).toISOString(), status: AppointmentStatus.InProgress },
  { id: '3', clientId: '3', title: 'Project Kickoff', start: subDays(now, 1).toISOString(), end: addHours(subDays(now, 1), 2).toISOString(), status: AppointmentStatus.Treated },
  { id: '4', clientId: '4', title: 'Strategy Session', start: subDays(now, 2).toISOString(), end: addHours(subDays(now, 2), 1).toISOString(), status: AppointmentStatus.Canceled },
  { id: '5', clientId: '1', title: 'Check-in', start: addHours(now, 24).toISOString(), end: addHours(now, 25).toISOString(), status: AppointmentStatus.Postponed },
];

export const MOCK_CONVERSATIONS: Conversation[] = [
    {
        id: '1',
        clientId: '1',
        channel: CommunicationChannel.WhatsApp,
        unread: true,
        messages: [
            { id: 'm1', sender: 'client', text: 'Hi! Can I ask about your hours?', timestamp: subDays(now, 1).toISOString(), isAI: false },
        ]
    },
    {
        id: '2',
        clientId: '2',
        channel: CommunicationChannel.Telegram,
        unread: false,
        messages: [
            { id: 'm2', sender: 'client', text: 'Just wanted to confirm my appointment tomorrow.', timestamp: subDays(now, 2).toISOString(), isAI: false },
            { id: 'm3', sender: 'user', text: 'Hi Bob, yes, we have you down for 2pm. See you then!', timestamp: subDays(now, 2).toISOString(), isAI: false },
        ]
    }
];

export const MOCK_NOTIFICATIONS: Notification[] = [
    { id: '1', type: NotificationType.NewMessage, message: "New message from Alice Johnson.", timestamp: subDays(now, 1).toISOString(), read: false },
    { id: '2', type: NotificationType.NewAppointment, message: "New appointment booked with Diana Prince.", timestamp: subDays(now, 1).toISOString(), read: true },
];

export const MOCK_AI_CONFIG: AIConfig = {
    knowledgeBase: `Our business hours are Monday to Friday, 9 AM to 5 PM.\nWe are located at 123 Business Rd, Commerce City.\nBasic consultation costs $100 per hour.\nWe do not offer services on weekends.`,
    afterHoursResponse: "Thanks for your message! We're currently closed, but we'll get back to you during our business hours (Mon-Fri, 9am-5pm).",
    afterHoursEnabled: true,
};

export const MOCK_CHANNELS: Channel[] = [
  {
    id: '1',
    name: 'Whatsapp Channel',
    type: ChannelType.WhatsApp,
    externalId: '212698360842',
    enabled: true,
    status: 'Active',
  },
];

export const MOCK_IDENTIFIERS: Identifier[] = [
    {
        id: '2',
        name: 'Whatsapp api',
        tag: 'Whatsapp API',
        n8nType: 'whatsAppApi',
        status: 'Active',
        accessToken: 'EAASiSAkhzQcBPCLOzxZA5ot',
        businessAccountId: '1323213559260173',
    },
    {
        id: '1',
        name: 'Whatsapp trigger',
        tag: 'Whatsapp Trigger',
        n8nType: 'whatsAppTriggerApi',
        status: 'Active',
        accessToken: 'EAASiSAkhzQcBPCLOzxTrigger',
        businessAccountId: '1323213559260174',
    },
];

export const MOCK_KNOWLEDGE_FILES: KnowledgeFile[] = [
    {
        id: 'file-1',
        name: 'business-info.pdf',
        type: 'application/pdf',
        size: 524288, // 512 KB
        uploadedAt: subMinutes(now, 10).toISOString(),
    },
    {
        id: 'file-2',
        name: 'faq-and-services.pdf',
        type: 'application/pdf',
        size: 1228800, // 1.2 MB
        uploadedAt: subDays(now, 2).toISOString(),
    },
];