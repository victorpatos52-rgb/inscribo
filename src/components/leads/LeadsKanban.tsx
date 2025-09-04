// src/components/leads/LeadsKanban.tsx - VERSÃO ATUALIZADA
import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { PlusIcon, EyeIcon, PhoneIcon, EnvelopeIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { LeadModal } from './LeadModal';
import { NewLeadModal } from './NewLeadModal';
import { useLeads, Lead } from '../../hooks/useLeads';

interface Stage {
  id: string;
  name: string;
  color: string;
  order_index: number;
}

export function LeadsKanban() {
  const { leads, loading, error, refetch, updateLead } = useLeads();
  const [stages] = useState<Stage[]>([
    { id: '1', name: 'Novo', color: '#8B5CF6', order_index: 1 },
    { id: '2', name: 'Contato', color: '#06B6D4', order_index: 2 },
    { id: '3', name: 'Agendado', color: '#F59E0B', order_index: 3 },
    { id: '4', name: 'Visita', color: '#EC4899', order_index: 4 },
    { id: '5', name: 'Proposta', color: '#EF4444', order_index: 5 },
    { id: '6', name: 'Matrícula', color: '#10B981', order_index: 6 },
  ]);
  
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const leadId = result.draggableId;
    const newStageId = result.destination.droppableId;

    // Atualizar otimisticamente na UI
    const leadToUpdate = leads.find(lead => lead.id === leadId);
    if (leadToUpdate && leadToUpdate.current_stage !== newStageId) {
      try {
        await updateLead(leadId, { current_stage: newStageId });
        console.log('✅ Lead movido com sucesso');
      } catch (error) {
        console.error('❌ Erro ao mover lead:', error);
        // A UI já foi atualizada otimisticamente pelo hook
      }
    }
  };

  const getLeadsByStage = (stageId: string) => {
    return leads.filter(lead => lead.current_stage === stageId);
  };

  const handleUpdateLead = (updatedLead: Lead) => {
    // O hook já cuida da atualização
    setSelectedLead(null);
  };

  const getSourceColor = (source: string) => {
    const colors: Record<string, string> = {
      website: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
      facebook: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
      instagram: 'bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-300',
      google: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
      indicacao: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
      outdoor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
      outros: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };
    return colors[source] || colors.outros;
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="ml-4 text-gray-600 dark:text-gray-400">Carregando leads...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Funil de Leads
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Gerencie seus leads através do funil de vendas
            </p>
            {error && (
              <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-800 rounded-lg">
                <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                  ⚠️ {error} (usando dados de demonstração)
                </p>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={refetch}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-xl flex items-center transition-all"
              title="Atualizar dados"
            >
              <ArrowPathIcon className="h-5 w-5 mr-2" />
              Atualizar
            </button>
            <button
              onClick={() => setShowNewLeadModal(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl flex items-center transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Novo Lead
            </button>
          </div>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-6 lg:overflow-x-auto lg:flex lg:pb-4">
            {stages.map((stage) => (
              <div key={stage.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-100 dark:border-gray-700 min-w-[280px] lg:min-w-[320px] flex-shrink-0">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-gray-900 dark:text-white text-base lg:text-lg">{stage.name}</h3>
                  <div
                    className="px-2 py-1 rounded-full text-xs font-bold text-white shadow-md min-w-[24px] text-center"
                    style={{ backgroundColor: stage.color }}
                  >
                    {getLeadsByStage(stage.id).length}
                  </div>
                </div>

                <Droppable droppableId={stage.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[300px] space-y-4 transition-all duration-200 ${
                        snapshot.isDraggingOver 
                          ? 'bg-gradient-to-b from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl' 
                          : ''
                      } p-1`}
                    >
                      {getLeadsByStage(stage.id).map((lead, index) => (
                        <Draggable key={lead.id} draggableId={lead.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-white dark:bg-gray-700 p-3 lg:p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-600 cursor-pointer hover:shadow-xl transition-all duration-200 ${
                                snapshot.isDragging ? 'rotate-3 shadow-2xl scale-105' : 'hover:scale-102'
                              }`}
                            >
                              <div className="flex items-start justify-between mb-3">
                                <h4 className="font-bold text-gray-900 dark:text-white text-sm lg:text-base">
                                  {lead.student_name}
                                </h4>
                                <button
                                  onClick={() => setSelectedLead(lead)}
                                  className="p-2 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all"
                                >
                                  <EyeIcon className="h-4 w-4" />
                                </button>
                              </div>
                              
                              {lead.parent_name && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">
                                  <span className="text-xs">👤</span> {lead.parent_name}
                                </p>
                              )}
                              
                              {lead.assigned_to && (
                                <p className="text-xs text-purple-600 dark:text-purple-400 mb-2 font-semibold bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded-lg">
                                  <span className="text-xs">👨‍💼</span> {lead.assigned_to}
                                </p>
                              )}
                              
                              {lead.course_interest && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                  <span className="text-xs">🎓</span> {lead.course_interest}
                                </p>
                              )}

                              <div className="flex items-center justify-between mb-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getSourceColor(lead.source)}`}>
                                  {lead.source}
                                </span>
                                {lead.grade_level && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                    {lead.grade_level}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center justify-between text-xs text-gray-400">
                                <div className="flex space-x-2">
                                  {lead.phone && (
                                    <PhoneIcon className="h-3 w-3 text-green-500" />
                                  )}
                                  {lead.email && (
                                    <EnvelopeIcon className="h-3 w-3 text-blue-500" />
                                  )}
                                </div>
                                <span className="text-xs">
                                  {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                                </span>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>

        {/* Empty State */}
        {leads.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                <PlusIcon className="h-12 w-12 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Nenhum lead encontrado
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Comece criando seu primeiro lead para aparecer no funil de vendas.
              </p>
              <button
                onClick={() => setShowNewLeadModal(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl transition-all"
              >
                Criar Primeiro Lead
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedLead && (
        <LeadModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdate={handleUpdateLead}
        />
      )}

      {showNewLeadModal && (
        <NewLeadModal
          onClose={() => setShowNewLeadModal(false)}
          onSave={() => {
            setShowNewLeadModal(false);
            refetch(); // Recarregar dados após criar
          }}
        />
      )}
    </>
  );
}
