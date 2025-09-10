
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import type { Channel } from '../../types';
import { ChannelType } from '../../types';
import { Icon } from '../icons/Icon';

interface ChannelDetailsModalProps {
    channel: Channel | null;
    onClose: () => void;
}

const ChannelDetailsModal: React.FC<ChannelDetailsModalProps> = ({ channel, onClose }) => {
    const { updateChannel } = useAppContext();
    const [name, setName] = useState('');
    const [type, setType] = useState<ChannelType>(ChannelType.WhatsApp);
    const [externalId, setExternalId] = useState('');
    const [enabled, setEnabled] = useState(true);

    useEffect(() => {
        if (channel) {
            setName(channel.name);
            setType(channel.type);
            setExternalId(channel.externalId);
            setEnabled(channel.enabled);
        }
    }, [channel]);

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
           if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
     }, [onClose]);

    if (!channel) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !externalId.trim()) {
            alert('Please fill out all fields.');
            return;
        }
        updateChannel({
            ...channel,
            name,
            type,
            externalId,
            enabled,
            status: enabled ? 'Active' : 'Inactive'
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center backdrop-blur-sm" aria-modal="true" role="dialog">
            <div className="fixed inset-0" onClick={onClose} aria-hidden="true"></div>
            <div className="bg-white rounded-lg shadow-xl p-8 m-4 max-w-lg w-full z-50 transform transition-all">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">Détails du canal</h2>
                     <button onClick={onClose} className="p-1 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100">
                        <Icon className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></Icon>
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="edit-channel-name" className="block text-sm font-medium text-slate-600 mb-1">Nom du canal</label>
                            <input type="text" id="edit-channel-name" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label htmlFor="edit-channel-type" className="block text-sm font-medium text-slate-600 mb-1">Type de canal</label>
                                <select id="edit-channel-type" value={type} onChange={(e) => setType(e.target.value as ChannelType)} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required>
                                    {Object.values(ChannelType).map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="edit-channel-externalId" className="block text-sm font-medium text-slate-600 mb-1">ID Externe</label>
                                <input type="text" id="edit-channel-externalId" value={externalId} onChange={(e) => setExternalId(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-2">Activé</label>
                            <label htmlFor="edit-enabled-toggle" className="flex items-center cursor-pointer">
                                <div className="relative">
                                    <input type="checkbox" id="edit-enabled-toggle" className="sr-only" checked={enabled} onChange={() => setEnabled(!enabled)} />
                                    <div className="block bg-slate-200 w-14 h-8 rounded-full"></div>
                                    <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${enabled ? 'translate-x-full bg-indigo-600' : ''}`}></div>
                                </div>
                                <div className="ml-3 text-slate-700 font-medium">
                                    {enabled ? 'Actif' : 'Inactif'}
                                </div>
                            </label>
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50 font-semibold transition">Annuler</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition shadow-sm">Enregistrer les modifications</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChannelDetailsModal;