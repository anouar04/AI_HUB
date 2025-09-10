
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import type { Identifier } from '../../types';
import { Icon } from '../icons/Icon';

interface IdentifierDetailsModalProps {
    identifier: Identifier | null;
    onClose: () => void;
}

const IdentifierDetailsModal: React.FC<IdentifierDetailsModalProps> = ({ identifier, onClose }) => {
    const { updateIdentifier } = useAppContext();
    const [name, setName] = useState('');
    const [tag, setTag] = useState('');
    const [accessToken, setAccessToken] = useState('');
    const [businessAccountId, setBusinessAccountId] = useState('');
    const [n8nType, setN8nType] = useState('');
    const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');


    useEffect(() => {
        if (identifier) {
            setName(identifier.name);
            setTag(identifier.tag);
            setAccessToken(identifier.accessToken);
            setBusinessAccountId(identifier.businessAccountId);
            setN8nType(identifier.n8nType);
            setStatus(identifier.status);
        }
    }, [identifier]);

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
           if (event.key === 'Escape') {
              onClose();
           }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
           window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);

    if (!identifier) {
        return null;
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            alert("Name is required.");
            return;
        }
        updateIdentifier({
            ...identifier,
            name,
            tag,
            accessToken,
            businessAccountId,
            n8nType,
            status,
        });
        onClose();
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center backdrop-blur-sm" 
            aria-modal="true" 
            role="dialog"
        >
            <div 
                className="fixed inset-0" 
                onClick={onClose}
                aria-hidden="true"
            ></div>
            <div className="bg-white rounded-2xl shadow-xl p-8 m-4 max-w-md w-full z-50 transform transition-all relative">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">Informations</h2>
                    <button onClick={onClose} className="p-1 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100">
                        <Icon className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></Icon>
                    </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="edit-info-name" className="block text-sm font-medium text-slate-600 mb-1">Nom</label>
                            <input
                                type="text"
                                id="edit-info-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                         <div>
                            <label htmlFor="edit-info-tag" className="block text-sm font-medium text-slate-600 mb-1">Type d'identifiant (Tag)</label>
                            <input
                                type="text"
                                id="edit-info-tag"
                                value={tag}
                                onChange={(e) => setTag(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="edit-info-token" className="block text-sm font-medium text-slate-600 mb-1">accessToken</label>
                            <input
                                type="text"
                                id="edit-info-token"
                                value={accessToken}
                                onChange={(e) => setAccessToken(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="edit-info-account-id" className="block text-sm font-medium text-slate-600 mb-1">businessAccountId</label>
                            <input
                                type="text"
                                id="edit-info-account-id"
                                value={businessAccountId}
                                onChange={(e) => setBusinessAccountId(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 bg-slate-100 text-slate-800 border border-slate-200 rounded-lg hover:bg-slate-200 font-semibold transition"
                        >
                            Annuler
                        </button>
                         <button
                            type="submit"
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold transition shadow-sm"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default IdentifierDetailsModal;