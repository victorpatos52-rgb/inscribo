import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, PlusIcon, CalendarIcon, ArrowRightIcon, UserIcon } from '@heroicons/react/24/outline';
import { supabase } from '../services/supabaseClient';

interface LeadModalProps {
  lead: {
    id: string;
    student_name: string;
    parent_name?: string | null;
    email?: string | null;
    phone?: string | null;
    grade_level?: string | null;
    course_interest?: string | null;
    current_stage?: string | null;
    notes?: string | null;
  };
  onClose: () => void;
  onUpdate: (updatedLead: any) => void;
}

interface Interaction {
  id: string;
  type: 'call' | 'email' | 'whatsapp' | 'note' | 'visit';
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

export function LeadModal({ lead, onClose, onUpdate }: LeadModalProps) {
  const stages = [
    { id: '1', name: 'Novo', color: '#8B5CF6' },
    { id: '2', name: 'Contato', color: '#06B6D4' },
    { id: '3', name: 'Agendado', color: '#F59E0B' },
    { id: '4', name: 'Visita', color: '#EC4899' },
    { id: '5', name: 'Proposta', color: '#EF4444' },
    { id: '6', name: 'Matrícula', color: '#10B981' },
  ];

  const [currentStage, setCurrentStage] = useState(lead.current_stage || '1');
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [stageChanges, setStageChanges] = useState<StageChange[]>([]);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [newInteraction, setNewInteraction] = useState('');
  const [interactionType, setInteractionType] = useState<'call' | 'email' | 'whatsapp' | 'note'>('note');
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [visitData, setVisitData] = useState({ date: '', time: '', duration: 60, description: 'Visita para conhecer a escola e projeto pedagógico' });

  // ===== Carregar interações e histórico =====
  useEffect(() => {
    if (!lead.id) return;

    const fetchInteractions = async () => {
      const { data, error } = await supabase
        .from('interactions')
        .select('*')
        .eq('lead_id', lead.id)
        .order('created_at', { ascending: false });

      if (error) console.error('Erro ao buscar interações:', error);
      else setInteractions(data);
    };

    const fetchStageChanges = async () => {
      const { data, error } = await supabase
        .from('lead_stages')
        .select('*')
        .eq('lead_id', lead.id)
        .order('changed_at', { ascending: false });

      if (error) console.error('Erro ao buscar histórico de etapas:', error);
      else setStageChanges(data);
    };

    fetchInteractions();
    fetchStageChanges();
  }, [lead.id]);

  // ===== Adicionar nova interação =====
  const addInteraction = async () => {
    if (!newInteraction.trim()) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('interactions')
      .insert([{
        lead_id: lead.id,
        type: interactionType,
        content: newInteraction,
        user_id: 'demo-user', // substituir pelo usuário logado
      }])
      .select();

    if (error) alert('Erro ao salvar interação: ' + error.message);
    else setInteractions(prev => [data[0], ...prev]);

    setNewInteraction('');
    setLoading(false);
  };

  // ===== Alterar etapa do lead =====
  const handleStageChange = async (newStageId: string) => {
    if (newStageId === currentStage) return;
    setLoading(true);

    const oldStage = stages.find(s => s.id === currentStage);
    const newStage = stages.find(s => s.id === newStageId);
    if (!oldStage || !newStage) return;

    // Atualiza lead no Supabase
    const { data: leadData, error: leadError } = await supabase
      .from('leads')
      .update({ current_stage: newStageId })
      .eq('id', lead.id)
      .select();

    if (leadError) alert('Erro ao atualizar etapa: ' + leadError.message);
    else setCurrentStage(newStageId);

    // Salvar histórico de etapa
    const { data: stageData, error: stageError } = await supabase
      .from('lead_stages')
      .insert([{
        lead_id: lead.id,
        from_stage: oldStage.name,
        to_stage: newStage.name,
        changed_at: new Date().toISOString(),
        changed_by: 'demo-user',
        changed_by_name: 'Usuário Demo',
      }])
      .select();

    if (stageError) console.error('Erro ao salvar histórico de etapas:', stageError);
    else setStageChanges(prev => [stageData[0], ...prev]);

    onUpdate(leadData?.[0]);
    setLoading(false);
  };

  // ===== Agendar visita =====
  const handleScheduleVisit = async () => {
    if (!visitData.date || !visitData.time) {
      alert('Por favor, preencha data e horário da visita');
      return;
    }
    setLoading(true);

    const visitDateTime = new Date(`${visitData.date}T${visitData.time}`);

    const { data, error } = await supabase
      .from('interactions')
      .insert([{
        lead_id: lead.id,
        type: 'visit',
        content: `Visita agendada para ${visitDateTime.toLocaleDateString('pt-BR')} às ${visitDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        user_id: 'demo-user',
      }])
      .select();

    if (error) alert('Erro ao agendar visita: ' + error.message);
    else setInteractions(prev => [data[0], ...prev]);

    setVisitData({ date: '', time: '', duration: 60, description: 'Visita para conhecer a escola e projeto pedagógico' });
    setShowVisitForm(false);
    setLoading(false);
    alert('Visita agendada com sucesso!');
  };

  const getCurrentStageColor = () => stages.find(s => s.id === currentStage)?.color || '#6B7280';

  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div>
              <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white">
                {lead.student_name}
              </Dialog.Title>
              {lead.parent_name && <p className="text-gray-600 dark:text-gray-400">Responsável: {lead.parent_name}</p>}
              <span className="px-3 py-1 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: getCurrentStageColor() }}>
                {stages.find(s => s.id === currentStage)?.name || 'Não definido'}
              </span>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6">
            {/* Alterar etapa */}
            <div className="mb-6 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl border border-indigo-200 dark:border-indigo-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center"><ArrowRightIcon className="h-5 w-5 mr-2 text-indigo-600" />Alterar Etapa do Lead</h3>
                <button onClick={() => setEditMode(!editMode)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition-all text-sm font-semibold">
                  {editMode ? 'Cancelar' : 'Alterar Etapa'}
                </button>
              </div>
              {editMode && (
                <select
                  value={currentStage}
                  onChange={(e) => handleStageChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                >
                  {stages.map(stage => <option key={stage.id} value={stage.id}>{stage.name}</option>)}
                </select>
              )}
            </div>

            {/* Nova interação */}
            <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Nova Interação</h3>
              <div className="flex space-x-2">
                <select value={interactionType} onChange={e => setInteractionType(e.target.value as any)} className="px-3 py-2 border rounded-lg dark:bg-gray-600 dark:text-white">
                  <option value="note">Nota</option>
                  <option value="call">Ligação</option>
                  <option value="email">E-mail</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
                <input type="text" value={newInteraction} onChange={e => setNewInteraction(e.target.value)} placeholder="Descreva a interação..." className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-600 dark:text-white" />
                <button onClick={addInteraction} disabled={loading || !newInteraction.trim()} className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-4 py-2 rounded-lg transition-all">
                  <PlusIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Agendar visita */}
            <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl border border-green-200 dark:border-green-800">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center"><CalendarIcon className="h-5 w-5 mr-2 text-green-600" />Agendar Visita</h3>
                <button onClick={() => setShowVisitForm(!showVisitForm)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl transition-all text-sm font-semibold">{showVisitForm ? 'Cancelar' : 'Nova Visita'}</button>
              </div>
              {showVisitForm && (
                <div className="space-y-4">
                  <input type="date" value={visitData.date} onChange={e => setVisitData(prev => ({ ...prev, date: e.target.value }))} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white" />
                  <input type="time" value={visitData.time} onChange={e => setVisitData(prev => ({ ...prev, time: e.target.value }))} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white" />
                  <textarea value={visitData.description} onChange={e => setVisitData(prev => ({ ...prev, description: e.target.value }))} rows={2} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white" />
                  <button onClick={handleScheduleVisit} disabled={loading} className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center">
                    <CalendarIcon className="h-5 w-5 mr-2" />{loading ? 'Agendando...' : 'Agendar Visita'}
                  </button>
                </div>
              )}
            </div>

            {/* Histórico de interações */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Histórico de Interações</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {interactions.length === 0 ? <p className="text-gray-500 dark:text-gray-400 text-center py-4">Nenhuma interação registrada</p> :
                  interactions.map(i => (
                    <div key={i.id} className="bg-white dark:bg-gray-600 p-3 rounded-lg border border-gray-200 dark:border-gray-500">
                      <div className="flex justify-between mb-2">
                        <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 text-xs font-medium">{i.type}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(i.created_at).toLocaleString('pt-BR')}</span>
                      </div>
                      <p className="text-gray-900 dark:text-white text-sm">{i.content}</p>
                    </div>
                  ))
                }
              </div>
            </div>

            {/* Histórico de etapas */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center"><ArrowRightIcon className="h-5 w-5 mr-2 text-purple-600" />Histórico de Mudanças de Etapa</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {stageChanges.length === 0 ? <p className="text-gray-500 dark:text-gray-400 text-center py-4">Nenhuma mudança de etapa registrada</p> :
                  stageChanges.map(c => (
                    <div key={c.id} className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                      <div className="flex justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-1 bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 rounded-full text-xs font-semibold">{c.from_stage}</span>
                          <ArrowRightIcon className="h-4 w-4 text-gray-400" />
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 rounded-full text-xs font-semibold">{c.to_stage}</span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(c.changed_at).toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400"><UserIcon className="h-4 w-4 mr-1" />Alterado por: <strong>{c.changed_by_name}</strong></div>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
