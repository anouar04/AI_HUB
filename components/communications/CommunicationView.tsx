
import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Icon } from '../icons/Icon';
import type { Channel, Conversation, Message } from '../../types';
import { CommunicationChannel } from '../../types';
import { format } from 'date-fns';
import ChannelDetailsModal from '../channels/ChannelDetailsModal';
import ToolCallResultCard from './ToolCallResultCard';

const ChannelCard: React.FC<{ channel: Channel; onViewHistory: (channel: Channel) => void; onShowDetails: (channel: Channel) => void; }> = ({ channel, onViewHistory, onShowDetails }) => (
  <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5 flex items-center justify-between w-full">
    <div className="flex items-center gap-5">
      <div className="bg-blue-600 rounded-lg p-3 text-white">
        <Icon className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></Icon>
      </div>
      <div>
        <h3 className="text-lg font-bold text-slate-800">{channel.name}</h3>
        <p className="text-slate-500 capitalize text-sm">{channel.type}</p>
      </div>
    </div>
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="text-slate-600 text-sm font-medium">Status:</span>
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">{channel.status}</span>
      </div>
      <button onClick={() => onViewHistory(channel)} className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition shadow-sm">
        Historique des conversations
      </button>
      <button onClick={() => onShowDetails(channel)} className="px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50 font-semibold transition">
        Détails
      </button>
    </div>
  </div>
);

const ChannelInboxView: React.FC<{ channel: Channel; conversations: Conversation[]; onBack: () => void; }> = ({ channel, conversations, onBack }) => {
    const { clients, setConversations, conversations: allConversations } = useAppContext();
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(conversations.length > 0 ? conversations[0].id : null);
    const [replyText, setReplyText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const [isAtBottom, setIsAtBottom] = useState(true);

    const selectedConversation = conversations.find(c => c.id === selectedConversationId);

    useEffect(() => {
        if (isAtBottom) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [selectedConversation?.messages, isAtBottom]);

    const handleScroll = () => {
        if (messagesContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
            // Check if scrolled to bottom (within a small tolerance)
            setIsAtBottom(scrollHeight - scrollTop <= clientHeight + 1);
        }
    };



    const handleSelectConversation = (id: string) => {
        setSelectedConversationId(id);
        setConversations(convos => convos.map(c => c.id === id ? {...c, unread: false} : c));
        setIsAtBottom(true); // Reset to true when a new conversation is selected
    };

    const handleSendReply = async () => {
        if (!replyText.trim() || !selectedConversationId) return;

        const tempMessage: Message = { id: Date.now().toString(), sender: 'user', text: replyText, timestamp: new Date().toISOString(), isAI: false };
        
        // Optimistic UI update
        const originalConversations = allConversations;
        setConversations(prev => prev.map(convo => convo.id === selectedConversationId ? { ...convo, messages: [...convo.messages, tempMessage] } : convo));
        
        const messageToSend = replyText;
        setReplyText('');

        try {
             const response = await fetch(`http://localhost:5001/api/conversations/${selectedConversationId}/reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: messageToSend }),
            });

            if (!response.ok) throw new Error('Failed to send reply');
            const updatedConversation = await response.json();

            // Replace optimistic update with actual data from server
            setConversations(prev => prev.map(convo => convo.id === updatedConversation.id ? updatedConversation : convo));
        } catch (error) {
            console.error("Failed to send reply:", error);
            // Revert on error
            setConversations(originalConversations);
            alert("Failed to send message. Please try again.");
        }
    };
    
    const ChannelIcon: React.FC<{ channel: CommunicationChannel }> = ({ channel: commChannel }) => {
        switch(commChannel) {
            case CommunicationChannel.WhatsApp: return <Icon className="w-5 h-5 text-green-500"><path d="M16.14 14.73C16.14 14.73 15.2 15.17 14.91 15.31C14.62 15.45 13.91 15.89 13.43 16.17C13.06 16.4 12.72 16.45 12.43 16.36C12.14 16.26 11.2 15.93 10.13 14.98C8.75 13.74 8.04 12.27 7.85 11.93C7.66 11.59 7.89 11.37 8.08 11.18C8.25 11.01 8.44 10.77 8.61 10.55C8.72 10.41 8.77 10.27 8.67 10.08C8.58 9.89 8.1 8.79 7.89 8.27C7.68 7.75 7.47 7.8 7.32 7.79C7.17 7.79 6.96 7.79 6.75 7.79C6.54 7.79 6.21 7.84 5.92 8.12C5.63 8.4 4.97 9.01 4.97 10.13C4.97 11.25 5.92 12.32 6.07 12.51C6.21 12.7 7.55 14.93 9.75 15.78C11.95 16.62 12.43 16.43 12.8 16.38C13.18 16.34 14.08 15.8 14.32 15.51C14.56 15.22 14.56 14.98 14.51 14.88C14.47 14.78 14.32 14.73 14.08 14.64M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z"/></Icon>;
            case CommunicationChannel.Telegram: return <Icon className="w-5 h-5 text-blue-500"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.6 5.8-1.5 6.9c-.2 1-1.3 1.2-2 .5l-2.2-1.6-1 1c-.1.1-.3.3-.5.3s-.3-.1-.5-.3l-1.1-1.1c-.2-.2-.2-.5 0-.7l6.3-5.8c.4-.3.9 0 .5.4z"/></Icon>;
            default: return null;
        }
    };

    return (
        <div className="p-8 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full transition" aria-label="Go back to channels">
                        <Icon className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></Icon>
                    </button>
                    <h1 className="text-3xl font-bold text-slate-800">Conversation History: {channel.name}</h1>
                </div>
            </div>
            <div className="flex-1 flex bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="w-1/3 border-r border-slate-200 overflow-y-auto">
                    {conversations.map(convo => {
                        const client = clients.find(c => c.id === convo.clientId);
                        const lastMessage = convo.messages[convo.messages.length - 1];
                        return (
                        <div key={convo.id} onClick={() => handleSelectConversation(convo.id)} className={`p-4 cursor-pointer border-l-4 ${selectedConversationId === convo.id ? 'bg-slate-100 border-indigo-500' : 'border-transparent hover:bg-slate-50'}`}>
                            <div className="flex justify-between items-center">
                                <h3 className="font-semibold">{client?.name || 'Unknown'}</h3>
                                {convo.unread && <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full"></span>}
                            </div>
                            <div className="flex items-center text-sm text-slate-500 mt-1">
                                <ChannelIcon channel={convo.channel} />
                                <span className="ml-2 truncate">{lastMessage?.text}</span>
                            </div>
                        </div>
                    )})}
                </div>
                <div className="w-2/3 flex flex-col">
                    {selectedConversation ? (
                        <>
                        <div className="p-4 border-b border-slate-200"><h2 className="font-bold text-lg">{clients.find(c=>c.id === selectedConversation.clientId)?.name}</h2></div>
                        <div ref={messagesContainerRef} onScroll={handleScroll} className="flex-1 p-6 overflow-y-auto bg-slate-50">
                            <div className="space-y-4">
                                {selectedConversation.messages.map(msg => (
                                    <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                                        {msg.sender === 'client' && <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0"></div>}
                                        <div className={`max-w-md p-3 rounded-lg ${msg.isAI ? 'bg-purple-500 text-white' : (msg.sender === 'client' ? 'bg-white shadow-sm' : '')}`}>
                                            <p>{msg.text}</p>
                                            {msg.isAI && msg.toolCallResult && (
                                                <ToolCallResultCard toolCall={msg.toolCallResult} />
                                            )}
                                            <p className={`text-xs mt-1 ${msg.isAI ? 'text-purple-200' : 'text-slate-400'}`}>{format(new Date(msg.timestamp), 'p')}{msg.isAI && <span className="font-bold ml-2">(AI)</span>}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div ref={messagesEndRef} />
                        </div>

                        </>
                    ) : (
                        <div className="flex-1 flex justify-center items-center text-slate-500"><p>Select a conversation to view messages.</p></div>
                    )}
                </div>
            </div>
        </div>
    );
};

const CommunicationView: React.FC = () => {
    const { channels, conversations } = useAppContext();
    const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
    const [editingChannel, setEditingChannel] = useState<Channel | null>(null);

    if (selectedChannel) {
        const filteredConversations = conversations.filter(c => c.channel.toLowerCase() === selectedChannel.type.toLowerCase());
        return <ChannelInboxView channel={selectedChannel} conversations={filteredConversations} onBack={() => setSelectedChannel(null)} />;
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-2">
                <h1 className="text-3xl font-bold text-slate-800">Canaux d'acquisition</h1>
                <p className="text-sm text-slate-500">Home &gt; Canaux d'acquisition</p>
            </div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-slate-700">Canaux d'acquisition</h2>
                <div className="flex items-center gap-2">
                  <label htmlFor="type-filter" className="text-sm font-medium text-slate-600">Filtrer par type:</label>
                  <select id="type-filter" className="border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:ring-indigo-500 focus:border-indigo-500">
                    <option>Tous les types</option>
                    {/* In a real app with more channel types, they would be listed here */}
                    <option>WhatsApp</option>
                  </select>
                </div>
            </div>

            <div className="space-y-4">
                {channels.map(channel => (
                    <ChannelCard 
                        key={channel.id} 
                        channel={channel} 
                        onViewHistory={setSelectedChannel}
                        onShowDetails={setEditingChannel}
                    />
                ))}
                {channels.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
                        <p className="text-slate-500">No acquisition channels found.</p>
                        <p className="text-sm text-slate-400 mt-2">Go to "Canaux d'acquisition" to add a new channel.</p>
                    </div>
                )}
            </div>
            
            <ChannelDetailsModal 
                channel={editingChannel}
                onClose={() => setEditingChannel(null)}
            />
        </div>
    );
};

export default CommunicationView;