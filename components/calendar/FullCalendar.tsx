import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Appointment, AppointmentStatus } from '../../types';
// Fix: Corrected date-fns imports by using specific paths for functions.
import {
    format,
    endOfMonth,
    eachDayOfInterval,
    endOfWeek,
    isSameMonth,
    isToday,
    addMonths,
} from 'date-fns';
import startOfMonth from 'date-fns/startOfMonth';
import startOfWeek from 'date-fns/startOfWeek';
import subMonths from 'date-fns/subMonths';
import parseISO from 'date-fns/parseISO';
import { Icon } from '../icons/Icon';

interface FullCalendarProps {
    onAddAppointment: () => void;
    onEditAppointment: (appointment: Appointment) => void;
}

const WeekView: React.FC<{
    currentDate: Date;
    appointmentsByDate: Record<string, Appointment[]>;
    onEditAppointment: (appointment: Appointment) => void;
}> = ({ currentDate, appointmentsByDate, onEditAppointment }) => {
    const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const daysInWeek = eachDayOfInterval({
        start: startOfWeek(currentDate),
        end: endOfWeek(currentDate)
    });

    const getStatusColor = (status: AppointmentStatus) => {
        switch (status) {
            case AppointmentStatus.Confirmed: return 'bg-blue-500';
            case AppointmentStatus.InProgress: return 'bg-purple-500';
            case AppointmentStatus.Treated: return 'bg-green-500';
            case AppointmentStatus.Postponed: return 'bg-orange-500';
            case AppointmentStatus.Canceled: return 'bg-red-500';
            default: return 'bg-slate-500';
        }
    }

    const { clients } = useAppContext();


    return (
        <div className="grid grid-cols-7 flex-1">
            {/* Day Headers */}
            {weekDays.map(day => (
                <div key={day} className="text-center font-semibold text-sm text-slate-500 py-3 border-b border-slate-200">
                    {day}
                </div>
            ))}

            {/* Day Cells */}
            {daysInWeek.map(day => {
                const isCurrentDay = isToday(day);
                const dayKey = format(day, 'yyyy-MM-dd');
                const dayAppointments = appointmentsByDate[dayKey] || [];

                return (
                    <div key={day.toString()} className={`border-r border-b border-slate-200 p-2 flex flex-col`}>
                        <span className={`self-start text-sm font-medium mb-2 text-slate-700 ${isCurrentDay ? 'bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center' : 'p-1'}`}>
                            {format(day, 'd')}
                        </span>
                        <div className="flex-1 space-y-1 overflow-y-auto max-h-72">
                            {dayAppointments.map(appt => {
                                const client = clients.find(c => c.id === appt.clientId);
                                return (
                                    <button
                                        key={appt.id}
                                        onClick={() => onEditAppointment(appt)}
                                        className={`w-full text-left p-1.5 rounded-md text-white text-xs ${getStatusColor(appt.status)}`}
                                    >
                                        <p className="font-semibold truncate">{appt.title}</p>
                                        <p className="opacity-80">{client?.name}</p>
                                        <p className="opacity-80 font-bold">{format(parseISO(appt.start), 'HH:mm')}</p>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const DayView: React.FC<{
    currentDate: Date;
    appointmentsByDate: Record<string, Appointment[]>;
    onEditAppointment: (appointment: Appointment) => void;
}> = ({ currentDate, appointmentsByDate, onEditAppointment }) => {
    const dayKey = format(currentDate, 'yyyy-MM-dd');
    const dayAppointments = appointmentsByDate[dayKey] || [];

    const getStatusColor = (status: AppointmentStatus) => {
        switch (status) {
            case AppointmentStatus.Confirmed: return 'bg-blue-500';
            case AppointmentStatus.InProgress: return 'bg-purple-500';
            case AppointmentStatus.Treated: return 'bg-green-500';
            case AppointmentStatus.Postponed: return 'bg-orange-500';
            case AppointmentStatus.Canceled: return 'bg-red-500';
            default: return 'bg-slate-500';
        }
    }

    const { clients } = useAppContext();

    return (
        <div className="flex-1 p-4 flex flex-col">
            <h3 className="text-lg font-semibold mb-4">{format(currentDate, 'EEEE, MMMM d, yyyy')}</h3>
            <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            
                {dayAppointments.map(appt => {
                    const client = clients.find(c => c.id === appt.clientId);
                    return (
                        <button
                            key={appt.id}
                            onClick={() => onEditAppointment(appt)}
                            className={`flex-shrink-0 text-left p-1 rounded-md text-white h-18 overflow-hidden ${getStatusColor(appt.status)}`}
                        >
                            <p className="font-semibold">{appt.title}</p>
                            <p className="text-sm">{client?.name}</p>
                            <p className="text-sm font-bold">{format(parseISO(appt.start), 'HH:mm')} - {format(parseISO(appt.end), 'HH:mm')}</p>
                        </button>
                    )
                })}
                {dayAppointments.length === 0 && (
                    <p className="text-slate-500">No appointments for this day.</p>
                )}
            </div>
        </div>
    );
};

export default function FullCalendar({ onAddAppointment, onEditAppointment }: FullCalendarProps) {
    const { appointments, clients } = useAppContext();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<'month' | 'week' | 'day'>('month');

    const firstDayOfMonth = startOfMonth(currentDate);
    const lastDayOfMonth = endOfMonth(currentDate);

    const daysInMonth = eachDayOfInterval({
        start: startOfWeek(firstDayOfMonth),
        end: endOfWeek(lastDayOfMonth)
    });

    const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const goToPrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    
    const getStatusColor = (status: AppointmentStatus) => {
        switch (status) {
            case AppointmentStatus.Confirmed: return 'bg-blue-500';
            case AppointmentStatus.InProgress: return 'bg-purple-500';
            case AppointmentStatus.Treated: return 'bg-green-500';
            case AppointmentStatus.Postponed: return 'bg-orange-500';
            case AppointmentStatus.Canceled: return 'bg-red-500';
            default: return 'bg-slate-500';
        }
    }
    
    const appointmentsByDate = useMemo(() => {
        const grouped = appointments.reduce((acc, appt) => {
            const dateKey = format(parseISO(appt.start), 'yyyy-MM-dd');
            if(!acc[dateKey]) acc[dateKey] = [];
            acc[dateKey].push(appt);
            return acc;
        }, {} as Record<string, Appointment[]>);

        // Sort appointments within each day
        for (const dateKey in grouped) {
            grouped[dateKey].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
        }

        return grouped;
    }, [appointments]);

    const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    return (
        <div className="flex flex-col h-full">
            {/* Calendar Header */}
            <div className="flex justify-between items-center p-4 border-b border-slate-200">
                <div className="flex items-center gap-4">
                    <button onClick={goToPrevMonth} className="p-1 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100">
                        <Icon className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></Icon>
                    </button>
                    <button onClick={goToNextMonth} className="p-1 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100">
                        <Icon className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></Icon>
                    </button>
                    <button 
                        onClick={onAddAppointment}
                        className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-sm text-sm"
                    >
                        Nouveau rendez-vous +
                    </button>
                </div>
                <h2 className="text-xl font-semibold text-slate-800">
                    {format(currentDate, 'MMMM yyyy')}
                </h2>
                <div className="flex items-center bg-slate-100 rounded-lg p-1 text-sm font-semibold">
                    <button onClick={() => setView('month')} className={`px-3 py-1 rounded-md shadow-sm ${view === 'month' ? 'bg-white text-slate-800' : 'text-slate-500'}`}>month</button>
                    <button onClick={() => setView('week')} className={`px-3 py-1 rounded-md shadow-sm ${view === 'week' ? 'bg-white text-slate-800' : 'text-slate-500'}`}>week</button>
                    <button onClick={() => setView('day')} className={`px-3 py-1 rounded-md shadow-sm ${view === 'day' ? 'bg-white text-slate-800' : 'text-slate-500'}`}>day</button>
                </div>
            </div>

                        {/* Calendar Grid */}

            {view === 'month' && (
                <div className="grid grid-cols-7 flex-1">
                    {/* Day Headers */}
                    {weekDays.map(day => (
                        <div key={day} className="text-center font-semibold text-sm text-slate-500 py-3 border-b border-slate-200">
                            {day}
                        </div>
                    ))}

                    {/* Day Cells */}
                    {daysInMonth.map(day => {
                        const isCurrentMonth = isSameMonth(day, currentDate);
                        const isCurrentDay = isToday(day);
                        const dayKey = format(day, 'yyyy-MM-dd');
                        const dayAppointments = appointmentsByDate[dayKey] || [];

                        return (
                            <div key={day.toString()} className={`border-r border-b border-slate-200 p-2 flex flex-col ${isCurrentMonth ? '' : 'bg-slate-50'}`}>
                                <span className={`self-start text-sm font-medium mb-2 text-slate-700 ${isCurrentDay ? 'bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center' : 'p-1'}`}>
                                    {format(day, 'd')}
                                </span>
                                <div className="flex-1 space-y-1 overflow-y-auto max-h-72">
                                    {dayAppointments.map(appt => {
                                        const client = clients.find(c => c.id === appt.clientId);
                                        return (
                                            <button
                                                key={appt.id}
                                                onClick={() => onEditAppointment(appt)}
                                                className={`w-full text-left p-1.5 rounded-md text-white text-xs ${getStatusColor(appt.status)}`}
                                            >
                                                <p className="font-semibold truncate">{appt.title}</p>
                                                <p className="opacity-80">{client?.name}</p>
                                                <p className="opacity-80 font-bold">{format(parseISO(appt.start), 'HH:mm')}</p>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            {view === 'week' && (
                <WeekView
                    currentDate={currentDate}
                    appointmentsByDate={appointmentsByDate}
                    onEditAppointment={onEditAppointment}
                />
            )}
            {view === 'day' && (
                <DayView
                    currentDate={currentDate}
                    appointmentsByDate={appointmentsByDate}
                    onEditAppointment={onEditAppointment}
                />
            )}
        </div>
    );
}