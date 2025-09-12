
import React from 'react';
import type { ToolCallResult } from '../../types';
import { Icon } from '../icons/Icon';
// Fix: Import date-fns functions from the main package to resolve call signature errors.
import { format, parseISO } from 'date-fns';

interface ToolCallResultCardProps {
    toolCall: ToolCallResult;
}

const AppointmentResult: React.FC<{ args: any }> = ({ args }) => {
    const { title, date, time } = args;
    let formattedDateTime = 'Invalid date';
    try {
        formattedDateTime = format(parseISO(`${date}T${time}`), "MMM d, yyyy 'at' p");
    } catch (e) {
        console.error("Could not parse date/time from tool call:", date, time);
    }
    
    return (
        <>
            <div className="flex items-center mb-2">
                <Icon className="w-5 h-5 text-indigo-200 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18" /></Icon>
                <h4 className="font-semibold text-white">Appointment Booked</h4>
            </div>
            <div className="text-sm text-indigo-100 space-y-1 pl-7">
                <p><span className="font-medium">Title:</span> {title}</p>
                <p><span className="font-medium">When:</span> {formattedDateTime}</p>
            </div>
        </>
    );
};

const ClientUpdateResult: React.FC<{ args: any }> = ({ args }) => {
    const { name, email } = args;
    return (
        <>
            <div className="flex items-center mb-2">
                <Icon className="w-5 h-5 text-indigo-200 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.101a6.375 6.375 0 015.34-4.649M2.25 12c0-5.03 4.403-9 9.75-9s9.75 3.97 9.75 9c0 5.03-4.403 9-9.75 9s-9.75-3.97-9.75-9z" /></Icon>
                <h4 className="font-semibold text-white">Client Info Updated</h4>
            </div>
            <div className="text-sm text-indigo-100 space-y-1 pl-7">
                <p><span className="font-medium">Name:</span> {name}</p>
                {email && <p><span className="font-medium">Email:</span> {email}</p>}
            </div>
        </>
    );
};

const ToolCallResultCard: React.FC<ToolCallResultCardProps> = ({ toolCall }) => {
    const renderResult = () => {
        switch (toolCall.toolName) {
            case 'bookAppointment':
                return <AppointmentResult args={toolCall.toolArgs} />;
            case 'createOrUpdateClient':
                return <ClientUpdateResult args={toolCall.toolArgs} />;
            default:
                return null;
        }
    };

    return (
        <div className="border-t border-indigo-400/50 pt-3 mt-3">
            {renderResult()}
        </div>
    );
};

export default ToolCallResultCard;