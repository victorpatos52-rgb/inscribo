import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import NewUserModal from "@/components/users/NewUserModal";
import { Profile } from "@/types/profile";

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
    setLoading(true);
    setError(null);
    try {
      // 🔹 Aqui ainda é mock — substituir por fetch do Supabase depois
      setUsers(mockUsers);
    } catch (err) {
      setError("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  const handleNewUser = async (newUser: {
    email: string;
    password: string;
    role: string;
  }) => {
    try {
      // 🔹 Implementar chamada real ao Supabase:
      // const { data, error } = await supabase.auth.admin.createUser({
      //   email: newUser.email,
      //   password: newUser.password,
      //   user_metadata: { role: newUser.role }
      // });

      const createdUser: Profile = {
        id: String(Date.now()),
        email: newUser.email,
        role: newUser.role,
        status: "active",
      };

      setUsers((prev) => [...prev, createdUser]);
      setShowNewUserModal(false);
    } catch (err) {
      console.error("❌ Erro ao criar usuário:", err);
      setError("Erro ao criar usuário");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;

    try {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      setError("Erro ao excluir usuário");
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  // 🔹 Melhor organização para cores
  const roleColors: Record<string, string> = {
    admin:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300",
    user: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
  };

  const statusColors: Record<string, string> = {
    active:
      "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
    inactive: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    pending:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
  };

  const getRoleColor = (role: string) => roleColors[role] ?? roleColors.user;
  const getStatusColor = (status: string) =>
    statusColors[status] ?? statusColors.inactive;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gerenciamento de Usuários</h1>
        <button
          onClick={() => setShowNewUserModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Novo Usuário
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar usuário..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2 border rounded-lg"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200 dark:border-gray-700">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800">
              <th className="p-3 border">E-mail</th>
              <th className="p-3 border">Papel</th>
              <th className="p-3 border">Status</th>
              <th className="p-3 border">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="p-4 text-center">
                  Carregando...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center">
                  Nenhum usuário encontrado
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr
                  key={u.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="p-3 border">{u.email}</td>
                  <td className="p-3 border">
                    <span
                      className={`px-2 py-1 text-xs rounded ${getRoleColor(
                        u.role
                      )}`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3 border">
                    <span
                      className={`px-2 py-1 text-xs rounded ${getStatusColor(
                        u.status
                      )}`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="p-3 border">
                    {u.id !== profile?.id && u.id !== user?.id && (
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
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
