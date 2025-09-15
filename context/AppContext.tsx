
import React, { createContext, useContext, ReactNode, useState, useEffect, useRef } from 'react';
import type { Client, Appointment, Conversation, Notification, AIConfig, Message, AppointmentData, Channel, Identifier, IdentifierData, KnowledgeFile, ChannelData } from '../types';
import { NotificationType } from '../types';

const API_BASE_URL = 'http://localhost:5001/api';

// Helper for API calls
const apiCall = async (url: string, options: RequestInit = {}) => {
    try {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            headers: { 'Content-Type': 'application/json' },
            ...options,
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'API request failed');
        }
        if (response.status === 204 || response.headers.get('content-length') === '0') return null;
        return response.json();
    } catch (error) {
        console.error(`API call to ${url} failed:`, error);
        throw error;
    }
};


interface AppContextType {
    clients: Client[];
    setClients: React.Dispatch<React.SetStateAction<Client[]>>;
    appointments: Appointment[];
    setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
    conversations: Conversation[];
    setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
    notifications: Notification[];
    setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
    aiConfig: AIConfig | null;
    setAiConfig: React.Dispatch<React.SetStateAction<AIConfig | null>>;
    channels: Channel[];
    setChannels: React.Dispatch<React.SetStateAction<Channel[]>>;
    identifiers: Identifier[];
    setIdentifiers: React.Dispatch<React.SetStateAction<Identifier[]>>;
    knowledgeFiles: KnowledgeFile[];
    setKnowledgeFiles: React.Dispatch<React.SetStateAction<KnowledgeFile[]>>;
    addNotification: (type: NotificationType, message: string) => void;
    handleIncomingMessage: (conversationId: string, text: string) => Promise<void>;
    addClient: (clientData: Omit<Client, 'id' | 'createdAt'>) => Promise<void>;
    updateClient: (clientData: Client) => Promise<void>;
    addAppointment: (appointmentData: AppointmentData) => Promise<void>;
    updateAppointment: (appointmentData: Appointment) => Promise<void>;
    addIdentifier: (identifierData: IdentifierData) => Promise<void>;
    updateIdentifier: (identifierData: Identifier) => Promise<void>;
    deleteIdentifier: (identifierId: string) => Promise<void>;
    addChannel: (channelData: ChannelData) => Promise<void>;
    updateChannel: (channelData: Channel) => Promise<void>;
    deleteChannel: (channelId: string) => Promise<void>;
    addKnowledgeFile: (file: File) => Promise<void>;
    deleteKnowledgeFile: (fileId: string) => Promise<void>;
    updateAiConfig: (configData: AIConfig) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [clients, setClients] = useState<Client[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [aiConfig, setAiConfig] = useState<AIConfig | null>(null);
    const [channels, setChannels] = useState<Channel[]>([]);
    const [identifiers, setIdentifiers] = useState<Identifier[]>([]);
    const [knowledgeFiles, setKnowledgeFiles] = useState<KnowledgeFile[]>([]);
    const prevConversationsRef = useRef<Conversation[]>();

    useEffect(() => {
        const fetchStaticData = async () => {
            try {
                const aiConfigData = await apiCall('/ai-config');
                setAiConfig(aiConfigData);
            } catch (error) {
                console.error("Failed to fetch AI config:", error);
            }
        };
    
        const fetchDynamicData = async () => {
            try {
                const [clientsData, appointmentsData, conversationsData, channelsData, identifiersData, knowledgeFilesData] = await Promise.all([
                    apiCall('/clients'),
                    apiCall('/appointments'),
                    apiCall('/conversations'),
                    apiCall('/channels'),
                    apiCall('/identifiers'),
                    apiCall('/knowledge-files'),
                ]);
                setClients(clientsData || []);
                setAppointments(appointmentsData || []);
                setConversations(conversationsData || []);
                setChannels(channelsData || []);
                setIdentifiers(identifiersData || []);
                setKnowledgeFiles(knowledgeFilesData || []);
            } catch (error) {
                console.error("Failed to fetch dynamic data:", error);
            }
        };
    
        fetchStaticData();
        fetchDynamicData(); // Initial fetch
        const interval = setInterval(fetchDynamicData, 5000); // Poll every 5 seconds
    
        return () => clearInterval(interval); // Cleanup on unmount
    }, []);

    useEffect(() => {
        if (prevConversationsRef.current) {
            conversations.forEach(newConvo => {
                const oldConvo = prevConversationsRef.current.find(c => c.id === newConvo.id);
                if (oldConvo && newConvo.messages.length > oldConvo.messages.length) {
                    const newMessages = newConvo.messages.slice(oldConvo.messages.length);
                    newMessages.forEach(msg => {
                        if (msg.sender === 'client') {
                            const client = clients.find(c => c.id === newConvo.clientId);
                            addNotification(NotificationType.NewMessage, `New message from ${client?.name || 'a client'}`);
                        }
                        if (msg.isAI) {
                            const toolName = msg.toolCallResult?.toolName;
                            if (toolName === 'bookAppointment' || toolName === 'updateAppointmentStatus') {
                                apiCall('/appointments').then(setAppointments);
                                const client = clients.find(c => c.id === newConvo.clientId);
                                if (toolName === 'bookAppointment') {
                                    const { title } = msg.toolCallResult.toolArgs as { title: string };
                                    addNotification(NotificationType.NewAppointment, `AI booked a new appointment "${title}" for ${client?.name || 'a client'}.`);
                                } else if (toolName === 'updateAppointmentStatus') {
                                    const { newStatus } = msg.toolCallResult.toolArgs as { newStatus: string };
                                    addNotification(NotificationType.AppointmentChange, `AI updated an appointment to "${newStatus}" for ${client?.name || 'a client'}.`);
                                }
                            }
                        }
                    });
                }
            });
        }
        prevConversationsRef.current = conversations;
    }, [conversations]);


    const addNotification = (type: NotificationType, message: string) => {
        const newNotification: Notification = {
            id: Date.now().toString(),
            type,
            message,
            timestamp: new Date().toISOString(),
            read: false,
        };
        setNotifications(prev => [newNotification, ...prev]);
    };

    const addClient = async (clientData: Omit<Client, 'id' | 'createdAt'>) => {
        const newClient = await apiCall('/clients', { method: 'POST', body: JSON.stringify(clientData) });
        setClients(prev => [newClient, ...prev]);
        addNotification(NotificationType.NewClient, `New client added: ${newClient.name}`);
    };

    const updateClient = async (clientData: Client) => {
        const updatedClient = await apiCall(`/clients/${clientData.id}`, { method: 'PUT', body: JSON.stringify(clientData) });
        setClients(prev => prev.map(client => client.id === updatedClient.id ? updatedClient : client));
        addNotification(NotificationType.ClientChange, `Client details for ${updatedClient.name} were updated.`);
    };

    const addAppointment = async (appointmentData: AppointmentData) => {
        const newAppointment = await apiCall('/appointments', { method: 'POST', body: JSON.stringify(appointmentData) });
        setAppointments(prev => [newAppointment, ...prev].sort((a,b) => new Date(b.start).getTime() - new Date(a.start).getTime()));
        const client = clients.find(c => c.id === appointmentData.clientId);
        addNotification(NotificationType.NewAppointment, `New appointment "${newAppointment.title}" booked for ${client?.name || 'a client'}.`);
    };

    const updateAppointment = async (appointmentData: Appointment) => {
        const updatedAppointment = await apiCall(`/appointments/${appointmentData.id}`, { method: 'PUT', body: JSON.stringify(appointmentData) });
        setAppointments(prev => prev.map(appt => appt.id === updatedAppointment.id ? updatedAppointment : appt));
        const client = clients.find(c => c.id === updatedAppointment.clientId);
        addNotification(NotificationType.AppointmentChange, `Appointment "${updatedAppointment.title}" for ${client?.name || 'a client'} was updated.`);
    };

    const addIdentifier = async (identifierData: IdentifierData) => {
        const newIdentifier = await apiCall('/identifiers', { method: 'POST', body: JSON.stringify(identifierData) });
        setIdentifiers(prev => [newIdentifier, ...prev]);
        addNotification(NotificationType.NewIdentifier, `New identifier created: ${newIdentifier.name}.`);
    };

    const updateIdentifier = async (identifierData: Identifier) => {
        const updatedIdentifier = await apiCall(`/identifiers/${identifierData.id}`, { method: 'PUT', body: JSON.stringify(identifierData) });
        setIdentifiers(prev => prev.map(id => id.id === updatedIdentifier.id ? updatedIdentifier : id));
        addNotification(NotificationType.IdentifierChange, `Identifier "${updatedIdentifier.name}" was updated.`);
    };

    const deleteIdentifier = async (identifierId: string) => {
        const identifierToDelete = identifiers.find(id => id.id === identifierId);
        await apiCall(`/identifiers/${identifierId}`, { method: 'DELETE' });
        setIdentifiers(prev => prev.filter(id => id.id !== identifierId));
        if (identifierToDelete) {
            addNotification(NotificationType.IdentifierDeleted, `Identifier "${identifierToDelete.name}" was deleted.`);
        }
    };

    const addChannel = async (channelData: ChannelData) => {
        const fullChannelData = { ...channelData, status: channelData.enabled ? 'Active' : 'Inactive' };
        const newChannel = await apiCall('/channels', { method: 'POST', body: JSON.stringify(fullChannelData) });
        setChannels(prev => [newChannel, ...prev]);
        addNotification(NotificationType.NewChannel, `New channel created: ${newChannel.name}.`);
    };

    const updateChannel = async (channelData: Channel) => {
        const updatedChannel = await apiCall(`/channels/${channelData.id}`, { method: 'PUT', body: JSON.stringify(channelData) });
        setChannels(prev => prev.map(ch => ch.id === updatedChannel.id ? updatedChannel : ch));
        addNotification(NotificationType.ChannelChange, `Channel "${updatedChannel.name}" was updated.`);
    };

    const deleteChannel = async (channelId: string) => {
        const channelToDelete = channels.find(ch => ch.id === channelId);
        await apiCall(`/channels/${channelId}`, { method: 'DELETE' });
        setChannels(prev => prev.filter(ch => ch.id !== channelId));
        if (channelToDelete) {
            addNotification(NotificationType.ChannelDeleted, `Channel "${channelToDelete.name}" was deleted.`);
        }
    };

    const addKnowledgeFile = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(`${API_BASE_URL}/knowledge-files`, { method: 'POST', body: formData });
        if(!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'File upload failed');
        }
        const newFile = await res.json();
        setKnowledgeFiles(prev => [newFile, ...prev]);
        addNotification(NotificationType.FileUploaded, `File uploaded: ${newFile.name}`);
    };

    const deleteKnowledgeFile = async (fileId: string) => {
        await apiCall(`/knowledge-files/${fileId}`, { method: 'DELETE' });
        setKnowledgeFiles(prev => prev.filter(file => file.id !== fileId));
    };

    const updateAiConfig = async (configData: AIConfig) => {
        const updatedConfig = await apiCall('/ai-config', { method: 'PUT', body: JSON.stringify(configData) });
        console.log("Received updated AI config from server:", updatedConfig);
        setAiConfig(updatedConfig);
    };

    const handleIncomingMessage = async (conversationId: string, text: string) => {
        const tempMessageId = Date.now().toString();
        const clientMessage: Message = { id: tempMessageId, sender: 'client', text, timestamp: new Date().toISOString(), isAI: false };
        setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, messages: [...c.messages, clientMessage], unread: true } : c));
        
        const client = clients.find(c => c.id === conversations.find(conv => conv.id === conversationId)?.clientId);
        addNotification(NotificationType.NewMessage, `New message from ${client?.name || 'a client'}`);

        const updatedConversation = await apiCall(`/conversations/${conversationId}/messages`, { method: 'POST', body: JSON.stringify({ text }) });
        
        setConversations(prev => prev.map(c => c.id === updatedConversation.id ? updatedConversation : c));
        
        const lastAIMessage = updatedConversation.messages.slice().reverse().find((m: Message) => m.isAI);
        const toolName = lastAIMessage?.toolCallResult?.toolName;
        if (toolName === 'bookAppointment' || toolName === 'updateAppointmentStatus') {
            const appointmentsData = await apiCall('/appointments');
            setAppointments(appointmentsData);

            const toolArgs = lastAIMessage?.toolCallResult?.toolArgs;
            if (toolArgs) {
                const client = clients.find(c => c.id === updatedConversation.clientId);
                if (toolName === 'bookAppointment') {
                    const { title } = toolArgs as { title: string };
                    addNotification(NotificationType.NewAppointment, `AI booked a new appointment \"${title}\" for ${client?.name || 'a client'}.`);
                } else if (toolName === 'updateAppointmentStatus') {
                    const { newStatus } = toolArgs as { newStatus: string };
                    addNotification(NotificationType.AppointmentChange, `AI updated an appointment to \"${newStatus}\" for ${client?.name || 'a client'}.`);
                }
            }
        }
    };

    const value: AppContextType = {
        clients, setClients,
        appointments, setAppointments,
        conversations, setConversations,
        notifications, setNotifications,
        aiConfig, setAiConfig,
        channels, setChannels,
        identifiers, setIdentifiers,
        knowledgeFiles, setKnowledgeFiles,
        addNotification,
        handleIncomingMessage,
        addClient,
        updateClient,
        addAppointment,
        updateAppointment,
        addIdentifier,
        updateIdentifier,
        deleteIdentifier,
        addChannel,
        updateChannel,
        deleteChannel,
        addKnowledgeFile,
        deleteKnowledgeFile,
        updateAiConfig,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
