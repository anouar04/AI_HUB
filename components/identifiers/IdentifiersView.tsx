
import React, { useState } from 'react';
import Header from '../Header';
import { useAppContext } from '../../context/AppContext';
import { Icon } from '../icons/Icon';
import type { Identifier } from '../../types';
import AddIdentifierForm from './AddIdentifierForm';
import IdentifierDetailsModal from './IdentifierDetailsModal';
import ConfirmDeleteModal from '../ConfirmDeleteModal';

// Identifier Card Component
const IdentifierCard: React.FC<{ identifier: Identifier; onShowDetails: (identifier: Identifier) => void; onDelete: (identifierId: string) => void; }> = ({ identifier, onShowDetails, onDelete }) => {
    const isActive = identifier.status === 'Active';
    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 flex flex-col justify-between w-full max-w-sm">
            {/* Top Section */}
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-bold text-slate-800">{identifier.name}</h3>
                    <span className="text-sm bg-blue-100 text-blue-800 font-medium px-2 py-0.5 rounded-full">{identifier.tag}</span>
                    <p className="text-sm text-slate-500 mt-2">Type n8n: {identifier.n8nType}</p>
                    <p className="text-sm text-slate-500">ID: {identifier.id}</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500' : 'bg-slate-400'}`}></div>
            </div>

            {/* Middle Section */}
            <div className="flex flex-col items-center my-6">
                 <div className="bg-blue-600 rounded-full p-4 text-white">
                    <Icon className="w-12 h-12">
                       <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 1.252-1.008 2.25-2.25 2.25S5.25 11.002 5.25 9.75s1.008-2.25 2.25-2.25 2.25 1.008 2.25 2.25z" />
                    </Icon>
                </div>
                <div className={`inline-flex items-center px-3 py-1 mt-4 rounded-full text-sm font-semibold ${
                    isActive ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                }`}>
                    <span className={`w-2.5 h-2.5 rounded-full mr-2 ${isActive ? 'bg-green-500' : 'bg-slate-500'}`}></span>
                    {isActive ? 'Actif' : 'Inactif'}
                </div>
            </div>

            {/* Bottom Section */}
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => onShowDetails(identifier)}
                    className="flex-1 text-center bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-2 px-4 rounded-md transition"
                >
                    Informations
                </button>
                <button onClick={() => onDelete(identifier.id)} className="p-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-md transition" aria-label="Delete Identifier">
                    <Icon className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m-3.232 0l.346 9M5.25 6H18.75m-13.5 0a1.5 1.5 0 011.5-1.5h9a1.5 1.5 0 011.5 1.5v1.5a1.5 1.5 0 01-1.5 1.5h-9a1.5 1.5 0 01-1.5-1.5V6z" /></Icon>
                </button>
            </div>
        </div>
    );
};


const IdentifiersView: React.FC = () => {
    const { identifiers, deleteIdentifier } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedIdentifier, setSelectedIdentifier] = useState<Identifier | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [identifierToDelete, setIdentifierToDelete] = useState<Identifier | null>(null);

    const handleDeleteRequest = (identifierId: string) => {
        const identifier = identifiers.find(id => id.id === identifierId);
        if (identifier) {
            setIdentifierToDelete(identifier);
            setIsDeleteModalOpen(true);
        }
    };

    const handleConfirmDelete = () => {
        if (identifierToDelete) {
            deleteIdentifier(identifierToDelete.id);
            setIdentifierToDelete(null);
            setIsDeleteModalOpen(false);
        }
    };

    return (
        <div className="p-8">
            <Header title="Gestion des identifiants" />
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-slate-700">Identifiants du locataire</h2>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-sm"
                >
                    + Nouvel identifiant
                </button>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {identifiers.map(identifier => (
                    <IdentifierCard 
                        key={identifier.id} 
                        identifier={identifier} 
                        onShowDetails={setSelectedIdentifier}
                        onDelete={handleDeleteRequest}
                    />
                ))}
                 {identifiers.length === 0 && (
                    <p className="text-slate-500 col-span-full">No identifiers have been set up yet.</p>
                )}
            </div>
            <AddIdentifierForm isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            <IdentifierDetailsModal
                identifier={selectedIdentifier}
                onClose={() => setSelectedIdentifier(null)}
            />
            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Identifier"
                message={`Are you sure you want to delete the identifier "${identifierToDelete?.name}"? This action cannot be undone.`}
            />
        </div>
    );
};

export default IdentifiersView;
