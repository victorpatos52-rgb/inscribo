import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, PhoneIcon, EnvelopeIcon, CalendarIcon, ClockIcon, UserIcon } from '@heroicons/react/24/outline';

interface Visit {
  id: string;
  title: string;
  description: string | null;
  scheduled_date: string;
  duration_minutes: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  lead_id: string;
  lead_name: string;
  lead_phone: string;
  lead_email: string;
  notes: string | null;
}

interface VisitModalProps {
  visit: Visit;
  onClose: () => void;
  onUpdate: (visit: Visit) => void;
}

export function VisitModal({ visit, onClose, onUpdate }: VisitModalProps) {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    title: visit.title,
    description: visit.description || '',
    scheduled_date: new Date(visit.scheduled_date).toISOString().slice(0, 16),
    duration_minutes: visit.duration_minutes,
    status: visit.status,
    notes: visit.notes || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const updatedVisit: Visit = {
        ...visit,
        ...formData,
        scheduled_date: new Date(formData.scheduled_date).toISOString(),
      };
      onUpdate(updatedVisit);
      setEditMode(false);
    } catch (error) {
      console.error('Error updating visit:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
      no_show: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    };
    return colors[status as keyof typeof colors] || colors.scheduled;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      scheduled: 'Agendada',
      completed: 'Concluída',
      cancelled: 'Cancelada',
      no_show: 'Não Compareceu',
    };
    return labels[status as keyof typeof labels] || status;
  };

  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-8 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl">
                  <CalendarIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <Dialog.Title className="text-2xl font-bold text-gray-900 dark:text-white">
                    Detalhes da Visita
                  </Dialog.Title>
                  <p className="text-gray-600 dark:text-gray-400">
                    {new Date(visit.scheduled_date).toLocaleDateString('pt-BR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {!editMode && (
                  <button
                    onClick={() => setEditMode(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl transition-all"
                  >
                    Editar
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-8">
            {editMode ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Título
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Data e Hora
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.scheduled_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, scheduled_date: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Duração (minutos)
                    </label>
                    <select
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) }))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                    >
                      <option value={30}>30 minutos</option>
                      <option value={60}>1 hora</option>
                      <option value={90}>1h 30min</option>
                      <option value={120}>2 horas</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  >
                    <option value="scheduled">Agendada</option>
                    <option value="completed">Concluída</option>
                    <option value="cancelled">Cancelada</option>
                    <option value="no_show">Não Compareceu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                    placeholder="Descrição da visita..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Observações
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                    placeholder="Observações sobre a visita..."
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setEditMode(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-purple-400 disabled:to-blue-400 text-white font-semibold py-3 px-6 rounded-xl transition-all"
                  >
                    {loading ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Visit Info */}
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {visit.title}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(visit.status)}`}>
                      {getStatusLabel(visit.status)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <CalendarIcon className="h-5 w-5 mr-2" />
                      <span>
                        {new Date(visit.scheduled_date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <ClockIcon className="h-5 w-5 mr-2" />
                      <span>
                        {new Date(visit.scheduled_date).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })} ({visit.duration_minutes} min)
                      </span>
                    </div>
                  </div>

                  {visit.description && (
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      {visit.description}
                    </p>
                  )}
                </div>

                {/* Lead Info */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-6 rounded-2xl">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    <UserIcon className="h-5 w-5 mr-2" />
                    Informações do Lead
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-lg">
                        {visit.lead_name}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {visit.lead_phone && (
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <PhoneIcon className="h-5 w-5 mr-2" />
                          <a 
                            href={`tel:${visit.lead_phone}`}
                            className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                          >
                            {visit.lead_phone}
                          </a>
                        </div>
                      )}
                      {visit.lead_email && (
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <EnvelopeIcon className="h-5 w-5 mr-2" />
                          <a 
                            href={`mailto:${visit.lead_email}`}
                            className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                          >
                            {visit.lead_email}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {visit.notes && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                      Observações
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      {visit.notes}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}