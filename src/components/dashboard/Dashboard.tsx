// src/components/dashboard/Dashboard.tsx - VERSÃO ATUALIZADA
import React from 'react';
import { 
  UserGroupIcon, 
  CalendarIcon, 
  AcademicCapIcon, 
  ArrowTrendingUpIcon,
  PlusIcon,
  ClipboardDocumentListIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { clsx } from 'clsx';
import { useDashboard } from '../../hooks/useDashboard';

interface DashboardProps {
  onNavigate: (page: string) => void;
  profile: {
    full_name: string;
  };
}

export function Dashboard({ onNavigate, profile }: DashboardProps) {
  const { stats, chartData, loading, error, refetch } = useDashboard();

  const statCards = [
    {
      title: 'Total de Leads',
      value: stats.totalLeads,
      icon: UserGroupIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/50',
      trend: stats.leadsThisMonth > 0 ? `+${stats.leadsThisMonth} este mês` : null,
    },
    {
      title: 'Visitas Hoje',
      value: stats.visitsToday,
      icon: CalendarIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/50',
      trend: stats.visitsThisWeek > stats.visitsToday ? `${stats.visitsThisWeek} esta semana` : null,
    },
    {
      title: 'Matrículas',
      value: stats.enrollments,
      icon: AcademicCapIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/50',
      trend: stats.completedVisits > 0 ? `${stats.completedVisits} visitas concluídas` : null,
    },
    {
      title: 'Taxa de Conversão',
      value: `${stats.conversionRate}%`,
      icon: ArrowTrendingUpIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/50',
      trend: stats.conversionRate > 20 ? 'Acima da média' : 'Pode melhorar',
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="ml-4 text-gray-600 dark:text-gray-400">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

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
          {error && (
            <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-800 rounded-lg">
              <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                ⚠️ {error} (usando dados de demonstração)
              </p>
            </div>
          )}
        </div>
        <button
          onClick={refetch}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-xl flex items-center transition-all"
          title="Atualizar dados"
        >
          <ArrowPathIcon className="h-5 w-5 mr-2" />
          Atualizar
        </button>
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
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {card.value}
                  </p>
                  {card.trend && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {card.trend}
                    </p>
                  )}
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Evolução de Matrículas
            </h3>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Últimos 6 meses
            </div>
          </div>
          <div className="h-64">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="name" 
                    className="text-gray-600 dark:text-gray-400"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    className="text-gray-600 dark:text-gray-400"
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#6366f1"
                    strokeWidth={3}
                    dot={{ fill: '#6366f1', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, stroke: '#6366f1', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    Dados do gráfico em carregamento...
                  </p>
                </div>
              </div>
            )}
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
                    'w-full flex items-center p-4 rounded-lg text-white transition-all transform hover:scale-[1.02] shadow-md hover:shadow-lg',
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

      {/* Recent Activity Summary */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-6 rounded-xl border border-purple-200 dark:border-purple-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
          Resumo de Atividades
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {stats.totalLeads}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total de Leads
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.visitsThisWeek}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Visitas Esta Semana
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {stats.conversionRate}%
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Taxa de Conversão
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
