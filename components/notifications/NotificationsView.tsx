
import React from 'react';
import Header from '../Header';
import { useAppContext } from '../../context/AppContext';
import { Icon } from '../icons/Icon';
import type { Notification } from '../../types';
import { NotificationType } from '../../types';
import { formatDistanceToNow } from 'date-fns';

const NotificationsView: React.FC = () => {
    const { notifications, setNotifications } = useAppContext();
    
    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };
    
    const getNotificationIcon = (type: NotificationType) => {
        switch (type) {
            case NotificationType.NewMessage:
                return <Icon className="w-6 h-6 text-blue-500"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></Icon>;
            case NotificationType.NewAppointment:
                return <Icon className="w-6 h-6 text-green-500"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M12 12.75h.008v.008H12v-.008z" /></Icon>;
            case NotificationType.AppointmentChange:
                 return <Icon className="w-6 h-6 text-yellow-500"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></Icon>;
            case NotificationType.ClientChange:
                 return <Icon className="w-6 h-6 text-orange-500"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></Icon>;
            case NotificationType.IdentifierChange:
                 return <Icon className="w-6 h-6 text-teal-500"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></Icon>;
            case NotificationType.IdentifierDeleted:
                return <Icon className="w-6 h-6 text-red-500"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m-3.232 0l.346 9M5.25 6H18.75m-13.5 0a1.5 1.5 0 011.5-1.5h9a1.5 1.5 0 011.5 1.5v1.5a1.5 1.5 0 01-1.5 1.5h-9a1.5 1.5 0 01-1.5-1.5V6z" /></Icon>;
            case NotificationType.ChannelChange:
                return <Icon className="w-6 h-6 text-blue-500"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></Icon>;
            case NotificationType.ChannelDeleted:
                return <Icon className="w-6 h-6 text-red-500"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m-3.232 0l.346 9M5.25 6H18.75m-13.5 0a1.5 1.5 0 011.5-1.5h9a1.5 1.5 0 011.5 1.5v1.5a1.5 1.5 0 01-1.5 1.5h-9a1.5 1.5 0 01-1.5-1.5V6z" /></Icon>;
            case NotificationType.NewClient:
                return <Icon className="w-6 h-6 text-purple-500"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.101a6.375 6.375 0 015.34-4.649M2.25 12c0-5.03 4.403-9 9.75-9s9.75 3.97 9.75 9c0 5.03-4.403 9-9.75 9s-9.75-3.97-9.75-9z" /></Icon>;
            case NotificationType.NewIdentifier:
                return <Icon className="w-6 h-6 text-cyan-500"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 1.252-1.008 2.25-2.25 2.25S5.25 11.002 5.25 9.75s1.008-2.25 2.25-2.25 2.25 1.008 2.25 2.25z" /></Icon>;
            case NotificationType.FileUploaded:
                return <Icon className="w-6 h-6 text-indigo-500"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></Icon>;
            case NotificationType.NewChannel:
                return <Icon className="w-6 h-6 text-teal-500"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></Icon>;
            default:
                return null;
        }
    };

    return (
        <div className="p-8">
            <Header title="Notifications">
                 <button onClick={markAllAsRead} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                    Mark all as read
                </button>
            </Header>

            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm">
                <ul className="divide-y divide-slate-200">
                    {notifications.length > 0 ? (
                        notifications.map((notification: Notification) => (
                        <li key={notification.id} className={`p-4 flex items-start ${!notification.read ? 'bg-indigo-50' : ''}`}>
                            <div className="mr-4 mt-1 flex-shrink-0">
                                {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1">
                                <p className="text-slate-700">{notification.message}</p>
                                <p className="text-sm text-slate-500 mt-1">
                                    {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                                </p>
                            </div>
                            {!notification.read && (
                                <button onClick={() => markAsRead(notification.id)} className="w-3 h-3 bg-indigo-500 rounded-full" title="Mark as read"></button>
                            )}
                        </li>
                    ))) : (
                        <li className="p-8 text-center text-slate-500">
                            You have no notifications.
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default NotificationsView;