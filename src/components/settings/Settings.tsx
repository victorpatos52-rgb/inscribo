import React, { useState, useEffect } from 'react';
import { 
  BuildingOfficeIcon,
  SwatchIcon,
  BellIcon,
  LinkIcon,
  CogIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  ClipboardDocumentIcon,
  PlusIcon,
  TrashIcon,
  PlayIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { WebhookModal } from './WebhookModal';

interface OutgoingWebhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  active: boolean;
  created_at: string;
}

export function Settings() {
  const { profile, user } = useAuth();
  
  // Ensure admin access in demo mode
  const currentProfile = profile || {
    id: user?.id || 'demo-user',
    full_name: user?.user_metadata?.full_name || 'Admin Demo',
    email: user?.email || 'admin@inscribo.com',
    role: 'admin' as const,
    institution_id: 'demo-institution',
    avatar_url: null,
  };

  const [settings, setSettings] = useState({
    institutionName: 'Escola Exemplo',
    logoUrl: '',
    primaryColor: '#8B5CF6',
    secondaryColor: '#06B6D4',
    enableNotifications: true,
    enableWhatsApp: false,
    whatsappWebhook: '',
    enableEmailNotifications: true,
    enableSMSNotifications: false,
    autoAssignLeads: true,
    leadStages: [
      { id: '1', name: 'Novo', color: '#8B5CF6', order: 1 },
      { id: '2', name: 'Contato', color: '#06B6D4', order: 2 },
      { id: '3', name: 'Agendado', color: '#F59E0B', order: 3 },
      { id: '4', name: 'Visita', color: '#EC4899', order: 4 },
      { id: '5', name: 'Proposta', color: '#EF4444', order: 5 },
      { id: '6', name: 'Matrícula', color: '#10B981', order: 6 },
    ],
  });

  // Webhook states
  const [incomingWebhookUrl] = useState('https://inscribo.com/api/webhooks/incoming/demo-123');
  const [secretKey, setSecretKey] = useState('wh_secret_abc123def456ghi789');
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [outgoingWebhooks, setOutgoingWebhooks] = useState<OutgoingWebhook[]>([
    {
      id: '1',
      name: 'Sistema CRM Principal',
      url: 'https://meucrm.com/webhooks/inscribo',
      events: ['Novo Lead', 'Nova Matrícula', 'Visita Agendada'],
      active: true,
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: '2',
      name: 'Plataforma de Email Marketing',
      url: 'https://emailmarketing.com/api/webhook',
      events: ['Novo Lead', 'Atualização de Status'],
      active: false,
      created_at: new Date(Date.now() - 172800000).toISOString(),
    },
  ]);

  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<OutgoingWebhook | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const availableEvents = [
    'Novo Lead',
    'Nova Matrícula', 
    'Visita Agendada',
    'Visita Realizada',
    'Atualização de Status',
    'Lead Convertido',
    'Proposta Enviada',
  ];

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate saving
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage('Configurações salvas com sucesso!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setMessage('URL copiada para a área de transferência!');
    setTimeout(() => setMessage(''), 3000);
  };

  const generateNewSecretKey = () => {
    const newKey = 'wh_secret_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setSecretKey(newKey);
    setMessage('Nova chave secreta gerada!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleWebhookSave = (webhookData: Omit<OutgoingWebhook, 'id' | 'created_at'>) => {
    if (editingWebhook) {
      // Update existing webhook
      setOutgoingWebhooks(prev => prev.map(wh => 
        wh.id === editingWebhook.id 
          ? { ...wh, ...webhookData }
          : wh
      ));
    } else {
      // Add new webhook
      const newWebhook: OutgoingWebhook = {
        ...webhookData,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
      };
      setOutgoingWebhooks(prev => [newWebhook, ...prev]);
    }
    setEditingWebhook(null);
  };

  const toggleWebhookStatus = (id: string) => {
    setOutgoingWebhooks(prev => prev.map(wh => 
      wh.id === id ? { ...wh, active: !wh.active } : wh
    ));
  };

  const deleteWebhook = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este webhook?')) {
      setOutgoingWebhooks(prev => prev.filter(wh => wh.id !== id));
    }
  };

  const testWebhook = async (webhook: OutgoingWebhook) => {
    setLoading(true);
    try {
      // Simulate webhook test
      await new Promise(resolve => setTimeout(resolve, 2000));
      setMessage(`Webhook "${webhook.name}" testado com sucesso!`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(`Erro ao testar webhook "${webhook.name}"`);
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const addLeadStage = () => {
    const newStage = {
      id: Date.now().toString(),
      name: 'Nova Etapa',
      color: '#6366F1',
      order: settings.leadStages.length + 1,
    };
    setSettings(prev => ({
      ...prev,
      leadStages: [...prev.leadStages, newStage],
    }));
  };

  const updateLeadStage = (id: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      leadStages: prev.leadStages.map(stage =>
        stage.id === id ? { ...stage, [field]: value } : stage
      ),
    }));
  };

  const removeLeadStage = (id: string) => {
    if (settings.leadStages.length <= 2) {
      alert('Deve haver pelo menos 2 etapas no funil');
      return;
    }
    setSettings(prev => ({
      ...prev,
      leadStages: prev.leadStages.filter(stage => stage.id !== id),
    }));
  };

  return (
    <>
      <div className="p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Configurações do Sistema
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Personalize e configure o sistema conforme suas necessidades
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-purple-400 disabled:to-blue-400 text-white font-semibold py-3 px-8 rounded-xl transition-all transform hover:scale-105 disabled:transform-none shadow-lg"
          >
            {loading ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </div>

        {message && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-6 py-4 rounded-xl">
            {message}
          </div>
        )}

        {/* Webhooks Section */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center">
            <LinkIcon className="h-7 w-7 mr-3 text-purple-600" />
            Webhooks
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Incoming Webhooks */}
            <div className="space-y-6">
              <div className="flex items-center mb-4">
                <ArrowRightIcon className="h-6 w-6 text-green-600 mr-2" />
                <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                  Webhooks de Entrada
                </h4>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-6 rounded-2xl border border-green-200 dark:border-green-800">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      URL do Endpoint
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={incomingWebhookUrl}
                        readOnly
                        className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-xl text-gray-700 dark:text-gray-300 font-mono text-sm"
                      />
                      <button
                        onClick={() => copyToClipboard(incomingWebhookUrl)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl transition-all flex items-center"
                      >
                        <ClipboardDocumentIcon className="h-5 w-5 mr-2" />
                        Copiar
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Chave Secreta
                    </label>
                    <div className="flex items-center space-x-2">
                      <div className="relative flex-1">
                        <input
                          type={showSecretKey ? 'text' : 'password'}
                          value={secretKey}
                          readOnly
                          className="w-full px-4 py-3 pr-12 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-xl text-gray-700 dark:text-gray-300 font-mono text-sm"
                        />
                        <button
                          onClick={() => setShowSecretKey(!showSecretKey)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {showSecretKey ? (
                            <EyeSlashIcon className="h-5 w-5" />
                          ) : (
                            <EyeIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      <button
                        onClick={generateNewSecretKey}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl transition-all whitespace-nowrap"
                      >
                        Gerar Nova
                      </button>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-xl">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      <strong>💡 Como usar:</strong> Use esta URL para receber eventos de sistemas externos. 
                      Valide os eventos com a chave secreta para garantir a autenticidade.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Outgoing Webhooks */}
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <ArrowLeftIcon className="h-6 w-6 text-purple-600 mr-2" />
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                    Webhooks de Saída
                  </h4>
                </div>
                <button
                  onClick={() => setShowWebhookModal(true)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-xl flex items-center transition-all transform hover:scale-105 shadow-lg text-sm font-semibold"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Adicionar Webhook
                </button>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {outgoingWebhooks.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <LinkIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Nenhum webhook configurado
                    </p>
                  </div>
                ) : (
                  outgoingWebhooks.map((webhook) => (
                    <div
                      key={webhook.id}
                      className={`p-4 rounded-xl border transition-all ${
                        webhook.active
                          ? 'bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800'
                          : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h5 className="font-bold text-gray-900 dark:text-white mb-1">
                            {webhook.name}
                          </h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400 font-mono break-all">
                            {webhook.url}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => toggleWebhookStatus(webhook.id)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              webhook.active ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-600'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                webhook.active ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {webhook.events.map((event, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 rounded-full text-xs font-semibold"
                          >
                            {event}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Criado em {new Date(webhook.created_at).toLocaleDateString('pt-BR')}
                        </span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => testWebhook(webhook)}
                            disabled={!webhook.active || loading}
                            className="p-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-all disabled:opacity-50"
                            title="Testar webhook"
                          >
                            <PlayIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingWebhook(webhook);
                              setShowWebhookModal(true);
                            }}
                            className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                            title="Editar webhook"
                          >
                            <CogIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteWebhook(webhook.id)}
                            className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                            title="Excluir webhook"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Institution Settings */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <BuildingOfficeIcon className="h-6 w-6 mr-3 text-purple-600" />
              Dados da Instituição
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Nome da Instituição
                </label>
                <input
                  type="text"
                  value={settings.institutionName}
                  onChange={(e) => handleChange('institutionName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  placeholder="Nome da sua escola/instituição"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  URL do Logo
                </label>
                <input
                  type="url"
                  value={settings.logoUrl}
                  onChange={(e) => handleChange('logoUrl', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  placeholder="https://exemplo.com/logo.png"
                />
              </div>
            </div>
          </div>

          {/* Theme Settings */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <SwatchIcon className="h-6 w-6 mr-3 text-purple-600" />
              Personalização Visual
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Cor Primária
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={settings.primaryColor}
                    onChange={(e) => handleChange('primaryColor', e.target.value)}
                    className="w-16 h-12 border border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.primaryColor}
                    onChange={(e) => handleChange('primaryColor', e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Cor Secundária
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={settings.secondaryColor}
                    onChange={(e) => handleChange('secondaryColor', e.target.value)}
                    className="w-16 h-12 border border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.secondaryColor}
                    onChange={(e) => handleChange('secondaryColor', e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <BellIcon className="h-6 w-6 mr-3 text-purple-600" />
              Notificações
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-gray-700 dark:text-gray-300 font-semibold">Notificações por E-mail</span>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Receber notificações importantes por e-mail</p>
                </div>
                <button
                  onClick={() => handleChange('enableEmailNotifications', !settings.enableEmailNotifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.enableEmailNotifications ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.enableEmailNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-gray-700 dark:text-gray-300 font-semibold">Notificações SMS</span>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Receber notificações por SMS</p>
                </div>
                <button
                  onClick={() => handleChange('enableSMSNotifications', !settings.enableSMSNotifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.enableSMSNotifications ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.enableSMSNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-gray-700 dark:text-gray-300 font-semibold">Atribuição Automática</span>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Atribuir leads automaticamente aos usuários</p>
                </div>
                <button
                  onClick={() => handleChange('autoAssignLeads', !settings.autoAssignLeads)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.autoAssignLeads ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.autoAssignLeads ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Integration Settings */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <LinkIcon className="h-6 w-6 mr-3 text-purple-600" />
              Integrações
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-gray-700 dark:text-gray-300 font-semibold">Integração WhatsApp</span>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Conectar com WhatsApp Business API</p>
                </div>
                <button
                  onClick={() => handleChange('enableWhatsApp', !settings.enableWhatsApp)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.enableWhatsApp ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.enableWhatsApp ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              {settings.enableWhatsApp && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Webhook URL
                  </label>
                  <input
                    type="url"
                    value={settings.whatsappWebhook}
                    onChange={(e) => handleChange('whatsappWebhook', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                    placeholder="https://api.whatsapp.com/webhook"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lead Stages Configuration */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <CogIcon className="h-6 w-6 mr-3 text-purple-600" />
              Etapas do Funil de Leads
            </h3>
            <button
              onClick={addLeadStage}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl transition-all"
            >
              Adicionar Etapa
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {settings.leadStages.map((stage, index) => (
              <div key={stage.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                    Etapa {index + 1}
                  </span>
                  {settings.leadStages.length > 2 && (
                    <button
                      onClick={() => removeLeadStage(stage.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remover
                    </button>
                  )}
                </div>
                
                <div className="space-y-3">
                  <input
                    type="text"
                    value={stage.name}
                    onChange={(e) => updateLeadStage(stage.id, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-600 dark:text-white transition-all"
                    placeholder="Nome da etapa"
                  />
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={stage.color}
                      onChange={(e) => updateLeadStage(stage.id, 'color', e.target.value)}
                      className="w-10 h-8 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={stage.color}
                      onChange={(e) => updateLeadStage(stage.id, 'color', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-600 dark:text-white transition-all text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showWebhookModal && (
        <WebhookModal
          webhook={editingWebhook}
          availableEvents={availableEvents}
          onClose={() => {
            setShowWebhookModal(false);
            setEditingWebhook(null);
          }}
          onSave={handleWebhookSave}
        />
      )}
    </>
  );
}