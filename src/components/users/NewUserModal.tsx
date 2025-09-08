import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, UserPlusIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { profileService } from '../../lib/supabase';

interface NewUserModalProps {
  onClose: () => void;
  onSuccess: (user: any) => void; // MUDE de onSave para onSuccess
}

export function NewUserModal({ onClose, onSuccess }: NewUserModalProps) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user' as 'admin' | 'user',
    institution_id: '00000000-0000-0000-0000-000000000001', // ID padrão da instituição
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateForm = () => {
    if (!formData.full_name.trim()) {
      throw new Error('Nome completo é obrigatório');
    }

    if (!formData.email.trim()) {
      throw new Error('E-mail é obrigatório');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      throw new Error('E-mail inválido');
    }

    if (!formData.password) {
      throw new Error('Senha é obrigatória');
    }

    if (formData.password.length < 6) {
      throw new Error('A senha deve ter pelo menos 6 caracteres');
    }

    if (formData.password !== formData.confirmPassword) {
      throw new Error('As senhas não coincidem');
    }
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    // Validar formulário
    if (!formData.full_name.trim()) throw new Error('Nome completo é obrigatório');
    if (!formData.email.trim()) throw new Error('E-mail é obrigatório');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) throw new Error('E-mail inválido');
    if (!formData.password) throw new Error('Senha é obrigatória');
    if (formData.password.length < 6) throw new Error('A senha deve ter pelo menos 6 caracteres');
    if (formData.password !== formData.confirmPassword) throw new Error('As senhas não coincidem');

    console.log('📝 Iniciando criação de usuário...', formData.email);

    // Criar usuário usando o profileService
    const newUser = await profileService.create({
      email: formData.email.trim(),
      password: formData.password,
      full_name: formData.full_name.trim(),
      role: formData.role,
      institution_id: '00000000-0000-0000-0000-000000000001',
    });

    console.log('✅ Usuário criado com sucesso:', newUser);
    onSuccess(newUser);
    onClose();

  } catch (err: any) {
    console.error('❌ Erro ao criar usuário:', err);
    let errorMessage = 'Erro desconhecido ao criar usuário';
    
    if (err.message) {
      errorMessage = err.message;
      if (err.message.includes('duplicate key')) {
        errorMessage = 'Este e-mail já está cadastrado no sistema';
      }
    }
    
    setError(errorMessage);
  } finally {
    setLoading(false);
  }
};

      // Chamar callback de sucesso
      onSuccess(newUser);
      
      // Fechar modal
      onClose();

    } catch (err: any) {
      console.error('❌ Erro ao criar usuário:', err);
      
      // Tratamento de erros específicos
      let errorMessage = 'Erro desconhecido ao criar usuário';
      
      if (err.message) {
        errorMessage = err.message;
      }
      
      // Erros comuns do Supabase
      if (err.message?.includes('duplicate key')) {
        errorMessage = 'Este e-mail já está cadastrado no sistema';
      } else if (err.message?.includes('invalid email')) {
        errorMessage = 'E-mail inválido';
      } else if (err.message?.includes('password')) {
        errorMessage = 'Erro na senha. Verifique se atende aos requisitos';
      } else if (err.message?.includes('network') || err.message?.includes('fetch')) {
        errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente';
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro quando usuário começar a digitar
    if (error) {
      setError('');
    }
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
                  <UserPlusIcon className="h-6 w-6 text-white" />
                </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Perfil do Usuário *
              </label>
              <select
                value={formData.role}
                onChange={(e) => handleChange('role', e.target.value)}
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

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-xl">
              <div className="flex items-start">
                <span className="text-blue-500 mr-2 mt-0.5">ℹ️</span>
                <div>
                  <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                    Informações importantes:
                  </p>
                  <ul className="text-xs text-blue-600 dark:text-blue-400 mt-1 space-y-1">
                    <li>• O usuário receberá acesso imediato ao sistema</li>
                    <li>• A senha pode ser alterada no primeiro login</li>
                    <li>• O perfil pode ser modificado posteriormente</li>
                  </ul>
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
                    Criando...
                  </div>
                ) : (
                  'Criar Usuário'
                )}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
                <div>
                  <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-white">
                    Novo Usuário
                  </Dialog.Title>
                  <p className="text-gray-600 dark:text-gray-400">
                    Crie um novo usuário no sistema
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
                    <p className="font-medium">Erro ao criar usuário:</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}

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
                E-mail *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="email@exemplo.com"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Este será o login do usuário no sistema
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Senha *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Mínimo de 6 caracteres
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Confirmar Senha *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div
