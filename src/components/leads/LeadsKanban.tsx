import React, { useEffect, useState } from ‘react’;
import { DragDropContext, Droppable, Draggable } from ‘@hello-pangea/dnd’;
import { PlusIcon, EyeIcon, PhoneIcon, EnvelopeIcon, ExclamationTriangleIcon } from ‘@heroicons/react/24/outline’;
import { LeadModal } from ‘./LeadModal’;
import { NewLeadModal } from ‘./NewLeadModal’;
import { supabase } from ‘../../lib/supabase’;

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
source: string;
assigned_to?: string | null;
created_at: string;
updated_at: string;
}

interface Stage {
id: string;
name: string;
color: string;
order_index: number;
}

// Serviço para leads
const leadService = {
async getAll(): Promise<Lead[]> {
if (!supabase) {
console.warn(‘⚠️ Supabase não configurado - usando dados mock’);
return mockLeads;
}

```
try {
  console.log('🔍 Buscando leads do Supabase...');
  
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Erro ao buscar leads:', error);
    throw error;
  }

  console.log('✅ Leads encontrados:', data?.length || 0);
  return data || [];
} catch (error) {
  console.error('💥 Erro ao buscar leads:', error);
  throw error;
}
```

},

async create(leadData: Omit<Lead, ‘id’ | ‘created_at’ | ‘updated_at’>): Promise<Lead> {
if (!supabase) {
console.warn(‘⚠️ Supabase não configurado - criando lead localmente’);
return {
…leadData,
id: Date.now().toString(),
created_at: new Date().toISOString(),
updated_at: new Date().toISOString(),
};
}

```
try {
  console.log('📝 Criando lead no Supabase...');
  
  const { data, error } = await supabase
    .from('leads')
    .insert([{
      ...leadData,
      institution_id: '00000000-0000-0000-0000-000000000001', // ID padrão
    }])
    .select()
    .single();

  if (error) {
    console.error('❌ Erro ao criar lead:', error);
    throw error;
  }

  console.log('✅ Lead criado:', data);
  return data;
} catch (error) {
  console.error('💥 Erro ao criar lead:', error);
  throw error;
}
```

},

async update(id: string, updates: Partial<Lead>): Promise<Lead> {
if (!supabase) {
console.warn(‘⚠️ Supabase não configurado - atualizando lead localmente’);
return { …updates, id, updated_at: new Date().toISOString() } as Lead;
}

```
try {
  console.log('📝 Atualizando lead no Supabase...', id);
  
  const { data, error } = await supabase
    .from('leads')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('❌ Erro ao atualizar lead:', error);
    throw error;
  }

  console.log('✅ Lead atualizado:', data);
  return data;
} catch (error) {
  console.error('💥 Erro ao atualizar lead:', error);
  throw error;
}
```

}
};

// Dados mock para fallback
const mockLeads: Lead[] = [
{
id: ‘1’,
student_name: ‘Ana Silva’,
parent_name: ‘Maria Silva’,
email: ‘maria@email.com’,
phone: ‘(11) 99999-9999’,
grade_level: ‘1º EM’,
course_interest: ‘Ensino Médio’,
current_stage: ‘1’,
notes: ‘Interessada em conhecer a escola. Procura por ensino de qualidade.’,
source: ‘website’,
assigned_to: ‘João Santos’,
created_at: new Date().toISOString(),
updated_at: new Date().toISOString(),
},
{
id: ‘2’,
student_name: ‘João Santos’,
parent_name: ‘Pedro Santos’,
email: ‘pedro@email.com’,
phone: ‘(11) 88888-8888’,
grade_level: ‘6º ano’,
course_interest: ‘Ensino Fundamental’,
current_stage: ‘2’,
notes: ‘Já fez contato inicial. Interessado em atividades extracurriculares.’,
source: ‘indicacao’,
assigned_to: ‘Maria Costa’,
created_at: new Date(Date.now() - 86400000).toISOString(),
updated_at: new Date().toISOString(),
},
{
id: ‘3’,
student_name: ‘Carla Oliveira’,
parent_name: ‘Ana Oliveira’,
email: ‘ana@email.com’,
phone: ‘(11) 77777-7777’,
grade_level: ‘3º EM’,
course_interest: ‘Pré-vestibular’,
current_stage: ‘3’,
notes: ‘Visita agendada para próxima semana. Foco em preparação para vestibular.’,
source: ‘facebook’,
assigned_to: ‘João Santos’,
created_at: new Date(Date.now() - 172800000).toISOString(),
updated_at: new Date().toISOString(),
},
{
id: ‘4’,
student_name: ‘Lucas Costa’,
parent_name: ‘Roberto Costa’,
email: ‘roberto@email.com’,
phone: ‘(11) 66666-6666’,
grade_level: ‘2º EM’,
course_interest: ‘Ensino Médio’,
current_stage: ‘4’,
notes: ‘Visitou a escola ontem. Muito interessado no laboratório de ciências.’,
source: ‘google’,
assigned_to: ‘Ana Lima’,
created_at: new Date(Date.now() - 259200000).toISOString(),
updated_at: new Date().toISOString(),
},
{
id: ‘5’,
student_name: ‘Beatriz Lima’,
parent_name: ‘Fernanda Lima’,
email: ‘fernanda@email.com’,
phone: ‘(11) 55555-5555’,
grade_level: ‘9º ano’,
course_interest: ‘Ensino Fundamental’,
current_stage: ‘5’,
notes: ‘Proposta enviada. Aguardando retorno da família.’,
source: ‘instagram’,
assigned_to: ‘Maria Costa’,
created_at: new Date(Date.now() - 345600000).toISOString(),
updated_at: new Date().toISOString(),
},
{
id: ‘6’,
student_name: ‘Gabriel Souza’,
parent_name: ‘Marcos Souza’,
email: ‘marcos@email.com’,
phone: ‘(11) 44444-4444’,
grade_level: ‘1º ano’,
course_interest: ‘Ensino Fundamental’,
current_stage: ‘6’,
notes: ‘Matrícula confirmada! Início das aulas em fevereiro.’,
source: ‘indicacao’,
assigned_to: ‘João Santos’,
created_at: new Date(Date.now() - 432000000).toISOString(),
updated_at: new Date().toISOString(),
},
];

export function LeadsKanban() {
const [stages, setStages] = useState<Stage[]>([
{ id: ‘1’, name: ‘Novo’, color: ‘#8B5CF6’, order_index: 1 },
{ id: ‘2’, name: ‘Contato’, color: ‘#06B6D4’, order_index: 2 },
{ id: ‘3’, name: ‘Agendado’, color: ‘#F59E0B’, order_index: 3 },
{ id: ‘4’, name: ‘Visita’, color: ‘#EC4899’, order_index: 4 },
{ id: ‘5’, name: ‘Proposta’, color: ‘#EF4444’, order_index: 5 },
{ id: ‘6’, name: ‘Matrícula’, color: ‘#10B981’, order_index: 6 },
]);

const [leads, setLeads] = useState<Lead[]>([]);
const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
const [showNewLeadModal, setShowNewLeadModal] = useState(false);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

// 🔧 BUSCAR LEADS DO SUPABASE
const fetchLeads = async () => {
try {
setLoading(true);
setError(null);
console.log(‘🔍 Carregando leads…’);

```
  const data = await leadService.getAll();
  
  if (data && data.length > 0) {
    console.log('✅ Leads carregados do Supabase:', data.length);
    setLeads(data);
  } else {
    console.log('⚠️ Nenhum lead encontrado, usando dados mock');
    setLeads(mockLeads);
  }

} catch (err: any) {
  console.error('❌ Erro ao buscar leads:', err);
  setError('Erro ao carregar leads. Usando dados de demonstração.');
  setLeads(mockLeads);
} finally {
  setLoading(false);
}
```

};

// Carregar leads ao montar componente
useEffect(() => {
fetchLeads();
}, []);

// 🔧 MOVER LEAD ENTRE ESTÁGIOS
const handleDragEnd = async (result: any) => {
if (!result.destination) return;

```
const leadId = result.draggableId;
const newStageId = result.destination.droppableId;

// Atualização otimista (UI primeiro)
setLeads(prevLeads =>
  prevLeads.map(lead =>
    lead.id === leadId
      ? { ...lead, current_stage: newStageId, updated_at: new Date().toISOString() }
      : lead
  )
);

try {
  // Atualizar no Supabase
  await leadService.update(leadId, { current_stage: newStageId });
  console.log('✅ Lead movido com sucesso');
} catch (err: any) {
  console.error('❌ Erro ao mover lead:', err);
  
  // Reverter mudança em caso de erro
  setLeads(prevLeads =>
    prevLeads.map(lead =>
      lead.id === leadId
        ? { ...lead, current_stage: result.source.droppableId }
        : lead
    )
  );
  
  alert(`❌ Erro ao mover lead: ${err.message}`);
}
```

};

// 🔧 CRIAR NOVO LEAD
const handleNewLead = async (newLeadData: Omit<Lead, ‘id’ | ‘created_at’ | ‘updated_at’>) => {
try {
console.log(‘📝 Criando novo lead…’);

```
  const newLead = await leadService.create(newLeadData);
  
  // Adicionar à lista local
  setLeads(prev => [newLead, ...prev]);
  
  console.log('✅ Lead criado com sucesso');
  
} catch (err: any) {
  console.error('❌ Erro ao criar lead:', err);
  
  // Se falhar, criar localmente
  const lead: Lead = {
    ...newLeadData,
    id: Date.now().toString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  setLeads(prev => [lead, ...prev]);
  
  alert(`⚠️ Lead criado localmente. Erro no servidor: ${err.message}`);
}
```

};

// 🔧 ATUALIZAR LEAD
const handleUpdateLead = async (updatedLead: Lead) => {
try {
console.log(‘📝 Atualizando lead…’);

```
  const updated = await leadService.update(updatedLead.id, updatedLead);
  
  // Atualizar na lista local
  setLeads(prev => prev.map(lead => 
    lead.id === updatedLead.id ? updated : lead
  ));
  
  setSelectedLead(null);
  console.log('✅ Lead atualizado com sucesso');
  
} catch (err: any) {
  console.error('❌ Erro ao atualizar lead:', err);
  
  // Atualizar localmente mesmo com erro
  setLeads(prev => prev.map(lead => 
    lead.id === updatedLead.id 
      ? { ...updatedLead, updated_at: new Date().toISOString() }
      : lead
  ));
  
  setSelectedLead(null);
  alert(`⚠️ Lead atualizado localmente. Erro no servidor: ${err.message}`);
}
```

};

const getLeadsByStage = (stageId: string) => {
return leads.filter(lead => lead.current_stage === stageId);
};

const getSourceColor = (source: string) => {
const colors: Record<string, string> = {
website: ‘bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300’,
facebook: ‘bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300’,
instagram: ‘bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-300’,
google: ‘bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300’,
indicacao: ‘bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300’,
outdoor: ‘bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300’,
outros: ‘bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300’,
};
return colors[source] || colors.outros;
};

if (loading) {
return (
<div className="flex items-center justify-center h-96">
<div className="text-center">
<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
<p className="text-gray-600 dark:text-gray-400 text-lg">Carregando leads…</p>
<p className="text-gray-500 dark:text-gray-500 text-sm">Conectando com o banco de dados</p>
</div>
</div>
);
}

return (
<>
<div className="p-8">
{/* Header */}
<div className="flex items-center justify-between mb-8">
<div>
<h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
Funil de Leads
</h2>
<p className="text-gray-600 dark:text-gray-400 mt-2">
Gerencie seus leads através do funil de vendas
</p>
</div>
<div className="flex gap-4">
<button
onClick={fetchLeads}
disabled={loading}
className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center transition-all disabled:cursor-not-allowed"
>
🔄 Atualizar
</button>
<button
onClick={() => setShowNewLeadModal(true)}
className=“bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl flex items-center transition-all transform hover:scale-105 shadow-lg hover:shadow-xl”
>
<PlusIcon className="h-5 w-5 mr-2" />
Novo Lead
</button>
</div>
</div>

```
    {/* Alerta de erro */}
    {error && (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-xl mb-6">
        <div className="flex items-center">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-3" />
          <div>
            <p className="text-yellow-800 dark:text-yellow-300 font-medium">Aviso</p>
            <p className="text-yellow-700 dark:text-yellow-400 text-sm">{error}</p>
          </div>
        </div>
      </div>
    )}

    {/* Kanban Board */}
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
      onSave={handleNewLead}
    />
  )}
</>
```

);
}
