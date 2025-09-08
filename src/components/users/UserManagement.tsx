import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, UserIcon, ShieldCheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { profileService, Profile, mockData } from '../../lib/supabase';
import { UserModal } from './UserModal';
import { NewUserModal } from './NewUserModal';

export function UserManagement() {
  const { profile, user } = useAuth();
  
  // Estado principal
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // 🔧 BUSCAR USUÁRIOS DO SUPABASE
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Buscando usuários...');
      
      const data = await profileService.getAll();
      
      if (data.length > 0) {
        console.log('✅ Usuários carregados do Supabase:', data.length);
        setUsers(data.map(user => ({ ...user, status: 'active' as const })));
      } else {
        console.log('⚠️ Nenhum usuário encontrado, usando dados mock');
        setUsers(mockData.profiles);
      }
      
    } catch (err: any) {
      console.error('❌ Erro ao buscar usuários:', err);
      setError('Erro ao carregar usuários. Usando dados de demonstração.');
      
      // Usar dados mock como fallback
      setUsers(mockData.profiles);
    } finally {
      setLoading(false);
    }
  };

 // 🔧 CRIAR NOVO USUÁRIO NO SUPABASE - SUBSTITUA esta função
const handleNewUser = async (newUser: Profile) => {
  try {
    console.log('✅ Usuário criado com sucesso:', newUser);
    
    // Adicionar à lista local
    setUsers(prev => [{ ...newUser, status: 'active' }, ...prev]);
    
    // Mostrar mensagem de sucesso
    alert('✅ Usuário criado com sucesso!\n\n' +
          `Nome: ${newUser.full_name}\n` +
          `Email: ${newUser.email}\n` +
          `Perfil: ${newUser.role === 'admin' ? 'Administrador' : 'Usuário'}`);
    
  } catch (err: any) {
    console.error('❌ Erro no callback de criação:', err);
    alert(`❌ Erro: ${err.message}`);
  }
};

  // 🔧 ATUALIZAR USUÁRIO
  const handleUpdateUser = async (updatedUser: Profile) => {
    try {
      console.log('📝 Atualizando usuário:', updatedUser.id);
      
      const updated = await profileService.update(updatedUser.id, {
        full_name: updatedUser.full_name,
        role: updatedUser.role,
        avatar_url: updatedUser.avatar_url,
      });

      console.log('✅ Usuário atualizado:', updated);

      // Atualizar na lista local
      setUsers(prev => prev.map(user => 
        user.id === updatedUser.id 
          ? { ...updated, status: user.status }
          : user
      ));

      alert('✅ Usuário atualizado com sucesso!');
      
    } catch (err: any) {
      console.error('❌ Erro ao atualizar usuário:', err);
      alert(`❌ Erro ao atualizar usuário: ${err.message}`);
    }
  };

  // 🔧 DELETAR USUÁRIO
  const handleDeleteUser = async (userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    
    if (!userToDelete) return;

    if (!window.confirm(
      `⚠️ ATENÇÃO!\n\n` +
      `Tem certeza que deseja excluir o usuário?\n\n` +
      `Nome: ${userToDelete.full_name}\n` +
      `Email: ${userToDelete.email}\n\n` +
      `Esta ação NÃO pode ser desfeita!`
    )) {
      return;
    }

    try {
      console.log('🗑️ Deletando usuário:', userId);
      
      await profileService.delete(userId);
      
      // Remover da lista local
      setUsers(prev => prev.filter(user => user.id !== userId));
      
      console.log('✅ Usuário deletado com sucesso');
      alert('✅ Usuário excluído com sucesso!');
      
    } catch (err: any) {
      console.error('❌ Erro ao deletar usuário:', err);
      alert(`❌ Erro ao excluir usuário: ${err.message}`);
    }
  };

// 🔧 BUSCAR USUÁRIOS DO SUPABASE - SUBSTITUA esta função
const fetchUsers = async () => {
  try {
    setLoading(true);
    setError(null);
    console.log('🔍 Buscando usuários...');
    
    const data = await profileService.getAll();
    
    if (data.length > 0) {
      console.log('✅ Usuários carregados do Supabase:', data.length);
      setUsers(data.map(user => ({ ...user, status: 'active' as const })));
    } else {
      console.log('⚠️ Nenhum usuário encontrado, usando dados mock');
      setUsers(mockUsers);
    }
    
  } catch (err: any) {
    console.error('❌ Erro ao buscar usuários:', err);
    setError('Erro ao carregar usuários. Usando dados de demonstração.');
    setUsers(mockUsers);
  } finally {
    setLoading(false);
  }
};

  // Filtrar usuários baseado na busca
  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string = 'active') => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
      : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
  };

  const getStatusLabel = (status: string = 'active') => {
    return status === 'active' ? 'Ativo' : 'Inativo';
  };

  const getRoleLabel = (role: string) => {
    return role === 'admin' ? 'Administrador' : 'Usuário';
  };

  const getRoleColor = (role: string) => {
    return role === 'admin' 
      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300'
      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Carregando usuários...</p>
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
              Gestão de Usuários
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Cadastre, edite e gerencie usuários do sistema
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={fetchUsers}
              disabled={loading}
              className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center transition-all disabled:cursor-not-allowed"
              title="Atualizar lista"
            >
              🔄 Atualizar
            </button>
            <button
              onClick={() => setShowNewUserModal(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl flex items-center transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Cadastrar Usuário
            </button>
          </div>
        </div>

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

        {/* Search and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-2">
            <input
              type="text"
              placeholder="Buscar usuários por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
            />
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Total de Usuários</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{users.length}</p>
              </div>
              <UserIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Usuários Ativos</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {users.filter(u => (u.status || 'active') === 'active').length}
                </p>
              </div>
              <ShieldCheckIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Tabela de Usuários */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">
                    Usuário
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">
                    E-mail
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">
                    Perfil
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">
                    Data Criação
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 rounded-full mr-4">
                          <span className="text-white font-bold text-sm">
                            {user.full_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900 dark:text-white">
                            {user.full_name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            ID: {user.id.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${getRoleColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(user.status)}`}>
                        {getStatusLabel(user.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => setSelectedUser(user)}
                          className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all"
                          title="Editar usuário"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        {user.id !== profile?.id && user.id !== user?.id && (
                          <button 
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                            title="Excluir usuário"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Estado vazio */}
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {searchTerm ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowNewUserModal(true)}
                className="mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl transition-all"
              >
                Cadastrar Primeiro Usuário
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modais */}
      {showNewUserModal && (
        <NewUserModal
          onClose={() => setShowNewUserModal(false)}
          onSuccess={handleNewUser}
        />
      )}

      {selectedUser && (
        <UserModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUpdate={handleUpdateUser}
        />
      )}
    </>
  );
}
