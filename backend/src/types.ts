

// Copied and adapted from frontend/types.ts to keep backend independent.

export enum AppointmentStatus {
  Confirmed = 'Confirmed',
  InProgress = 'In Progress',
  Treated = 'Treated',
  Postponed = 'Postponed',
  Canceled = 'Canceled',
}

export enum CommunicationChannel {
    WhatsApp = 'WhatsApp',
    Telegram = 'Telegram',
    SMS = 'SMS',
}

export enum ChannelType {
    WhatsApp = 'whatsapp',
}

// Interfaces for Mongoose Documents
export interface Client {
  id: string;
  name: string;
  phone: string;
  email:string;
  address: string;
  notes: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  clientId: string;
  title: string;
  start: string;
  end: string;
  status: AppointmentStatus;
}

export interface ToolCallResult {
    toolName: 'bookAppointment' | 'createOrUpdateClient';
    toolArgs: any;
}

export interface Message {
    id: string;
    sender: 'user' | 'client';
    text: string;
    timestamp: string;
    isAI: boolean;
    toolCallResult?: ToolCallResult;
}

export interface Conversation {
    id: string;
    clientId: string;
    channel: CommunicationChannel;
    messages: Message[];
    unread: boolean;
}

export interface AIConfig {
    knowledgeBase: string;
    afterHoursResponse: string;
    afterHoursEnabled: boolean;
}

export interface Channel {
    id: string;
    name: string;
    type: ChannelType;
    externalId: string;
    enabled: boolean;
    status: 'Active' | 'Inactive';
}

export interface Identifier {
    id: string;
    name: string;
    tag: string;
    n8nType: string;
    status: 'Active' | 'Inactive';
    accessToken: string;
    businessAccountId: string;
}

export interface KnowledgeFile {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  path: string; // Add path for server storage
}