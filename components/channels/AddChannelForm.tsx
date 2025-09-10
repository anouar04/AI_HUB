
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { ChannelType } from '../../types';

interface AddChannelFormProps {
    isOpen: boolean;
    onClose: () => void;
}

const AddChannelForm: React.FC<AddChannelFormProps> = ({ isOpen, onClose }) => {
    const { addChannel } = useAppContext();
    const [name, setName] = useState('');
    const [type, setType] = useState<ChannelType>(ChannelType.WhatsApp);
    const [externalId, setExternalId] = useState('');
    const [enabled, setEnabled] = useState(true);

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
           if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
     }, [onClose]);

    if (!isOpen) return null;

    const clearForm = () => {
        setName('');
        setType(ChannelType.WhatsApp);
        setExternalId('');
        setEnabled(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !externalId.trim()) {
            alert('Please fill out all fields.');
            return;
        }
        addChannel({ name, type, externalId, enabled });
        clearForm();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center" aria-modal="true" role="dialog">
            <div className="fixed inset-0" onClick={onClose} aria-hidden="true"></div>
            <div className="bg-white rounded-lg shadow-xl p-8 m-4 max-w-lg w-full z-50 transform transition-all">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Add New Channel</h2>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="channel-name" className="block text-sm font-medium text-slate-600 mb-1">Channel Name</label>
                            <input type="text" id="channel-name" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label htmlFor="channel-type" className="block text-sm font-medium text-slate-600 mb-1">Channel Type</label>
                                <select id="channel-type" value={type} onChange={(e) => setType(e.target.value as ChannelType)} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required>
                                    {Object.values(ChannelType).map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="channel-externalId" className="block text-sm font-medium text-slate-600 mb-1">External ID</label>
                                <input type="text" id="channel-externalId" value={externalId} onChange={(e) => setExternalId(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-2">Enabled</label>
                            <label htmlFor="enabled-toggle" className="flex items-center cursor-pointer">
                                <div className="relative">
                                    <input type="checkbox" id="enabled-toggle" className="sr-only" checked={enabled} onChange={() => setEnabled(!enabled)} />
                                    <div className="block bg-slate-200 w-14 h-8 rounded-full"></div>
                                    <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${enabled ? 'translate-x-full bg-indigo-600' : ''}`}></div>
                                </div>
                                <div className="ml-3 text-slate-700 font-medium">
                                    {enabled ? 'Active' : 'Inactive'}
                                </div>
                            </label>
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50 font-semibold transition">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition shadow-sm">Save Channel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddChannelForm;