import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, UserIcon, PencilIcon } from '@heroicons/react/24/outline';
import { Profile } from '../../lib/supabase';

interface UserModalProps {
  user: Profile;
  onClose: () => void;
  onUpdate: (user: Profile) => void;
}

export function UserModal({ user, onClose, onUpdate }: UserModalProps) {
  const [formData, setFormData] = useState({
    full_name: user.full_name,
    email: user.email,
    role: user.role,
    avatar_url: user.avatar_url || '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.full_name.trim()) {
        throw new Error('Nome completo é obrigatório');
      }

      const updatedUser: Profile = {
        ...user,
        full_name: formData.full_name.trim(),
        role: formData.role,
        avatar_url: formData.avatar_url.trim() || null,
        updated_at: new Date().toISOString(),
      };

      await onUpdate(updatedUser);
      onClose();
      
    } catch (err: any) {
      console.error('❌ Erro ao atualizar usuário:', err);
      setError(err.message || 'Erro ao atualizar usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (error) {
      setError('');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-8 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl">
                  <PencilIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-white">
                    Editar Usuário
                  </Dialog.Title>
                  <p className="text-gray-600 dark:text-gray-400">
                    Altere as informações do usuário
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={loading}
                className="p-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all disabled:opacity-50"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl">
                <div className="flex items-start">
                  <span className="text-red-500 mr-2">⚠️</span>
                  <div>
                    <p className="font-medium">Erro:</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Avatar e informações básicas */}
            <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-full">
                <span className="text-white font-bold text-lg">
                  {user.full_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {user.full_name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  ID: {user.id}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Criado em: {formatDate(user.created_at)}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Nome Completo *
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => handleChange('full_name', e.target.value)}
                required
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Nome completo do usuário"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                E-mail
              </label>
              <input
                type="email"
                value={formData.email}
                disabled={true}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                placeholder="email@exemplo.com"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                O e-mail não pode ser alterado por questões de segurança
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Perfil do Usuário *
              </label>
              <select
                value={formData.role}
                onChange={(e) => handleChange('role', e.target.value as 'admin' | 'user')}
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="user">Usuário</option>
                <option value="admin">Administrador</option>
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formData.role === 'admin' 
                  ? 'Administradores podem gerenciar usuários e configurações do sistema'
                  : 'Usuários têm acesso às funcionalidades básicas do sistema'
                }
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                URL do Avatar (opcional)
              </label>
              <input
                type="url"
                value={formData.avatar_url}
                onChange={(e) => handleChange('avatar_url', e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="https://exemplo.com/avatar.jpg"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                URL de uma imagem para usar como avatar do usuário
              </p>
            </div>

            {/* Informações adicionais */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-xl">
              <div className="flex items-start">
                <span className="text-blue-500 mr-2 mt-0.5">ℹ️</span>
                <div>
                  <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                    Informações do usuário:
                  </p>
                  <ul className="text-xs text-blue-600 dark:text-blue-400 mt-2 space-y-1">
                    <li>• <strong>Criado em:</strong> {formatDate(user.created_at)}</li>
                    <li>• <strong>Última atualização:</strong> {formatDate(user.updated_at)}</li>
                    <li>• <strong>Instituição ID:</strong> {user.institution_id || 'Não definido'}</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Aviso sobre senha */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-xl">
              <div className="flex items-start">
                <span className="text-yellow-500 mr-2 mt-0.5">🔐</span>
                <div>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">
                    Sobre a senha:
                  </p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                    A senha não pode ser alterada por aqui. O usuário deve usar a opção "Esqueci minha senha" na tela de login para redefini-la.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-purple-400 disabled:to-blue-400 text-white font-semibold py-3 px-6 rounded-xl transition-all transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed shadow-lg disabled:shadow-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Salvando...
                  </div>
                ) : (
                  'Salvar Alterações'
                )}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
