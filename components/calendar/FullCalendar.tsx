
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

const FullCalendar: React.FC<FullCalendarProps> = ({ onAddAppointment, onEditAppointment }) => {
    const { appointments, clients } = useAppContext();
    const [currentDate, setCurrentDate] = useState(new Date());

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
        return appointments.reduce((acc, appt) => {
            const dateKey = format(parseISO(appt.start), 'yyyy-MM-dd');
            if(!acc[dateKey]) acc[dateKey] = [];
            acc[dateKey].push(appt);
            return acc;
        }, {} as Record<string, Appointment[]>);
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
                    <button className="px-3 py-1 bg-white rounded-md shadow-sm text-slate-800">month</button>
                    <button className="px-3 py-1 text-slate-500">week</button>
                    <button className="px-3 py-1 text-slate-500">day</button>
                </div>
            </div>

            {/* Calendar Grid */}
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
                            <span className={`self-start text-sm font-medium mb-2 ${isCurrentMonth ? 'text-slate-700' : 'text-slate-400'} ${isCurrentDay ? 'bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center' : 'p-1'}`}>
                                {format(day, 'd')}
                            </span>
                            <div className="flex-1 space-y-1 overflow-y-auto">
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
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default FullCalendar;
