
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { AppointmentStatus } from '../../types';

interface AddAppointmentFormProps {
    isOpen: boolean;
    onClose: () => void;
}

const AddAppointmentForm: React.FC<AddAppointmentFormProps> = ({ isOpen, onClose }) => {
    const { clients, addAppointment } = useAppContext();
    const [title, setTitle] = useState('');
    const [clientId, setClientId] = useState('');
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');
    const [status, setStatus] = useState<AppointmentStatus>(AppointmentStatus.Confirmed);

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
        setTitle('');
        setClientId('');
        setStart('');
        setEnd('');
        setStatus(AppointmentStatus.Confirmed);
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !clientId || !start || !end) {
            alert('Please fill out all required fields.');
            return;
        }

        addAppointment({
            title,
            clientId,
            start: new Date(start).toISOString(),
            end: new Date(end).toISOString(),
            status,
        });
        
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
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Add New Appointment</h2>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="add-title" className="block text-sm font-medium text-slate-600 mb-1">Title</label>
                            <input
                                type="text"
                                id="add-title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="add-client" className="block text-sm font-medium text-slate-600 mb-1">Client</label>
                            <select
                                id="add-client"
                                value={clientId}
                                onChange={(e) => setClientId(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                required
                            >
                                <option value="" disabled>Select a client</option>
                                {clients.map(client => (
                                    <option key={client.id} value={client.id}>{client.name}</option>
                                ))}
                            </select>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="add-start" className="block text-sm font-medium text-slate-600 mb-1">Start Time</label>
                                <input
                                    type="datetime-local"
                                    id="add-start"
                                    value={start}
                                    onChange={(e) => setStart(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="add-end" className="block text-sm font-medium text-slate-600 mb-1">End Time</label>
                                <input
                                    type="datetime-local"
                                    id="add-end"
                                    value={end}
                                    onChange={(e) => setEnd(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    required
                                />
                            </div>
                        </div>
                         <div>
                            <label htmlFor="add-status" className="block text-sm font-medium text-slate-600 mb-1">Status</label>
                            <select
                                id="add-status"
                                value={status}
                                onChange={(e) => setStatus(e.target.value as AppointmentStatus)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                required
                            >
                                {Object.values(AppointmentStatus).map(s => (
                                     <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
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
                            Save Appointment
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddAppointmentForm;