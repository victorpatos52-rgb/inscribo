import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { NewUserModal } from "@/components/users/NewUserModal";
import { profileService } from "@/lib/supabase";

interface Profile {
  id: string;
  email: string;
  full_name?: string;
  role: 'admin' | 'user';
  status?: 'active' | 'inactive' | 'pending';
  created_at?: string;
  updated_at?: string;
}

export default function UserManagement() {
  const { profile, user } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showNewUserModal, setShowNewUserModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Buscando usuários...');
      
      const data = await profileService.getAll();
      
      if (data && data.length > 0) {
        console.log('✅ Usuários carregados do Supabase:', data.length);
        setUsers(data.map(user => ({ ...user, status: 'active' as const })));
      } else {
        console.log('⚠️ Nenhum usuário encontrado');
        setUsers([]);
      }
      
    } catch (err: any) {
      console.error('❌ Erro ao buscar usuários:', err);
      setError('Erro ao carregar usuários. Verifique sua conexão.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewUserSuccess = (newUser: Profile) => {
    console.log('✅ Novo usuário criado:', newUser);
    setUsers(prev => [{ ...newUser, status: 'active' }, ...prev]);
    setShowNewUserModal(false);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;

    try {
      setLoading(true);
      setError(null);
      
      console.log('🗑️ Deletando usuário:', userId);
      await profileService.delete(userId);
      
      console.log('✅ Usuário deletado com sucesso');
      setUsers(prev => prev.filter(u => u.id !== userId));
      
    } catch (err: any) {
      console.error("❌ Erro ao excluir usuário:", err);
      setError(`Erro ao excluir usuário: ${err.message || 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase()) ||
      (u.full_name && u.full_name.toLowerCase().includes(search.toLowerCase()))
  );

  const roleColors: Record<string, string> = {
    admin: "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300",
    user: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
  };

  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
    inactive: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
  };

  const getRoleColor = (role: string) => roleColors[role] ?? roleColors.user;
  const getStatusColor = (status: string) => statusColors[status] ?? statusColors.active;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold dark:text-white">Gerenciamento de Usuários</h1>
        <button
          onClick={() => setShowNewUserModal(true)}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <span>Novo Usuário</span>
          {loading && (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg border border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
          <div className="flex items-center">
            <span className="mr-2">⚠️</span>
            {error}
          </div>
        </div>
      )}

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar usuário por nome, email ou papel..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Papel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <svg
                        className="animate-spin h-5 w-5 text-gray-500"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span className="text-gray-500 dark:text-gray-400">Carregando usuários...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center">
                    <div className="text-gray-500 dark:text-gray-400">
                      {search ? 'Nenhum usuário encontrado para a busca' : 'Nenhum usuário cadastrado'}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {(u.full_name || u.email).charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {u.full_name || 'Nome não informado'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(u.role)}`}>
                        {u.role === 'admin' ? 'Administrador' : 'Usuário'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(u.status || 'active')}`}>
                        {u.status === 'active' ? 'Ativo' : u.status === 'inactive' ? 'Inativo' : 'Pendente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {u.id !== profile?.id && u.id !== user?.id && (
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          disabled={loading}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Excluir
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showNewUserModal && (
        <NewUserModal
          onClose={() => setShowNewUserModal(false)}
          onSuccess={handleNewUserSuccess}
        />
      )}
    </div>
  );
}
