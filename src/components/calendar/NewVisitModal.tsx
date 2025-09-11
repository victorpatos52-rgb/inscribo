import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { useLeads, Lead } from '../../hooks/useLeads';
import { Visit } from '../../hooks/useVisits';

interface NewVisitModalProps {
  onClose: () => void;
  onSave: (visit: Omit<Visit, 'id' | 'created_at' | 'updated_at' | 'institution_id' | 'lead_name' | 'lead_phone' | 'lead_email'>) => Promise<void>;
  initialDate?: Date;
}

export function NewVisitModal({ onClose, onSave, initialDate }: NewVisitModalProps) {
  const { leads, loading: leadsLoading } = useLeads();
  const [formData, setFormData] = useState({
    lead_id: '',
    title: '',
    description: '',
    scheduled_date: initialDate ? initialDate.toISOString().slice(0, 16) : '',
    duration_minutes: 60,
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const selectedLead = leads.find(lead => lead.id === formData.lead_id);
      if (!selectedLead) {
        throw new Error('Lead não encontrado');
      }

      const visit = {
        title: formData.title || `Visita - ${selectedLead.student_name}`,
        description: formData.description || null,
        scheduled_date: new Date(formData.scheduled_date).toISOString(),
        duration_minutes: formData.duration_minutes,
        status: 'scheduled' as const,
        lead_id: formData.lead_id,
        notes: formData.notes || null,
      };

      await onSave(visit);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao agendar visita');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectedLead = leads.find(lead => lead.id === formData.lead_id);

  if (leadsLoading) {
    return (
      <Dialog open={true} onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Carregando leads...</span>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-white">
                Agendar Nova Visita
              </Dialog.Title>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-3 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Lead *
              </label>
              <select
                value={formData.lead_id}
                onChange={(e) => handleChange('lead_id', e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
              >
                <option value="">Selecionar lead</option>
                {leads.map((lead) => (
                  <option key={lead.id} value={lead.id}>
                    {lead.student_name} {lead.parent_name && `(${lead.parent_name})`}
                  </option>
                ))}
              </select>
            </div>

            {selectedLead && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-4 rounded-xl">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Informações do Lead</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <p><strong>Aluno:</strong> {selectedLead.student_name}</p>
                  {selectedLead.parent_name && <p><strong>Responsável:</strong> {selectedLead.parent_name}</p>}
                  {selectedLead.phone && <p><strong>Telefone:</strong> {selectedLead.phone}</p>}
                  {selectedLead.email && <p><strong>E-mail:</strong> {selectedLead.email}</p>}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Título da Visita
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                placeholder="Deixe em branco para gerar automaticamente"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                placeholder="Descrição da visita..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Data e Hora *
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduled_date}
                  onChange={(e) => handleChange('scheduled_date', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Duração (minutos)
                </label>
                <select
                  value={formData.duration_minutes}
