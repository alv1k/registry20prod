import React from 'react';
import { AppPlannedBudgetRecord } from '../store/useStore';
import { formatCurrencyWithSeparators, formatDate } from '../utils/formatUtils';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import Button from './Button';

interface PlannedBudgetTableProps {
  data: AppPlannedBudgetRecord[];
  isDataLoading: boolean;
  isAdmin: boolean;
  calculateActualSpendingByClassification: Record<string, number>;
  openFormModal: (id?: number | string | null) => void;
  confirmDelete: (id: number | string) => void;
  deleteConfirmationId: number | string | null;
  handleDelete: () => void;
  cancelDelete: () => void;
}

const PlannedBudgetTable: React.FC<PlannedBudgetTableProps> = ({
  data,
  isDataLoading,
  isAdmin,
  calculateActualSpendingByClassification,
  openFormModal,
  confirmDelete,
  deleteConfirmationId,
  handleDelete,
  cancelDelete
}) => {
  const { user } = useAuth();

  return (
    <>
      {/* Delete Confirmation Modal */}
      {isAdmin && deleteConfirmationId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Подтверждение удаления</h3>
            <p className="text-gray-600 mb-6">Вы уверены, что хотите удалить эту запись запланированного бюджета? Это действие нельзя отменить.</p>
            <div className="flex justify-end space-x-3">
              <Button
                onClick={cancelDelete}
                variant="secondary"
              >
                Отмена
              </Button>
              <Button
                onClick={handleDelete}
                variant="danger"
              >
                Удалить
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-2 bg-white rounded-lg shadow-md border border-gray-200 overflow-y-auto max-h-[500px]">
        <div className="overflow-x-auto">
          {isDataLoading ? (
            <div className="py-12">
              <LoadingSpinner message="Загрузка данных запланированного бюджета..." />
            </div>
          ) : (
            <>
              {/* Mobile View - Card Layout */}
              <div className="block md:hidden overflow-y-scroll">
                {data.length > 0 ? (
                  data.map((record) => (
                    <div key={record.id} className="border-b border-gray-200 p-4 hover:bg-gray-50">
                      <div 
                        className={`flex-1 ${isAdmin ? 'cursor-pointer' : ''}`}
                        onClick={isAdmin ? () => openFormModal(record.id) : undefined}
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium text-gray-900">{record.classification}</div>
                          <div className="text-sm text-gray-500">{formatDate(record.plannedDate)}</div>
                        </div>
                        <div className="mt-1 text-sm text-gray-500 truncate max-w-xs">{record.comment}</div>
                        <div className="mt-2 text-xs text-gray-500 space-y-1">
                          <div className="flex justify-between">
                            <span>Запланировано:</span>
                            <span className="font-medium">{formatCurrencyWithSeparators(record.plannedAmount)} ₽</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Потрачено:</span>
                            <span className="font-medium">
                              {formatCurrencyWithSeparators(calculateActualSpendingByClassification[record.classification] || 0)} ₽
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Категория:</span>
                            <span className="font-medium">{record.classification}</span>
                          </div>
                        </div>
                      </div>
                      {isAdmin && (
                        <div className="ml-4 flex-shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmDelete(record.id);
                            }}
                            className="text-red-600 hover:text-red-900"
                            title="Удалить запись"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-gray-500">
                    Нет данных, соответствующих фильтрам. Попробуйте изменить параметры фильтрации.
                  </div>
                )}
              </div>
              
              {/* Desktop View - Table */}
              <table className="hidden md:table divide-y divide-gray-200 min-w-full overflow-y-scroll">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Категория</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Запланировано</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Потрачено</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Комментарий</th>
                    {isAdmin && (
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.length > 0 ? (
                    data.map((record, index) => (
                      <tr 
                        key={record.id} 
                        className={`hover:bg-gray-50 ${isAdmin ? 'cursor-pointer' : ''}`}
                        onClick={isAdmin ? () => openFormModal(record.id) : undefined}
                      >
                        <td 
                          className="p-4 whitespace-nowrap text-sm font-medium text-gray-900"
                        >
                          {record.classification}
                        </td>
                        <td 
                          className="p-4 whitespace-nowrap text-sm text-gray-500"
                        >
                          {formatCurrencyWithSeparators(record.plannedAmount)} ₽
                        </td>
                        <td
                          className="p-4 whitespace-nowrap text-sm text-gray-500"
                        >
                          {formatCurrencyWithSeparators(calculateActualSpendingByClassification[record.classification] || 0)} ₽
                        </td>
                        <td 
                          className="p-4 whitespace-nowrap text-sm text-gray-500"
                        >
                          {formatDate(record.plannedDate)}
                        </td>
                        <td 
                          className="p-4 text-sm text-gray-500"
                        >
                          {record.comment}
                        </td>
                        {isAdmin && (
                          <td className="p-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                confirmDelete(record.id);
                              }}
                              className="text-red-600 hover:text-red-900"
                              title="Удалить запись"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={isAdmin ? 6 : 5} className="p-4 text-center text-sm text-gray-500">
                        Нет данных, соответствующих фильтрам. Попробуйте изменить параметры фильтрации.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default PlannedBudgetTable;