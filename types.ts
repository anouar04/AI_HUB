
export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  createdAt: string;
}

export enum AppointmentStatus {
  Confirmed = 'Confirmed',
  InProgress = 'In Progress',
  Treated = 'Treated',
  Postponed = 'Postponed',
  Canceled = 'Canceled',
}

export interface Appointment {
  id: string;
  clientId: string;
  title: string;
  start: string;
  end: string;
  status: AppointmentStatus;
}

export type AppointmentData = Omit<Appointment, 'id'>;

export enum CommunicationChannel {
    WhatsApp = 'WhatsApp',
    Telegram = 'Telegram',
    SMS = 'SMS',
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

export enum NotificationType {
    NewMessage = 'New Message',
    NewAppointment = 'New Appointment',
    AppointmentChange = 'Appointment Change',
    NewClient = 'New Client',
    NewIdentifier = 'New Identifier',
    FileUploaded = 'File Uploaded',
    ClientChange = 'Client Change',
    NewChannel = 'New Channel',
    IdentifierChange = 'Identifier Change',
    IdentifierDeleted = 'Identifier Deleted',
    ChannelChange = 'Channel Change',
    ChannelDeleted = 'Channel Deleted',
}

export interface Notification {
    id: string;
    type: NotificationType;
    message: string;
    timestamp: string;
    read: boolean;
}

export interface AIConfig {
    knowledgeBase: string;
    afterHoursResponse: string;
    afterHoursEnabled: boolean;
}

export enum ChannelType {
    WhatsApp = 'whatsapp',
}

export interface Channel {
    id: string;
    name: string;
    type: ChannelType;
    externalId: string;
    enabled: boolean;
    status: 'Active' | 'Inactive';
}

export type ChannelData = Omit<Channel, 'id' | 'status'>;

export interface Identifier {
    id: string;
    name: string;
    tag: string;
    n8nType: string;
    status: 'Active' | 'Inactive';
    accessToken: string;
    businessAccountId: string;
}

export type IdentifierData = Omit<Identifier, 'id' | 'accessToken' | 'businessAccountId'>;

export interface KnowledgeFile {
  id: string;
  name: string;
  type: string;
  size: number; // in bytes
  uploadedAt: string;
}

export type View = 'dashboard' | 'calendar' | 'clients' | 'ai-agent-conversations' | 'ai-agent' | 'notifications' | 'acquisition-channels' | 'identifiers' | 'teach-agent';