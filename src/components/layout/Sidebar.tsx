import React from 'react';
import { 
  HomeIcon, 
  UserGroupIcon, 
  CalendarIcon, 
  ChartBarIcon,
  CogIcon,
  UsersIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  profile: {
    full_name: string;
    role: string;
  };
  onSignOut: () => void;
}

export function Sidebar({ currentPage, onPageChange, profile, onSignOut }: SidebarProps) {

  const navigationItems = [
    { id: 'dashboard', name: 'Dashboard', icon: HomeIcon },
    { id: 'leads', name: 'Leads', icon: UserGroupIcon },
    { id: 'calendar', name: 'Calendário', icon: CalendarIcon },
    { id: 'reports', name: 'Relatórios', icon: ChartBarIcon },
    ...(profile?.role === 'admin' ? [
      { id: 'users', name: 'Usuários', icon: UsersIcon },
      { id: 'settings', name: 'Configurações', icon: CogIcon },
    ] : []),
  ];

  return (
    <div className="bg-white dark:bg-gray-800 w-64 min-h-screen shadow-lg flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">Inscribo</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">CRM Educacional</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onPageChange(item.id)}
                  className={clsx(
                    'w-full flex items-center px-4 py-3 text-left rounded-lg transition-all',
                    currentPage === item.id
                      ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

    </div>
  );
}