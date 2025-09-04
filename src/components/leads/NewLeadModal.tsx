// src/components/leads/NewLeadModal.tsx - VERSÃO ATUALIZADA
import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, UserIcon, AcademicCapIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { useLeads, Lead } from '../../hooks/useLeads';
import { useVisits } from '../../hooks/useVisits';

interface NewLeadModalProps {
  onClose: () => void;
  onSave: () => void;
}

export function NewLeadModal({ onClose, onSave }: NewLeadModalProps) {
  const { createLead } = useLeads();
  const { createVisit } = useVisits();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [scheduleVisit, setScheduleVisit] = useState(false);
  const [visitData, setVisitData] = useState({
    date: '',
    time: '',
    description: 'Visita para conhecer a escola e projeto pedagógico',
  });
  const [formData, setFormData] = useState({
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('📝 Criando novo lead...');

      // Preparar dados do lead removendo campos undefined
      const leadData = Object.fromEntries(
        Object.entries(formData).filter(([_, v]) => v !== '' && v !== undefined)
      ) as Omit<Lead, 'id' | 'created_at' | 'updated_at'>;

      // Criar o lead
      const newLead = await createLead(leadData);
      console.log('✅ Lead criado:', newLead);
      
      // Se agendou visita, criar a visita também
      if (scheduleVisit && visitData.date && visitData.time && newLead) {
        try {
          console.log('📅 Agendando visita...');
          
          const visitDateTime = new Date(`${visitData.date}T${visitData.time}`);
          
                      await createVisit({
            lead_id: newLead.id,
            scheduled_by: null, // Será preenchido pelo hook
            title: `Visita - ${formData.student_name}`,
            description: visitData.description,
            scheduled_date: visitDateTime.toISOString(),
            duration_minutes: 60,
            status: 'scheduled',
            notes: null,
          });
          
          console.log('✅ Visita agendada com sucesso');
        } catch (visitError: any) {
          console.error('❌ Erro ao agendar visita:', visitError);
          // Não impedir o salvamento do lead por erro na visita
        }
      }
      
      alert('Lead criado com sucesso!' + (scheduleVisit && visitData.date ? ' Visita agendada.' : ''));
      onSave();
      onClose();
    } catch (err: any) {
      console.error('💥 Erro ao salvar lead:', err);
      setError(err.message || 'Erro ao salvar lead');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Nome do Aluno *
                </label>
                <input
                  type="text"
                  value={formData.student_name}
                  onChange={(e) => handleChange('student_name', e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  placeholder="Nome completo do aluno"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Data de Nascimento
                </label>
                <input
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => handleChange('birth_date', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Nome do Responsável *
                </label>
                <input
                  type="text"
                  value={formData.parent_name}
                  onChange={(e) => handleChange('parent_name', e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  placeholder="Nome do pai/mãe/responsável"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Fonte do Lead
                </label>
                <select
                  value={formData.source}
                  onChange={(e) => handleChange('source', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                >
                  <option value="website">Website</option>
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                  <option value="google">Google</option>
                  <option value="indicacao">Indicação</option>
                  <option value="outdoor">Outdoor</option>
                  <option value="outros">Outros</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Série/Ano Desejado
                </label>
                <select
                  value={formData.grade_level}
                  onChange={(e) => handleChange('grade_level', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                >
                  <option value="">Selecionar</option>
                  <option value="Berçário">Berçário</option>
                  <option value="Maternal">Maternal</option>
                  <option value="Pré I">Pré I</option>
                  <option value="Pré II">Pré II</option>
                  <option value="1º ano">1º ano</option>
                  <option value="2º ano">2º ano</option>
                  <option value="3º ano">3º ano</option>
                  <option value="4º ano">4º ano</option>
                  <option value="5º ano">5º ano</option>
                  <option value="6º ano">6º ano</option>
                  <option value="7º ano">7º ano</option>
                  <option value="8º ano">8º ano</option>
                  <option value="9º ano">9º ano</option>
                  <option value="1º EM">1º EM</option>
                  <option value="2º EM">2º EM</option>
                  <option value="3º EM">3º EM</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Curso de Interesse
                </label>
                <input
                  type="text"
                  value={formData.course_interest}
                  onChange={(e) => handleChange('course_interest', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  placeholder="Ex: Ensino Fundamental, Ensino Médio"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Escola Anterior
                </label>
                <input
                  type="text"
                  value={formData.previous_school}
                  onChange={(e) => handleChange('previous_school', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  placeholder="Nome da escola anterior"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Motivo da Transferência
                </label>
                <input
                  type="text"
                  value={formData.transfer_reason}
                  onChange={(e) => handleChange('transfer_reason', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  placeholder="Motivo da mudança de escola"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Interesses e Atividades
              </label>
              <textarea
                value={formData.interests}
                onChange={(e) => handleChange('interests', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                placeholder="Esportes, artes, música, etc."
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Telefone do Responsável
                </label>
                <input
                  type="tel"
                  value={formData.parent_phone}
                  onChange={(e) => handleChange('parent_phone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  E-mail do Responsável
                </label>
                <input
                  type="email"
                  value={formData.parent_email}
                  onChange={(e) => handleChange('parent_email', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  placeholder="email@exemplo.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Endereço Completo
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                placeholder="Rua, número, complemento"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Cidade
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  placeholder="São Paulo"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Estado
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  placeholder="SP"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  CEP
                </label>
                <input
                  type="text"
                  value={formData.zip_code}
                  onChange={(e) => handleChange('zip_code', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  placeholder="00000-000"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Contato de Emergência
                </label>
                <input
                  type="text"
                  value={formData.emergency_contact}
                  onChange={(e) => handleChange('emergency_contact', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  placeholder="Nome do contato de emergência"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Telefone de Emergência
                </label>
                <input
                  type="tel"
                  value={formData.emergency_phone}
                  onChange={(e) => handleChange('emergency_phone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Informações Médicas
              </label>
              <textarea
                value={formData.medical_info}
                onChange={(e) => handleChange('medical_info', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                placeholder="Alergias, medicamentos, condições especiais..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Dificuldades de Aprendizagem
              </label>
              <textarea
                value={formData.learning_difficulties}
                onChange={(e) => handleChange('learning_difficulties', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                placeholder="Descreva qualquer dificuldade de aprendizagem conhecida..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Renda Familiar (Opcional)
                </label>
                <select
                  value={formData.family_income}
                  onChange={(e) => handleChange('family_income', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                >
                  <option value="">Não informar</option>
                  <option value="ate-2sm">Até 2 salários mínimos</option>
                  <option value="2-5sm">2 a 5 salários mínimos</option>
                  <option value="5-10sm">5 a 10 salários mínimos</option>
                  <option value="10-20sm">10 a 20 salários mínimos</option>
                  <option value="acima-20sm">Acima de 20 salários mínimos</option>
                </select>
              </div>
              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.scholarship_interest}
                    onChange={(e) => handleChange('scholarship_interest', e.target.checked)}
                    className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="ml-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Interesse em bolsa de estudos
                  </span>
                </label>
              </div>
            </div>

            {/* Agendamento de Visita */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-gray-900 dark:text-white">Agendar Visita</h4>
                <button
                  type="button"
                  onClick={() => setScheduleVisit(!scheduleVisit)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    scheduleVisit ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      scheduleVisit ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {scheduleVisit && (
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
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
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
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Observações Gerais
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                placeholder="Informações adicionais sobre o lead, expectativas, observações importantes..."
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-8 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div>
                <Dialog.Title className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Novo Lead
                </Dialog.Title>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Preencha as informações do novo lead
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.id} className="flex items-center">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full transition-all ${
                      currentStep >= step.id 
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-500'
                    }`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="ml-3">
                      <p className={`text-sm font-semibold ${
                        currentStep >= step.id ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500'
                      }`}>
                        {step.title}
                      </p>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-16 h-1 mx-4 rounded-full ${
                        currentStep > step.id ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl mb-6">
                {error}
              </div>
            )}

            {renderStep()}

            <div className="flex justify-between pt-8">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  Voltar
                </button>
              )}
              
              <div className="flex space-x-3 ml-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-purple-400 disabled:to-blue-400 text-white font-semibold py-3 px-8 rounded-xl transition-all transform hover:scale-105 disabled:transform-none shadow-lg"
                >
                  {loading ? 'Salvando...' : currentStep < 4 ? 'Próximo' : 'Salvar Lead'}
                </button>
              </div>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
