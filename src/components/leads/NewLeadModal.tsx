import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, UserIcon, AcademicCapIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { supabase } from '../../lib/supabase'; // Certifique-se de importar o supabase

interface Lead {
  student_name: string;
  parent_name: string;
  email: string;
  phone: string;
  grade_level: string;
  course_interest: string;
  source: string;
  notes: string;
  current_stage: string;
  birth_date: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  parent_phone: string;
  parent_email: string;
  emergency_contact: string;
  emergency_phone: string;
  medical_info: string;
  previous_school: string;
  transfer_reason: string;
  interests: string;
  learning_difficulties: string;
  family_income: string;
  scholarship_interest: boolean;
}

interface NewLeadModalProps {
  onClose: () => void;
  onSave: (lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => void;
}

export function NewLeadModal({ onClose, onSave }: NewLeadModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [scheduleVisit, setScheduleVisit] = useState(false);
  const [visitData, setVisitData] = useState({
    date: '',
    time: '',
    description: 'Visita para conhecer a escola e projeto pedagógico',
  });
  const [formData, setFormData] = useState<Lead>({
    student_name: '',
    parent_name: '',
    email: '',
    phone: '',
    grade_level: '',
    course_interest: '',
    source: 'website',
    notes: '',
    current_stage: '1',
    birth_date: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    parent_phone: '',
    parent_email: '',
    emergency_contact: '',
    emergency_phone: '',
    medical_info: '',
    previous_school: '',
    transfer_reason: '',
    interests: '',
    learning_difficulties: '',
    family_income: '',
    scholarship_interest: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const steps = [
    { id: 1, title: 'Dados Básicos', icon: UserIcon },
    { id: 2, title: 'Informações Acadêmicas', icon: AcademicCapIcon },
    { id: 3, title: 'Contato e Endereço', icon: PhoneIcon },
    { id: 4, title: 'Informações Adicionais', icon: EnvelopeIcon },
  ];

  // Função de Inserção de Lead no Supabase
  const handleSaveLead = async (leadData: Lead) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('leads')
        .insert([leadData]);

      if (error) throw error;

      console.log('Lead inserido com sucesso:', data);
    } catch (err: any) {
      console.error('Erro ao salvar lead no Supabase:', err);
      setError('Erro ao salvar lead');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Chama a função para salvar o lead no Supabase
      await handleSaveLead(formData);
      
      // Se agendou visita, criar a visita também
      if (scheduleVisit && visitData.date && visitData.time) {
        const visitDateTime = new Date(`${visitData.date}T${visitData.time}`);
        // Aqui você pode adicionar a lógica para criar a visita
        console.log('Visita agendada:', {
          leadName: formData.student_name,
          date: visitDateTime,
          description: visitData.description,
        });
      }
      
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar lead');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof Lead, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={true} onClose={onClose}>
      {/* Restante do código de renderização do modal */}
      <form onSubmit={handleSubmit}>
        {/* Campos de entrada */}
        <button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar Lead'}
        </button>
      </form>
    </Dialog>
  );
}
