
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';

interface AddIdentifierFormProps {
    isOpen: boolean;
    onClose: () => void;
}

const AddIdentifierForm: React.FC<AddIdentifierFormProps> = ({ isOpen, onClose }) => {
    const { addIdentifier } = useAppContext();
    const [name, setName] = useState('');
    const [tag, setTag] = useState('');
    const [n8nType, setN8nType] = useState('');
    const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
    
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

    if (!isOpen) {
        return null;
    }

    const clearForm = () => {
        setName('');
        setTag('');
        setN8nType('');
        setStatus('Active');
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !tag.trim() || !n8nType.trim()) {
            alert('Please fill out all fields.');
            return;
        }
        addIdentifier({ name, tag, n8nType, status });
        clearForm();
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
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Add New Identifier</h2>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="identifier-name" className="block text-sm font-medium text-slate-600 mb-1">Name</label>
                            <input
                                type="text"
                                id="identifier-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label htmlFor="identifier-tag" className="block text-sm font-medium text-slate-600 mb-1">Tag</label>
                                <input
                                    type="text"
                                    id="identifier-tag"
                                    value={tag}
                                    onChange={(e) => setTag(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="identifier-n8nType" className="block text-sm font-medium text-slate-600 mb-1">n8n Type</label>
                                <input
                                    type="text"
                                    id="identifier-n8nType"
                                    value={n8nType}
                                    onChange={(e) => setN8nType(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-2">Status</label>
                            <label htmlFor="status-toggle" className="flex items-center cursor-pointer">
                                <div className="relative">
                                    <input type="checkbox" id="status-toggle" className="sr-only" checked={status === 'Active'} onChange={() => setStatus(status === 'Active' ? 'Inactive' : 'Active')} />
                                    <div className="block bg-slate-200 w-14 h-8 rounded-full"></div>
                                    <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${status === 'Active' ? 'translate-x-full bg-indigo-600' : ''}`}></div>
                                </div>
                                <div className="ml-3 text-slate-700 font-medium">
                                    {status}
                                </div>
                            </label>
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
                            Save Identifier
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddIdentifierForm;