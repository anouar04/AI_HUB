
import React from 'react';
import { Icon } from './icons/Icon';
import type { View } from '../types';
import { useAppContext } from '../context/AppContext';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView }) => {
  const { notifications } = useAppContext();
  const unreadNotificationCount = notifications.filter(n => !n.read).length;
  const navItems: { id: View; name: string; icon: JSX.Element }[] = [
    { id: 'dashboard', name: 'Dashboard', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /> },
    { id: 'calendar', name: 'Calendar', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M12 12.75h.008v.008H12v-.008z" /> },
    { id: 'clients', name: 'Clients', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.101a6.375 6.375 0 015.34-4.649M2.25 12c0-5.03 4.403-9 9.75-9s9.75 3.97 9.75 9c0 5.03-4.403 9-9.75 9s-9.75-3.97-9.75-9z" /> },
    { id: 'acquisition-channels', name: 'Canaux d\'acquisition', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /> },
    { id: 'broadcast-message', name: 'Broadcast Message', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75A2.25 2.25 0 0015.75 1.5H13.5m-3 0V3.75m3-2.25V3.75M15 15.75H9m6 2.25H9m6-5.25H9M12 18.75h.008v.008H12v-.008z" /> },

    { id: 'ai-agent-conversations', name: 'AI Agent Conversations', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> },
    { id: 'ai-agent', name: 'AI Agent', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.562L16.25 21.75l-.648-1.188a2.25 2.25 0 01-1.423-1.423L13.5 18.75l1.188-.648a2.25 2.25 0 011.423-1.423L17.25 15l.648 1.188a2.25 2.25 0 011.423 1.423L20.25 18.75l-1.188.648a2.25 2.25 0 01-1.423 1.423z" /> },
    { id: 'teach-agent', name: 'Teach Agent', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6-2.292m0 0v14.25" /> },
    { id: 'notifications', name: 'Notifications', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /> },
  ];

  const NavItem: React.FC<{
    item: { id: View; name: string; icon: JSX.Element };
    unreadCount?: number;
  }> = ({ item, unreadCount }) => {
    const isActive = currentView === item.id;
    return (
      <li>
        <button
          onClick={() => setCurrentView(item.id)}
          className={`flex items-center p-3 my-1 w-full text-left rounded-lg transition-colors duration-200 ${
            isActive
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          <Icon className="w-6 h-6 mr-3">{item.icon}</Icon>
          <span className="font-medium">{item.name}</span>
          {item.id === 'notifications' && unreadCount && unreadCount > 0 && (
            <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">{unreadCount}</span>
          )}
        </button>
      </li>
    );
  };

  return (
    <aside className="w-64 bg-slate-800 text-white flex flex-col p-4">
      <div className="flex items-center mb-8">
         <div className="p-2 bg-indigo-500 rounded-lg">
            <Icon className="w-8 h-8 text-white"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.098a2.25 2.25 0 01-2.25 2.25h-13.5a2.25 2.25 0 01-2.25-2.25V7.5a2.25 2.25 0 012.25-2.25h13.5a2.25 2.25 0 012.25 2.25v4.098m-1.626-4.5h-12.25M11.25 21V3.75" /></Icon>
         </div>
        <h1 className="text-2xl font-bold ml-3">Business Hub</h1>
      </div>
      <nav>
        <ul>
          {navItems.map((item) => (
            <NavItem key={item.id} item={item} unreadCount={unreadNotificationCount} />
          ))}
        </ul>
      </nav>
      <div className="mt-auto">
        <div className="flex items-center p-3 bg-slate-700/50 rounded-lg">
            <img src="https://picsum.photos/40/40" alt="User" className="w-10 h-10 rounded-full" />
            <div className="ml-3">
                <p className="font-semibold text-white">Admin User</p>
                <p className="text-sm text-slate-400">Biz Owner</p>
            </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;