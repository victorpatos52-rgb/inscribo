import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { Header } from './components/layout/Header';
import { Dashboard } from './components/dashboard/Dashboard';
// import { LeadsKanban } from './components/leads/LeadsKanban'; // Comentado temporariamente
import { CalendarView } from './components/calendar/CalendarView';
import { Reports } from './components/reports/Reports';
import UserManagement from './components/users/UserManagement';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'leads':
        // return <LeadsKanban />; // Comentado temporariamente
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Gestão de Leads</h1>
            <p className="text-gray-600">Funcionalidade em desenvolvimento...</p>
          </div>
        );
      case 'calendar':
        return <CalendarView />;
      case 'reports':
        return <Reports />;
      case 'users':
        return <UserManagement />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header 
          currentView={currentView} 
          onViewChange={setCurrentView} 
        />
        <main className="pt-16">
          {renderCurrentView()}
        </main>
      </div>
    </AuthProvider>
  );
}
