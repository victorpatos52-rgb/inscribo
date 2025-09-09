// UserManagement.tsx - Versão simplificada para resolver build
import { useEffect, useState } from "react";

// Tipos locais para evitar dependências externas
interface Profile {
  id: string;
  email: string;
  full_name?: string;
  role: string;
  status?: 'active' | 'inactive';
}

export default function UserManagement() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // Mock data para evitar dependências externas
    setUsers([
      {
        id: '1',
        email: 'admin@example.com',
        full_name: 'Administrator',
        role: 'admin',
        status: 'active'
      },
      {
        id: '2', 
        email: 'user@example.com',
        full_name: 'Regular User',
        role: 'user',
        status: 'active'
      }
    ]);
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  const roleColors: Record<string, string> = {
    admin: "bg-purple-100 text-purple-800",
    user: "bg-blue-100 text-blue-800",
  };

  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800",
  };

  const getRoleColor = (role: string) => roleColors[role] ?? roleColors.user;
  const getStatusColor = (status: string) => statusColors[status] ?? statusColors.active;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gerenciamento de Usuários</h1>
        <button
          onClick={() => alert('Funcionalidade em desenvolvimento')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Novo Usuário
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
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
        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
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
                  Carregando...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  Nenhum usuário encontrado
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
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
                    <button
                      onClick={() => alert('Funcionalidade em desenvolvimento')}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
