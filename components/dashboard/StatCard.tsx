
import React from 'react';
import { Icon } from '../icons/Icon';

interface StatCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm flex items-center">
            <div className="p-3 bg-indigo-100 rounded-full mr-4 text-indigo-600">
                <Icon className="w-6 h-6">{icon}</Icon>
            </div>
            <div>
                <p className="text-sm text-slate-500 font-medium">{title}</p>
                <p className="text-2xl font-bold text-slate-800">{value}</p>
            </div>
        </div>
    );
}

export default StatCard;
