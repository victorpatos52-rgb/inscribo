import React from 'react';

export function LeadsKanban() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Gestão de Leads - Kanban
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Visualize e gerencie seus leads em um quadro Kanban
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Coluna: Novos */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">Novos</h3>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">
                0
              </span>
            </div>
          </div>
          <div className="p-4">
            <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
              Nenhum lead novo
            </p>
          </div>
        </div>

        {/* Coluna: Em Contato */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">Em Contato</h3>
              <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-yellow-900 dark:text-yellow-300">
                0
              </span>
            </div>
          </div>
          <div className="p-4">
            <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
              Nenhum lead em contato
            </p>
          </div>
        </div>

        {/* Coluna: Proposta */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">Proposta</h3>
              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-purple-900 dark:text-purple-300">
                0
              </span>
            </div>
          </div>
          <div className="p-4">
            <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
              Nenhuma proposta
            </p>
          </div>
        </div>

        {/* Coluna: Convertido */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">Convertido</h3>
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">
                0
              </span>
            </div>
          </div>
          <div className="p-4">
            <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
              Nenhuma conversão
            </p>
          </div>
        </div>
      </div>

      {/* Estado vazio */}
      <div className="mt-8 text-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900">
            <svg
              className="h-6 w-6 text-blue-600 dark:text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-white">
            Nenhum lead cadastrado
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Comece adicionando seus primeiros leads ao sistema.
          </p>
          <div className="mt-6">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg
                className="-ml-1 mr-2 h-5 w-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Adicionar Lead
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeadsKanban;
