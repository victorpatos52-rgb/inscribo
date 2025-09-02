import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, UserIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { UserModal } from './UserModal';
import { NewUserModal } from './NewUserModal';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
  last_login: string | null;
  status: 'active' | 'inactive';
}

export function UserManagement() {
  const { profile, user } = useAuth();
  
  // Ensure admin access in demo mode
  const currentProfile = profile || {
    id: user?.id || 'demo-user',
    full_name: user?.user_metadata?.full_name || 'Admin Demo',
    email: user?.email || 'admin@inscribo.com',
    role: 'admin' as const,
    institution_id: 'demo-institution',
    avatar_url: null,
  };
  
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      email: 'admin@inscribo.com',
      full_name: 'Administrador Sistema',
      role: 'admin',
      created_at: new Date(Date.now() - 2592000000).toISOString(),
      updated_at: new Date().toISOString(),
      last_login: new Date(Date.now() - 3600000).toISOString(),
      status: 'active',
    },
    {
      id: '2',
      email: 'maria@escola.com',
      full_name: 'Maria Santos',
      role: 'user',
      created_at: new Date(Date.now() - 1296000000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
      last_login: new Date(Date.now() - 7200000).toISOString(),
      status: 'active',
    },
    {
      id: '3',
      email: 'joao@escola.com',
      full_name: 'João Silva',
      role: 'user',
      created_at: new Date(Date.now() - 864000000).toISOString(),
      updated_at: new Date(Date.now() - 172800000).toISOString(),
      last_login: new Date(Date.now() - 86400000).toISOString(),
      status: 'active',
    },
    {
      id: '4',
      email: 'ana@escola.com',
      full_name: 'Ana Costa',
      role: 'user',
      created_at: new Date(Date.now() - 432000000).toISOString(),
      updated_at: new Date(Date.now() - 259200000).toISOString(),
      last_login: null,
      status: 'inactive',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNewUser = (userData: Omit<User, 'id' | 'created_at' | 'updated_at' | 'last_login'>) => {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_login: null,
    };
    setUsers(prev => [newUser, ...prev]);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUsers(prev => prev.map(user => 
      user.id === updatedUser.id 
        ? { ...updatedUser, updated_at: new Date().toISOString() }
        : user
    ));
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      setUsers(prev => prev.filter(user => user.id !== userId));
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
      : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
  };

  const getStatusLabel = (status: string) => {
    return status === 'active' ? 'Ativo' : 'Inativo';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Gestão de Usuários
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Cadastre, edite e gerencie usuários do sistema
            </p>
          </div>
          <button
            onClick={() => setShowNewUserModal(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl flex items-center transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Cadastrar Usuário
          </button>
        </div>

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
                  {users.filter(u => u.status === 'active').length}
                </p>
              </div>
              <ShieldCheckIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

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
                    Último Login
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
                            Criado em {new Date(user.created_at).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                      }`}>
                        {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(user.status)}`}>
                        {getStatusLabel(user.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {user.last_login 
                        ? new Date(user.last_login).toLocaleDateString('pt-BR')
                        : 'Nunca'
                      }
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
                        {user.id !== currentProfile?.id && (
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

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {searchTerm ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
            </p>
            <button
              onClick={() => setShowNewUserModal(true)}
              className="mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl transition-all"
            >
              Cadastrar Primeiro Usuário
            </button>
          </div>
        )}
      </div>

      {showNewUserModal && (
        <NewUserModal
          onClose={() => setShowNewUserModal(false)}
          onSave={handleNewUser}
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