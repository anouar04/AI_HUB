
import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import type { Appointment } from '../../types';
import { AppointmentStatus } from '../../types';
import EditAppointmentForm from './EditAppointmentForm';
import AddAppointmentForm from './AddAppointmentForm';
import FullCalendar from './FullCalendar';

const CalendarView: React.FC = () => {
    const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const handleEdit = (appointment: Appointment) => {
        setEditingAppointment(appointment);
    };

    const handleCloseModal = () => {
        setEditingAppointment(null);
    };

    const statusMap: { name: string; value: AppointmentStatus; color: string }[] = [
        { name: 'Rendez-vous confirmé', value: AppointmentStatus.Confirmed, color: 'bg-blue-500' },
        { name: 'En cours de traitement', value: AppointmentStatus.InProgress, color: 'bg-purple-500' },
        { name: 'Traité', value: AppointmentStatus.Treated, color: 'bg-green-500' },
        { name: 'Reporté', value: AppointmentStatus.Postponed, color: 'bg-orange-500' },
        { name: 'Annulé', value: AppointmentStatus.Canceled, color: 'bg-red-500' },
    ];

    return (
        <div className="p-8 h-full flex flex-col">
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-slate-700 mb-2">Statuts :</h2>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                    {statusMap.map(status => (
                        <div key={status.value} className="flex items-center">
                            <span className={`w-3 h-3 rounded-full mr-2 ${status.color}`}></span>
                            <span className="text-sm text-slate-600">{status.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex-1 bg-white rounded-lg shadow-sm overflow-hidden">
                <FullCalendar 
                    onAddAppointment={() => setIsAddModalOpen(true)}
                    onEditAppointment={handleEdit}
                />
            </div>

            <EditAppointmentForm 
                appointment={editingAppointment} 
                onClose={handleCloseModal} 
            />
            <AddAppointmentForm
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
            />
        </div>
    );
};

export default CalendarView;