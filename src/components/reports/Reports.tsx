import React, { useState, useEffect } from 'react';
import { 
  DocumentArrowDownIcon,
  FunnelIcon,
  CalendarIcon,
  UserIcon,
  TrophyIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ReportData {
  conversionData: any[];
  userPerformance: any[];
  visitsData: any[];
  userLeadsData: any[];
  conversionByUser: any[];
}

export function Reports() {
  const [reportData, setReportData] = useState<ReportData>({
    conversionData: [],
    userPerformance: [],
    visitsData: [],
    userLeadsData: [],
    conversionByUser: [],
  });
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    try {
      // Dados do funil de conversão
      const conversionData = [
        { stage: 'Novo', count: 45, color: '#6B7280' },
        { stage: 'Contato', count: 35, color: '#3B82F6' },
        { stage: 'Agendado', count: 25, color: '#F59E0B' },
        { stage: 'Visita', count: 20, color: '#8B5CF6' },
        { stage: 'Proposta', count: 15, color: '#EF4444' },
        { stage: 'Matrícula', count: 12, color: '#10B981' },
      ];

      // Performance por usuário
      const userPerformance = [
        { name: 'João Silva', leads: 25, conversions: 8, conversionRate: 32 },
        { name: 'Maria Santos', leads: 20, conversions: 12, conversionRate: 60 },
        { name: 'Pedro Costa', leads: 18, conversions: 6, conversionRate: 33 },
        { name: 'Ana Lima', leads: 15, conversions: 9, conversionRate: 60 },
        { name: 'Carlos Mendes', leads: 12, conversions: 4, conversionRate: 33 },
      ];

      // Dados de visitas
      const visitsData = [
        { date: '01/01', scheduled: 5, completed: 4, cancelled: 1 },
        { date: '02/01', scheduled: 8, completed: 6, cancelled: 2 },
        { date: '03/01', scheduled: 6, completed: 5, cancelled: 1 },
        { date: '04/01', scheduled: 10, completed: 8, cancelled: 2 },
      ];

      // Leads por usuário e estágio
      const userLeadsData = [
        { 
          user: 'João Silva', 
          novo: 8, 
          contato: 6, 
          agendado: 4, 
          visita: 3, 
          proposta: 2, 
          matricula: 2,
          total: 25
        },
        { 
          user: 'Maria Santos', 
          novo: 5, 
          contato: 4, 
          agendado: 3, 
          visita: 3, 
          proposta: 3, 
          matricula: 2,
          total: 20
        },
        { 
          user: 'Pedro Costa', 
          novo: 6, 
          contato: 4, 
          agendado: 3, 
          visita: 2, 
          proposta: 2, 
          matricula: 1,
          total: 18
        },
        { 
          user: 'Ana Lima', 
          novo: 4, 
          contato: 3, 
          agendado: 3, 
          visita: 2, 
          proposta: 2, 
          matricula: 1,
          total: 15
        },
      ];

      // Conversão por usuário (para ranking)
      const conversionByUser = userPerformance
        .sort((a, b) => b.conversionRate - a.conversionRate)
        .map((user, index) => ({
          ...user,
          rank: index + 1,
          badge: index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅'
        }));

      setReportData({
        conversionData,
        userPerformance,
        visitsData,
        userLeadsData,
        conversionByUser,
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    // Implementation for PDF export would go here
    console.log('Exporting to PDF...');
  };

  const exportToCSV = () => {
    // Implementation for CSV export would go here
    console.log('Exporting to CSV...');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Relatórios</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
            <span className="text-gray-500">até</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={exportToCSV}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition-all"
            >
              <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
              CSV
            </button>
            <button
              onClick={exportToPDF}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center transition-all"
            >
              <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
              PDF
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Conversion Funnel */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <FunnelIcon className="h-5 w-5 mr-2" />
            Funil de Conversão
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData.conversionData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="stage" className="text-gray-600 dark:text-gray-400" />
                <YAxis className="text-gray-600 dark:text-gray-400" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Performance */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <TrophyIcon className="h-5 w-5 mr-2 text-yellow-500" />
            Ranking de Conversão
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {reportData.conversionByUser.map((user, index) => (
              <div key={index} className={`p-4 rounded-2xl border-2 transition-all hover:scale-105 ${
                index === 0 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-300 dark:border-yellow-600' :
                index === 1 ? 'bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 border-gray-300 dark:border-gray-600' :
                index === 2 ? 'bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-300 dark:border-orange-600' :
                'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
              }`}>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{user.badge}</span>
                    <span className="text-sm font-bold text-gray-500 dark:text-gray-400">#{user.rank}</span>
                  </div>
                  <p className="font-bold text-gray-900 dark:text-white text-lg">{user.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {user.leads} leads • {user.conversions} conversões
                  </p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {user.conversionRate}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed User Reports */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        {/* Leads por Usuário e Estágio */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <ChartBarIcon className="h-5 w-5 mr-2 text-blue-500" />
            Leads por Usuário e Estágio do Funil
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 dark:text-gray-300">Usuário</th>
                  <th className="px-4 py-3 text-center text-sm font-bold text-gray-700 dark:text-gray-300">Novo</th>
                  <th className="px-4 py-3 text-center text-sm font-bold text-gray-700 dark:text-gray-300">Contato</th>
                  <th className="px-4 py-3 text-center text-sm font-bold text-gray-700 dark:text-gray-300">Agendado</th>
                  <th className="px-4 py-3 text-center text-sm font-bold text-gray-700 dark:text-gray-300">Visita</th>
                  <th className="px-4 py-3 text-center text-sm font-bold text-gray-700 dark:text-gray-300">Proposta</th>
                  <th className="px-4 py-3 text-center text-sm font-bold text-gray-700 dark:text-gray-300">Matrícula</th>
                  <th className="px-4 py-3 text-center text-sm font-bold text-gray-700 dark:text-gray-300">Total</th>
                  <th className="px-4 py-3 text-center text-sm font-bold text-gray-700 dark:text-gray-300">Taxa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {reportData.userLeadsData.map((user, index) => {
                  const conversionRate = Math.round((user.matricula / user.total) * 100);
                  return (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-full mr-3">
                            <span className="text-white font-bold text-xs">
                              {user.user.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-semibold text-gray-900 dark:text-white">{user.user}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-sm font-semibold">
                          {user.novo}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full text-sm font-semibold">
                          {user.contato}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 px-2 py-1 rounded-full text-sm font-semibold">
                          {user.agendado}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 px-2 py-1 rounded-full text-sm font-semibold">
                          {user.visita}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 px-2 py-1 rounded-full text-sm font-semibold">
                          {user.proposta}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 px-2 py-1 rounded-full text-sm font-semibold">
                          {user.matricula}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 px-2 py-1 rounded-full text-sm font-bold">
                          {user.total}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-sm font-bold ${
                          conversionRate >= 50 ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' :
                          conversionRate >= 30 ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300' :
                          'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'
                        }`}>
                          {conversionRate}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* Visits Overview */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2" />
            Visitas Realizadas
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData.visitsData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" className="text-gray-600 dark:text-gray-400" />
                <YAxis className="text-gray-600 dark:text-gray-400" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="scheduled" fill="#6366f1" name="Agendadas" radius={[2, 2, 0, 0]} />
                <Bar dataKey="completed" fill="#10b981" name="Realizadas" radius={[2, 2, 0, 0]} />
                <Bar dataKey="cancelled" fill="#ef4444" name="Canceladas" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}