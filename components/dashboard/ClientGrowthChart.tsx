
import React, { useMemo } from 'react';
import type { Client } from '../../types';
// Fix: Corrected date-fns imports by using specific paths for subMonths and startOfMonth.
import { format } from 'date-fns';
import subMonths from 'date-fns/subMonths';
import startOfMonth from 'date-fns/startOfMonth';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ClientGrowthChartProps {
    clients: Client[];
}

const ClientGrowthChart: React.FC<ClientGrowthChartProps> = ({ clients }) => {
    const data = useMemo(() => {
        const months = 6;
        const now = new Date();
        const chartData = [];

        for (let i = months - 1; i >= 0; i--) {
            const monthDate = subMonths(now, i);
            const monthStart = startOfMonth(monthDate);
            
            const clientsInMonth = clients.filter(
                client => new Date(client.createdAt) <= monthStart
            ).length;
            
            chartData.push({
                name: format(monthStart, 'MMM'),
                clients: clientsInMonth
            });
        }
        return chartData;
    }, [clients]);

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <LineChart
                    data={data}
                    margin={{
                        top: 5, right: 30, left: 20, bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="clients" stroke="#4f46e5" strokeWidth={2} activeDot={{ r: 8 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ClientGrowthChart;
