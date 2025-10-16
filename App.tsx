
import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import Sidebar from './components/Sidebar';
import DashboardView from './components/dashboard/DashboardView';
import CalendarView from './components/calendar/CalendarView';
import ClientView from './components/clients/ClientView';
import CommunicationView from './components/communications/CommunicationView';
import AIAgentView from './components/ai/AIAgentView';
import NotificationsView from './components/notifications/NotificationsView';
import AcquisitionChannelsView from './components/channels/AcquisitionChannelsView';

import BroadcastMessageView from './components/broadcast-message/BroadcastMessageView';
import TeachAgentView from './components/teach-agent/TeachAgentView';
import type { View } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'calendar':
        return <CalendarView />;
      case 'clients':
        return <ClientView />;
      case 'ai-agent-conversations':
        return <CommunicationView />;
      case 'ai-agent':
        return <AIAgentView />;
      case 'notifications':
        return <NotificationsView />;
      case 'acquisition-channels':
        return <AcquisitionChannelsView />;

      case 'broadcast-message':
        return <BroadcastMessageView />;
      case 'teach-agent':
        return <TeachAgentView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <AppProvider>
      <div className="flex h-screen bg-slate-100 text-slate-800">
        <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
        <main className="flex-1 overflow-y-auto">
          {renderView()}
        </main>
      </div>
    </AppProvider>
  );
};

export default App;