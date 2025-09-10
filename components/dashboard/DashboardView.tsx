
import React from 'react';
import Header from '../Header';
import StatCard from './StatCard';
import ClientGrowthChart from './ClientGrowthChart';
import { useAppContext } from '../../context/AppContext';
import { Icon } from '../icons/Icon';
import type { Appointment } from '../../types';
import { AppointmentStatus } from '../../types';
import { format, isToday, compareAsc } from 'date-fns';

const DashboardView: React.FC = () => {
    const { clients, appointments, conversations, notifications } = useAppContext();

    const appointmentsToday = appointments.filter(app => isToday(new Date(app.start)));
    const activeConversations = conversations.filter(c => c.unread).length;
    const unreadNotifications = notifications.filter(n => !n.read).length;
    
    const getStatusClass = (status: AppointmentStatus) => {
        switch (status) {
            case AppointmentStatus.Confirmed: return 'bg-blue-100 text-blue-800';
            case AppointmentStatus.InProgress: return 'bg-purple-100 text-purple-800';
            case AppointmentStatus.Treated: return 'bg-green-100 text-green-800';
            case AppointmentStatus.Postponed: return 'bg-orange-100 text-orange-800';
            case AppointmentStatus.Canceled: return 'bg-red-100 text-red-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    return (
        <div className="p-8">
            <Header title="Dashboard" />
            
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Total Clients" value={clients.length.toString()} icon={<path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />} />
                <StatCard title="Appointments Today" value={appointmentsToday.length.toString()} icon={<path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18" />} />
                <StatCard title="Active Conversations" value={activeConversations.toString()} icon={<path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />} />
                <StatCard title="Alerts" value={unreadNotifications.toString()} icon={<path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Client Growth Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-xl font-semibold mb-4">Client Growth</h2>
                    <ClientGrowthChart clients={clients} />
                </div>

                {/* Today's Appointments */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-xl font-semibold mb-4">Today's Appointments</h2>
                    <div className="space-y-4">
                        {appointmentsToday.length > 0 ? (
                            appointmentsToday
                                .sort((a,b) => compareAsc(new Date(a.start), new Date(b.start)))
                                .map((appt: Appointment) => {
                                const client = clients.find(c => c.id === appt.clientId);
                                return (
                                <div key={appt.id} className="flex items-center">
                                    <div className="flex-1">
                                        <p className="font-semibold">{appt.title}</p>
                                        <p className="text-sm text-slate-500">{client?.name || 'Unknown Client'}</p>
                                        <p className="text-sm text-slate-500">{format(new Date(appt.start), 'p')} - {format(new Date(appt.end), 'p')}</p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(appt.status)}`}>
                                        {appt.status}
                                    </span>
                                </div>
                            )})
                        ) : (
                            <p className="text-slate-500">No appointments scheduled for today.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardView;