
import React, { useState } from 'react';
import Header from '../Header';
import { useAppContext } from '../../context/AppContext';
import { Icon } from '../icons/Icon';
import type { Channel } from '../../types';
import AddChannelForm from './AddChannelForm';
import ChannelDetailsModal from './ChannelDetailsModal';
import ConfirmDeleteModal from '../ConfirmDeleteModal';

// A toggle switch component that matches the design
const ToggleSwitch: React.FC<{ checked: boolean; onChange: () => void; }> = ({ checked, onChange }) => (
    <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
        <div className="w-14 h-8 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500"></div>
    </label>
);


// Channel Card Component
const ChannelCard: React.FC<{
    channel: Channel;
    onShowDetails: (channel: Channel) => void;
    onDelete: (channelId: string) => void;
}> = ({ channel, onShowDetails, onDelete }) => {
    // In a real app, this would likely call a context function to update the channel
    const { updateChannel } = useAppContext();

    const handleToggle = async () => {
        const newEnabledState = !channel.enabled;
        await updateChannel({ ...channel, enabled: newEnabledState, status: newEnabledState ? 'Active' : 'Inactive' });
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 flex flex-col justify-between w-full max-w-sm">
            {/* Top Section */}
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-bold text-slate-800">{channel.name}</h3>
                    <span className="text-sm bg-blue-100 text-blue-800 font-medium px-2 py-0.5 rounded-full capitalize">{channel.type}</span>
                    <p className="text-sm text-slate-500 mt-2">ID externe: {channel.externalId}</p>
                </div>
                <ToggleSwitch checked={channel.enabled} onChange={handleToggle} />
            </div>

            {/* Middle Section */}
            <div className="flex flex-col items-center my-6">
                 <div className="bg-blue-600 rounded-full p-4 text-white">
                    <Icon className="w-12 h-12">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </Icon>
                </div>
                <div className={`inline-flex items-center px-3 py-1 mt-4 rounded-full text-sm font-semibold ${
                    channel.enabled ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                }`}>
                    <span className={`w-2.5 h-2.5 rounded-full mr-2 ${channel.enabled ? 'bg-green-500' : 'bg-slate-500'}`}></span>
                    {channel.enabled ? 'Actif' : 'Inactif'}
                </div>
            </div>


            {/* Bottom Section */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onShowDetails(channel)}
                    className="flex-1 text-center bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-2 px-4 rounded-md transition">
                    Détails
                </button>
                <button
                    onClick={() => onDelete(channel.id)}
                    className="p-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-md transition" aria-label="Delete Channel">
                    <Icon className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m-3.232 0l.346 9M5.25 6H18.75m-13.5 0a1.5 1.5 0 011.5-1.5h9a1.5 1.5 0 011.5 1.5v1.5a1.5 1.5 0 01-1.5 1.5h-9a1.5 1.5 0 01-1.5-1.5V6z" /></Icon>
                </button>
            </div>
        </div>
    );
};


const AcquisitionChannelsView: React.FC = () => {
    const { channels, deleteChannel } = useAppContext();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
    const [channelToDelete, setChannelToDelete] = useState<Channel | null>(null);

    const handleDeleteRequest = (channelId: string) => {
        const channel = channels.find(ch => ch.id === channelId);
        if (channel) {
            setChannelToDelete(channel);
        }
    };

    const handleConfirmDelete = () => {
        if (channelToDelete) {
            deleteChannel(channelToDelete.id);
            setChannelToDelete(null);
        }
    };

    return (
        <div className="p-8">
            <Header title="Gestion des canaux" />
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-slate-700">Canaux d'acquisition</h2>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-sm"
                >
                    + Nouveau canal
                </button>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {channels.map(channel => (
                    <ChannelCard
                        key={channel.id}
                        channel={channel}
                        onShowDetails={setEditingChannel}
                        onDelete={handleDeleteRequest}
                    />
                ))}
                 {channels.length === 0 && (
                    <p className="text-slate-500 col-span-full">No acquisition channels have been set up yet.</p>
                )}
            </div>
            <AddChannelForm isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
            <ChannelDetailsModal
                channel={editingChannel}
                onClose={() => setEditingChannel(null)}
            />
            <ConfirmDeleteModal
                isOpen={!!channelToDelete}
                onClose={() => setChannelToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Delete Channel"
                message={`Are you sure you want to delete the channel "${channelToDelete?.name}"? This action cannot be undone.`}
            />
        </div>
    );
};

export default AcquisitionChannelsView;