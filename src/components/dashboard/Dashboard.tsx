import React, { useEffect, useState } from 'react';
import { 
  UserGroupIcon, 
  CalendarIcon, 
  AcademicCapIcon, 
  ArrowTrendingUpIcon,
  PlusIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { clsx } from 'clsx';

interface DashboardStats {
  totalLeads: number;
  visitsToday: number;
  enrollments: number;
  conversionRate: number;
}

interface DashboardProps {
  onNavigate: (page: string) => void;
  profile: {
    full_name: string;
  };
}

export function Dashboard({ onNavigate, profile }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 47,
    visitsToday: 3,
    enrollments: 12,
    conversionRate: 25.5,
  });
  const [chartData, setChartData] = useState([
    { name: 'Jan', value: 12 },
    { name: 'Fev', value: 19 },
    { name: 'Mar', value: 8 },
    { name: 'Abr', value: 25 },
    { name: 'Mai', value: 22 },
    { name: 'Jun', value: 30 },
  ]);

  useEffect(() => {
    // Mock data is already set above
  }, []);

  const statCards = [
    {
      title: 'Total de Leads',
      value: stats.totalLeads,
      icon: UserGroupIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/50',
    },
    {
      title: 'Visitas Hoje',
      value: stats.visitsToday,
      icon: CalendarIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/50',
    },
    {
      title: 'Matrículas',
      value: stats.enrollments,
      icon: AcademicCapIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/50',
    },
    {
      title: 'Taxa de Conversão',
      value: `${stats.conversionRate}%`,
      icon: ArrowTrendingUpIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/50',
    },
  ];

  const quickActions = [
    {
      title: 'Novo Lead',
      description: 'Cadastrar novo lead',
      icon: PlusIcon,
      color: 'bg-indigo-600 hover:bg-indigo-700',
      action: () => onNavigate('leads'),
    },
    {
      title: 'Nova Visita',
      description: 'Agendar visita',
      icon: CalendarIcon,
      color: 'bg-green-600 hover:bg-green-700',
      action: () => onNavigate('calendar'),
    },
    {
      title: 'Relatórios',
      description: 'Ver relatórios',
      icon: ClipboardDocumentListIcon,
      color: 'bg-purple-600 hover:bg-purple-700',
      action: () => onNavigate('reports'),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Bem-vindo, {profile?.full_name}!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Aqui está um resumo das suas atividades
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {card.value}
                  </p>
                </div>
                <div className={clsx('p-3 rounded-lg', card.bgColor)}>
                  <Icon className={clsx('h-6 w-6', card.color)} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Evolução de Matrículas
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" className="text-gray-600 dark:text-gray-400" />
                <YAxis className="text-gray-600 dark:text-gray-400" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Ações Rápidas
          </h3>
          <div className="space-y-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.title}
                  onClick={action.action}
                  className={clsx(
                    'w-full flex items-center p-4 rounded-lg text-white transition-all transform hover:scale-[1.02]',
                    action.color
                  )}
                >
                  <Icon className="h-6 w-6 mr-3" />
                  <div className="text-left">
                    <p className="font-semibold">{action.title}</p>
                    <p className="text-sm opacity-90">{action.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
