import React, { useState } from 'react';
import { SunIcon, MoonIcon, BellIcon, UserIcon, CogIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { ProfileModal } from './ProfileModal';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { profile, user } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Ensure we have a profile with admin role for demo mode
  const currentProfile = profile || {
    id: user?.id || 'demo-user',
    full_name: user?.user_metadata?.full_name || 'Usuário Demo',
    email: user?.email || 'demo@inscribo.com',
    role: 'admin' as const,
    institution_id: 'demo-institution',
    avatar_url: null,
  };

  // Mock notifications
  const notifications = [
    {
      id: '1',
      title: 'Nova visita agendada',
      message: 'Ana Silva agendou uma visita para amanhã às 14h',
      time: '5 min atrás',
      read: false,
    },
    {
      id: '2',
      title: 'Lead convertido',
      message: 'João Santos foi convertido para matrícula',
      time: '1 hora atrás',
      read: false,
    },
    {
      id: '3',
      title: 'Relatório mensal disponível',
      message: 'O relatório de performance de janeiro está pronto',
      time: '2 horas atrás',
      read: true,
    },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
            {subtitle && (
              <p className="text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
              >
                <BellIcon className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-bold text-gray-900 dark:text-white">Notificações</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                          !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                              {notification.title}
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                              {notification.message}
                            </p>
                            <p className="text-gray-500 dark:text-gray-500 text-xs mt-2">
                              {notification.time}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 text-center">
                    <button className="text-purple-600 dark:text-purple-400 text-sm font-semibold hover:underline">
                      Ver todas as notificações
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
            >
              {theme === 'light' ? (
                <MoonIcon className="h-6 w-6" />
              ) : (
                <SunIcon className="h-6 w-6" />
              )}
            </button>

            {/* User Profile Menu */}
            <div className="relative">
              <button 
                onClick={() => setShowProfileModal(true)}
                className="flex items-center space-x-3 p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
              >
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-full">
                  <span className="text-white font-bold text-sm">
                    {currentProfile?.full_name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {currentProfile?.full_name || 'Usuário'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {currentProfile?.role === 'admin' ? 'Administrador' : 'Usuário'}
                  </p>
                </div>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Close notifications when clicking outside */}
      {showNotifications && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowNotifications(false)}
        />
      )}

      {showProfileModal && (
        <ProfileModal
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </>
  );
}