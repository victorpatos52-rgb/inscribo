import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { supabase } from '../../lib/supabase'; // Certifique-se de importar o supabase

export function LeadsKanban() {
  const [leads, setLeads] = useState<Lead[]>([]);

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const leadId = result.draggableId;
    const newStageId = result.destination.droppableId;

    setLoading(true); // Inicia o carregamento

    // Atualiza o estado local
    setLeads(prevLeads =>
      prevLeads.map(lead =>
        lead.id === leadId
          ? { ...lead, current_stage: newStageId, updated_at: new Date().toISOString() }
          : lead
      )
    );

    // Atualiza o estágio no banco de dados
    try {
      const { data, error } = await supabase
        .from('leads')
        .update({ current_stage: newStageId, updated_at: new Date().toISOString() })
        .eq('id', leadId);

      if (error) throw error;

      console.log('Lead atualizado no Supabase:', data);
    } catch (error) {
      console.error('Erro ao atualizar lead no Supabase:', error);
    } finally {
      setLoading(false); // Finaliza o carregamento
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      {/* Restante do código */}
    </DragDropContext>
  );
}
