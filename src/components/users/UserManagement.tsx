// UserManagement.tsx corrigido
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import NewUserModal from "@/components/users/NewUserModal";
import { Profile } from "@/types/profile";
import { profileService } from "@/lib/supabase"; // ✅ Import corrigido

// 🔹 Mock temporário para evitar erro de referência
const mockUsers: Profile[] = [];

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

  const handleNewUser = async (newUser: {
    email: string;
    password: string;
    full_name?: string;
    role: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Criando novo usuário:', newUser.email);
      
      // ✅ Usar o profileService do supabase.ts
      const createdProfile = await profileService.create({
        email: newUser.email,
        password: newUser.password,
        full_name: newUser.full_name || newUser.email.split('@')[0],
        role: newUser.role as 'admin' | 'user',
      });

      console.log('✅ Usuário criado:', createdProfile);
      
      // Atualizar a lista local
      setUsers(prev => [...prev, { ...createdProfile, status: 'active' as const }]);
      setShowNewUserModal(false);
      
    } catch (err: any) {
      console.error("❌ Erro ao criar usuário:", err);
      setError(`Erro ao criar usuário: ${err.message || 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;

    try {
      setLoading(true);
      setError(null);
      
      console.log('🗑️ Deletando usuário:', userId);
      
      // ✅ Usar o profileService do supabase.ts
      await profileService.delete(userId);
      
      console.log('✅ Usuário deletado com sucesso');
      
      // Atualizar a lista local
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
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  // 🔹 Melhor organização para cores
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
  const getStatusColor = (status: string) => statusColors[status] ?? statusColors.inactive;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gerenciamento de Usuários</h1>
        <button
          onClick={() => setShowNewUserModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          Novo Usuário
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar usuário..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200 dark:border-gray-700">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800">
              <th className="p-3 border text-left">E-mail</th>
              <th className="p-3 border text-left">Nome</th>
              <th className="p-3 border text-left">Papel</th>
              <th className="p-3 border text-left">Status</th>
              <th className="p-3 border text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-4 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>Carregando...</span>
                  </div>
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  {search ? 'Nenhum usuário encontrado para a busca' : 'Nenhum usuário encontrado'}
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="p-3 border">{u.email}</td>
                  <td className="p-3 border">{u.full_name || '-'}</td>
                  <td className="p-3 border">
                    <span className={`px-2 py-1 text-xs rounded ${getRoleColor(u.role)}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3 border">
                    <span className={`px-2 py-1 text-xs rounded ${getStatusColor(u.status || 'active')}`}>
                      {u.status || 'active'}
                    </span>
                  </td>
                  <td className="p-3 border">
                    {u.id !== profile?.id && u.id !== user?.id && (
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                        disabled={loading}
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

      {showNewUserModal && (
        <NewUserModal
          onClose={() => setShowNewUserModal(false)}
          onSubmit={handleNewUser}
        />
      )}
    </div>
  );
}
