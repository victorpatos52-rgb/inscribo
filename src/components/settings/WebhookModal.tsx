import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, LinkIcon } from '@heroicons/react/24/outline';

interface OutgoingWebhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  active: boolean;
  created_at: string;
}

interface WebhookModalProps {
  webhook: OutgoingWebhook | null;
  availableEvents: string[];
  onClose: () => void;
  onSave: (webhook: Omit<OutgoingWebhook, 'id' | 'created_at'>) => void;
}

export function WebhookModal({ webhook, availableEvents, onClose, onSave }: WebhookModalProps) {
  const [formData, setFormData] = useState({
    name: webhook?.name || '',
    url: webhook?.url || '',
    events: webhook?.events || [],
    active: webhook?.active ?? true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.name.trim()) {
        throw new Error('Nome é obrigatório');
      }
      if (!formData.url.trim()) {
        throw new Error('URL é obrigatória');
      }
      if (formData.events.length === 0) {
        throw new Error('Selecione pelo menos um evento');
      }

      // Validate URL format
      try {
        new URL(formData.url);
      } catch {
        throw new Error('URL inválida');
      }

      onSave(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar webhook');
    } finally {
      setLoading(false);
    }
  };

  const handleEventToggle = (event: string) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event]
    }));
  };

  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full">
          <div className="p-8 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl">
                  <LinkIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-white">
                    {webhook ? 'Editar Webhook' : 'Novo Webhook'}
                  </Dialog.Title>
                  <p className="text-gray-600 dark:text-gray-400">
                    Configure um endpoint para receber eventos do sistema
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Nome do Webhook *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  placeholder="Ex: Sistema CRM Principal"
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                    className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="ml-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Webhook Ativo
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                URL de Destino *
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                placeholder="https://meucrm.com/webhooks/inscribo"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Eventos para Enviar *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableEvents.map((event) => (
                  <label key={event} className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.events.includes(event)}
                      onChange={() => handleEventToggle(event)}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                      {event}
                    </span>
                  </label>
                ))}
              </div>
              {formData.events.length === 0 && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                  Selecione pelo menos um evento
                </p>
              )}
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-xl">
              <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">💡 Como funciona</h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• O sistema enviará uma requisição POST para a URL configurada</li>
                <li>• Os dados serão enviados no formato JSON</li>
                <li>• Inclua um cabeçalho de autenticação se necessário</li>
                <li>• Use o botão "Testar" para verificar se o endpoint está funcionando</li>
              </ul>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-purple-400 disabled:to-blue-400 text-white font-semibold py-3 px-6 rounded-xl transition-all transform hover:scale-105 disabled:transform-none shadow-lg"
              >
                {loading ? 'Salvando...' : webhook ? 'Atualizar Webhook' : 'Criar Webhook'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}