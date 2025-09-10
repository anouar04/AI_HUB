
import React, { useState } from 'react';
import Header from '../Header';
import { useAppContext } from '../../context/AppContext';
import { format } from 'date-fns';
import AddClientForm from './AddClientForm';
import EditClientForm from './EditClientForm';
import type { Client } from '../../types';

const ClientView: React.FC = () => {
    const { clients } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);

    return (
        <div className="p-8">
            <Header title="Clients">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition shadow-sm"
                >
                    Add New Client
                </button>
            </Header>
            <div className="mt-6 bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 text-sm font-semibold text-slate-600">Name</th>
                                <th className="px-6 py-3 text-sm font-semibold text-slate-600">Contact</th>
                                <th className="px-6 py-3 text-sm font-semibold text-slate-600">Joined</th>
                                <th className="px-6 py-3 text-sm font-semibold text-slate-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {clients.length > 0 ? (
                                clients.map(client => (
                                    <tr key={client.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <p className="font-medium text-slate-800">{client.name}</p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <p className="text-sm text-slate-600">{client.email}</p>
                                            <p className="text-sm text-slate-500">{client.phone}</p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {format(new Date(client.createdAt), 'MMM d, yyyy')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button onClick={() => setEditingClient(client)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="text-center py-12 text-slate-500">
                                        No clients found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <AddClientForm isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            <EditClientForm client={editingClient} onClose={() => setEditingClient(null)} />
        </div>
    );
};

export default ClientView;