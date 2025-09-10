import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, PlusIcon, CalendarIcon, ClockIcon, ArrowRightIcon, UserIcon } from '@heroicons/react/24/outline';

interface Lead {
  id: string;
  student_name: string;
  parent_name: string | null;
  email: string | null;
  phone: string | null;
  grade_level: string | null;
  course_interest: string | null;
  current_stage: string | null;
  notes: string | null;
  created_at: string;
  current_stage: string | null;
}

interface Interaction {
  id: string;
  type: string;
  content: string;
  created_at: string;
  user_id: string;
}

interface StageChange {
  id: string;
  from_stage: string;
  to_stage: string;
  changed_at: string;
  changed_by: string;
  changed_by_name: string;
}

interface LeadModalProps {
  lead: Lead;
  onClose: () => void;
  onUpdate: (updatedLead: Lead) => void;
}

export function LeadModal({ lead, onClose, onUpdate }: LeadModalProps) {
  // Mock interactions for demo
  const [interactions, setInteractions] = useState<Interaction[]>([
    {
      id: '1',
      type: 'call',
      content: 'Ligação inicial - interessada em conhecer a escola',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      user_id: 'demo-user',
    },
    {
      id: '2',
      type: 'email',
      content: 'Enviado material informativo por e-mail',
      created_at: new Date(Date.now() - 43200000).toISOString(),
      user_id: 'demo-user',
    },
  ]);
  
  // Mock stage changes for demo
  const [stageChanges, setStageChanges] = useState<StageChange[]>([
    {
      id: '1',
      from_stage: 'Novo',
      to_stage: 'Contato',
      changed_at: new Date(Date.now() - 172800000).toISOString(),
      changed_by: 'demo-user',
      changed_by_name: 'João Silva',
    },
    {
      id: '2',
      from_stage: 'Contato',
      to_stage: 'Agendado',
      changed_at: new Date(Date.now() - 86400000).toISOString(),
      changed_by: 'demo-user',
      changed_by_name: 'Maria Santos',
    },
  ]);

  const [currentStage, setCurrentStage] = useState(lead.current_stage || '1');
  const [editMode, setEditMode] = useState(false);
  
  const stages = [
    { id: '1', name: 'Novo', color: '#8B5CF6' },
    { id: '2', name: 'Contato', color: '#06B6D4' },
    { id: '3', name: 'Agendado', color: '#F59E0B' },
    { id: '4', name: 'Visita', color: '#EC4899' },
    { id: '5', name: 'Proposta', color: '#EF4444' },
    { id: '6', name: 'Matrícula', color: '#10B981' },
  ];

  const [newInteraction, setNewInteraction] = useState('');
  const [interactionType, setInteractionType] = useState<'call' | 'email' | 'whatsapp' | 'note'>('note');
  const [loading, setLoading] = useState(false);
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [visitData, setVisitData] = useState({
    date: '',
    time: '',
    duration: 60,
    description: 'Visita para conhecer a escola e projeto pedagógico',
  });

  useEffect(() => {
    // Mock data is already set above
  }, [lead.id]);

  const addInteraction = async () => {
    if (!newInteraction.trim()) return;

    setLoading(true);
    
    // Add to local state for demo
    const newInteractionObj = {
      id: Date.now().toString(),
      type: interactionType,
      content: newInteraction,
      created_at: new Date().toISOString(),
      user_id: 'demo-user',
    };
    
    setInteractions(prev => [newInteractionObj, ...prev]);
    setNewInteraction('');
    setLoading(false);
  };

  const handleStageChange = async (newStageId: string) => {
    if (newStageId === currentStage) return;

    const oldStage = stages.find(s => s.id === currentStage);
    const newStage = stages.find(s => s.id === newStageId);
    
    if (!oldStage || !newStage) return;

    // Add stage change to history
    const stageChange: StageChange = {
      id: Date.now().toString(),
      from_stage: oldStage.name,
      to_stage: newStage.name,
      changed_at: new Date().toISOString(),
      changed_by: 'demo-user',
      changed_by_name: 'Usuário Demo',
    };

    setStageChanges(prev => [stageChange, ...prev]);
    setCurrentStage(newStageId);

    // Add interaction about stage change
    const stageInteraction = {
      id: (Date.now() + 1).toString(),
      type: 'note' as const,
      content: `Etapa alterada de "${oldStage.name}" para "${newStage.name}"`,
      created_at: new Date().toISOString(),
      user_id: 'demo-user',
    };
    
    setInteractions(prev => [stageInteraction, ...prev]);

    // Update lead
    const updatedLead = { ...lead, current_stage: newStageId };
    onUpdate(updatedLead);
  };

  const handleScheduleVisit = async () => {
    if (!visitData.date || !visitData.time) {
      alert('Por favor, preencha data e horário da visita');
      return;
    }

    setLoading(true);
    
    // Simular agendamento da visita
    const visitDateTime = new Date(`${visitData.date}T${visitData.time}`);
    console.log('Visita agendada:', {
      leadName: lead.student_name,
      date: visitDateTime,
      description: visitData.description,
      duration: visitData.duration,
    });
    
    // Adicionar interação sobre o agendamento
    const visitInteraction = {
      id: Date.now().toString(),
      type: 'visit' as const,
      content: `Visita agendada para ${visitDateTime.toLocaleDateString('pt-BR')} às ${visitDateTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
      created_at: new Date().toISOString(),
      user_id: 'demo-user',
    };
    
    setInteractions(prev => [visitInteraction, ...prev]);
    setShowVisitForm(false);
    setVisitData({
      date: '',
      time: '',
      duration: 60,
      description: 'Visita para conhecer a escola e projeto pedagógico',
    });
    
    setLoading(false);
    alert('Visita agendada com sucesso!');
  };

  const getCurrentStageName = () => {
    return stages.find(s => s.id === currentStage)?.name || 'Não definido';
  };

  const getCurrentStageColor = () => {
    return stages.find(s => s.id === currentStage)?.color || '#6B7280';
  };

  const getInteractionTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      call: 'Ligação',
      email: 'E-mail',
      whatsapp: 'WhatsApp',
      visit: 'Visita',
      note: 'Nota',
    };
    return types[type] || type;
  };

  const getInteractionColor = (type: string) => {
    const colors: Record<string, string> = {
      call: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
      email: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
      whatsapp: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
      visit: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
      note: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };
    return colors[type] || colors.note;
  };

  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white">
                  {lead.student_name}
                </Dialog.Title>
                {lead.parent_name && (
                  <p className="text-gray-600 dark:text-gray-400">
                    Responsável: {lead.parent_name}
                  </p>
                )}
                <div className="flex items-center mt-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Etapa atual:</span>
                  <span 
                    className="px-3 py-1 rounded-full text-sm font-semibold text-white"
                    style={{ backgroundColor: getCurrentStageColor() }}
                  >
                    {getCurrentStageName()}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Stage Management */}
            <div className="mb-6 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl border border-indigo-200 dark:border-indigo-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                  <ArrowRightIcon className="h-5 w-5 mr-2 text-indigo-600" />
                  Alterar Etapa do Lead
                </h3>
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition-all text-sm font-semibold"
                >
                  {editMode ? 'Cancelar' : 'Alterar Etapa'}
                </button>
              </div>
              
              {editMode && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Nova Etapa
                    </label>
                    <select
                      value={currentStage}
                      onChange={(e) => handleStageChange(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                    >
                      {stages.map((stage) => (
                        <option key={stage.id} value={stage.id}>
                          {stage.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-xl">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      <strong>Nota:</strong> A mudança de etapa será registrada automaticamente com data, hora e usuário responsável.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Lead Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  E-mail
                </label>
                <p className="text-gray-900 dark:text-white">{lead.email || 'Não informado'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Telefone
                </label>
                <p className="text-gray-900 dark:text-white">{lead.phone || 'Não informado'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Série/Ano
                </label>
                <p className="text-gray-900 dark:text-white">{lead.grade_level || 'Não informado'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Curso de Interesse
                </label>
                <p className="text-gray-900 dark:text-white">{lead.course_interest || 'Não informado'}</p>
              </div>
            </div>

            {/* Add New Interaction */}
            <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Nova Interação</h3>
              <div className="space-y-3">
                <select
                  value={interactionType}
                  onChange={(e) => setInteractionType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white"
                >
                  <option value="note">Nota</option>
                  <option value="call">Ligação</option>
                  <option value="email">E-mail</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newInteraction}
                    onChange={(e) => setNewInteraction(e.target.value)}
                    placeholder="Descreva a interação..."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white"
                  />
                  <button
                    onClick={addInteraction}
                    disabled={loading || !newInteraction.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-4 py-2 rounded-lg transition-all"
                  >
                    <PlusIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Schedule Visit Section */}
            <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2 text-green-600" />
                  Agendar Visita
                </h3>
                <button
                  onClick={() => setShowVisitForm(!showVisitForm)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl transition-all text-sm font-semibold"
                >
                  {showVisitForm ? 'Cancelar' : 'Nova Visita'}
                </button>
              </div>
              
              {showVisitForm && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Data da Visita
                      </label>
                      <input
                        type="date"
                        value={visitData.date}
                        onChange={(e) => setVisitData(prev => ({ ...prev, date: e.target.value }))}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Horário
                      </label>
                      <input
                        type="time"
                        value={visitData.time}
                        onChange={(e) => setVisitData(prev => ({ ...prev, time: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Duração
                    </label>
                    <select
                      value={visitData.duration}
                      onChange={(e) => setVisitData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                    >
                      <option value={30}>30 minutos</option>
                      <option value={60}>1 hora</option>
                      <option value={90}>1h 30min</option>
                      <option value={120}>2 horas</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Descrição
                    </label>
                    <textarea
                      value={visitData.description}
                      onChange={(e) => setVisitData(prev => ({ ...prev, description: e.target.value }))}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                      placeholder="Descrição da visita..."
                    />
                  </div>
                  
                  <button
                    onClick={handleScheduleVisit}
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center"
                  >
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    {loading ? 'Agendando...' : 'Agendar Visita'}
                  </button>
                </div>
              )}
            </div>
            {/* Interactions History */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Histórico de Interações</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {interactions.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    Nenhuma interação registrada
                  </p>
                ) : (
                  interactions.map((interaction) => (
                    <div
                      key={interaction.id}
                      className="bg-white dark:bg-gray-600 p-3 rounded-lg border border-gray-200 dark:border-gray-500"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getInteractionColor(interaction.type)}`}>
                          {getInteractionTypeLabel(interaction.type)}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(interaction.created_at).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-gray-900 dark:text-white text-sm">{interaction.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Stage Changes History */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <ArrowRightIcon className="h-5 w-5 mr-2 text-purple-600" />
                Histórico de Mudanças de Etapa
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {stageChanges.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    Nenhuma mudança de etapa registrada
                  </p>
                ) : (
                  stageChanges.map((change) => (
                    <div
                      key={change.id}
                      className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-1 bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 rounded-full text-xs font-semibold">
                            {change.from_stage}
                          </span>
                          <ArrowRightIcon className="h-4 w-4 text-gray-400" />
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 rounded-full text-xs font-semibold">
                            {change.to_stage}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(change.changed_at).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <UserIcon className="h-4 w-4 mr-1" />
                        <span>Alterado por: <strong>{change.changed_by_name}</strong></span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
