
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import type { Client } from '../../types';

interface EditClientFormProps {
    client: Client | null;
    onClose: () => void;
}

const EditClientForm: React.FC<EditClientFormProps> = ({ client, onClose }) => {
    const { updateClient } = useAppContext();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (client) {
            setName(client.name);
            setEmail(client.email);
            setPhone(client.phone);
            setAddress(client.address);
            setNotes(client.notes);
        }
    }, [client]);
    
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


    if (!client) {
        return null;
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            alert('Client name is required.');
            return;
        }
        updateClient({ 
            ...client, 
            name, 
            email, 
            phone, 
            address, 
            notes 
        });
        onClose();
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center" 
            aria-modal="true" 
            role="dialog"
        >
            <div 
                className="fixed inset-0" 
                onClick={onClose}
                aria-hidden="true"
            ></div>
            <div className="bg-white rounded-lg shadow-xl p-8 m-4 max-w-lg w-full z-50 transform transition-all">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Edit Client</h2>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="edit-name" className="block text-sm font-medium text-slate-600 mb-1">Full Name</label>
                            <input
                                type="text"
                                id="edit-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="edit-email" className="block text-sm font-medium text-slate-600 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    id="edit-email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="edit-phone" className="block text-sm font-medium text-slate-600 mb-1">Phone Number</label>
                                <input
                                    type="tel"
                                    id="edit-phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="edit-address" className="block text-sm font-medium text-slate-600 mb-1">Address</label>
                            <input
                                type="text"
                                id="edit-address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                         <div>
                            <label htmlFor="edit-notes" className="block text-sm font-medium text-slate-600 mb-1">Notes</label>
                            <textarea
                                id="edit-notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50 font-semibold transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition shadow-sm"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditClientForm;
