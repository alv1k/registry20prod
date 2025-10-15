// src/pages/Transport.tsx
import { useState, useMemo, useEffect } from 'react';
import { useStore } from '../store/useStore';
import AnimatedAccordion from '../components/AnimatedAccordion';
import TransportFormModal from '../components/TransportFormModal';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrencyWithSeparators, formatDate } from '../utils/formatUtils';

const Transport = () => {
  const transportData = useStore((state) => state.transportData);
  const syncTransportData = useStore((state) => state.syncTransportData);
  const addTransportRecord = useStore((state) => state.addTransportRecord);
  const updateTransportRecord = useStore((state) => state.updateTransportRecord);
  const deleteTransportRecord = useStore((state) => state.deleteTransportRecord);
  const isDataLoading = useStore((state) => state.isTransportDataLoading);
  const dataError = useStore((state) => state.transportDataError);

  const { user, isAdmin } = useAuth();
  
  // State for filters
  const [dateFilter, setDateFilter] = useState<string>('');
  const [workTypeFilter, setWorkTypeFilter] = useState<string>('');
  const [minCostFilter, setMinCostFilter] = useState<string>('');
  const [maxCostFilter, setMaxCostFilter] = useState<string>('');
  const [frequencyFilter, setFrequencyFilter] = useState<string>('');
  const [nextRepeatFilter, setNextRepeatFilter] = useState<string>('');
  const [commentFilter, setCommentFilter] = useState<string>('');
  
  // State for modal
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState<number | string | null>(null);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<number | string | null>(null);

  useEffect(() => {
    // Load data from Firebase when component mounts
    syncTransportData().catch(error => {
      console.error('Error loading transport data:', error);
    });
  }, [syncTransportData]);
  
  // Confirmation functions for deletion
  const confirmDelete = (id: number | string) => {
    if (isAdmin) {
      setDeleteConfirmationId(id);
    }
  };

  const handleDelete = () => {
    if (deleteConfirmationId !== null) {
      deleteTransportRecord(deleteConfirmationId);
      setDeleteConfirmationId(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmationId(null);
  };
  
  // Apply filters to the data
  const filteredData = useMemo(() => {
    return transportData.filter(record => {
      // Date filter
      if (dateFilter && record.shippingDate !== dateFilter) {
        return false;
      }
      
      // Work type filter (partial match)
      if (workTypeFilter && !record.cargoName.toLowerCase().includes(workTypeFilter.toLowerCase())) {
        return false;
      }
      
      // Min cost filter
      if (minCostFilter && record.shippingWeight < parseFloat(minCostFilter)) {
        return false;
      }
      
      // Max cost filter
      if (maxCostFilter && record.shippingWeight > parseFloat(maxCostFilter)) {
        return false;
      }
      
      // Frequency filter (partial match)
      if (frequencyFilter && !record.driver.toLowerCase().includes(frequencyFilter.toLowerCase())) {
        return false;
      }
      
      // Next repeat filter
      if (nextRepeatFilter && record.departureDate !== nextRepeatFilter) {
        return false;
      }
      
      // Comment filter (partial match)
      if (commentFilter && !record.driverLicense.toLowerCase().includes(commentFilter.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }, [
    transportData, 
    dateFilter, 
    workTypeFilter, 
    minCostFilter, 
    maxCostFilter, 
    frequencyFilter, 
    nextRepeatFilter, 
    commentFilter
  ]);

  // Functions to handle modal
  const openFormModal = (id?: number | string | null) => {
    if (id !== undefined) {
      setSelectedRecordId(id);
    } else {
      setSelectedRecordId(null);
    }
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedRecordId(null);
  };

  // Clear all filters
  const clearFilters = () => {
    setDateFilter('');
    setWorkTypeFilter('');
    setMinCostFilter('');
    setMaxCostFilter('');
    setFrequencyFilter('');
    setNextRepeatFilter('');
    setCommentFilter('');
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Журнал технического обслуживания автомобилей</h1>
        <div className="flex flex-wrap gap-3">
          {isAdmin && (
            <button 
              onClick={() => openFormModal()}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Добавить
            </button>
          )}
        </div>
      </div>
      
      {/* Error message */}
      {dataError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {dataError}
        </div>
      )}
      
      {/* Filter Controls - Accordion */}
      <AnimatedAccordion title="Фильтры" defaultOpen={true}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Дата</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-56 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Вид работ</label>
            <input
              type="text"
              placeholder="Фильтр по виду работ"
              value={workTypeFilter}
              onChange={(e) => setWorkTypeFilter(e.target.value)}
              className="w-56 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Мин. стоимость</label>
            <input
              type="number"
              placeholder="Мин. стоимость"
              value={minCostFilter}
              onChange={(e) => setMinCostFilter(e.target.value)}
              className="w-56 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Макс. стоимость</label>
            <input
              type="number"
              placeholder="Макс. стоимость"
              value={maxCostFilter}
              onChange={(e) => setMaxCostFilter(e.target.value)}
              className="w-56 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Частота</label>
            <input
              type="text"
              placeholder="Фильтр по частоте"
              value={frequencyFilter}
              onChange={(e) => setFrequencyFilter(e.target.value)}
              className="w-56 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ближайший повтор</label>
            <input
              type="date"
              value={nextRepeatFilter}
              onChange={(e) => setNextRepeatFilter(e.target.value)}
              className="w-56 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Комментарий</label>
            <input
              type="text"
              placeholder="Фильтр по комментарию"
              value={commentFilter}
              onChange={(e) => setCommentFilter(e.target.value)}
              className="w-56 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
            />
          </div>
        </div>
        
        <div className="flex justify-end mt-3">
          <button
            onClick={clearFilters}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Очистить фильтры
          </button>
        </div>
      </AnimatedAccordion>
      
      {/* Delete Confirmation Modal */}
      {isAdmin && deleteConfirmationId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Подтверждение удаления</h3>
            <p className="text-gray-600 mb-6">Вы уверены, что хотите удалить эту запись? Это действие нельзя отменить.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 mt-4">
        <div className="overflow-x-auto">
          {/* Mobile View - Card Layout */}
          <div className="block md:hidden">
            {filteredData.length > 0 ? (
              filteredData.map((record) => (
                <div key={record.id} className="border-b border-gray-200 p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div 
                      className={`flex-1 ${isAdmin ? 'cursor-pointer' : ''}`}
                      onClick={isAdmin ? () => openFormModal(record.id) : undefined}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-gray-900">{record.cargoName}</div>
                        <div className="text-sm text-gray-500">{formatDate(record.shippingDate)}</div>
                      </div>
                      <div className="mt-1 text-sm text-gray-500 truncate max-w-xs">{record.driverLicense}</div>
                      <div className="mt-2 text-xs text-gray-500 space-y-1">
                        <div className="flex justify-between">
                          <span>Стоимость:</span>
                          <span className="font-medium">{formatCurrencyWithSeparators(record.shippingWeight)} ₽</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Частота:</span>
                          <span className="font-medium">{record.driver}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Повтор:</span>
                          <span className="font-medium">{formatDate(record.departureDate)}</span>
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
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-sm text-gray-500">
                Нет данных, соответствующих фильтрам. Попробуйте изменить параметры фильтрации.
              </div>
            )}
          </div>
          
          {/* Desktop View - Table */}
          <table className="hidden md:table divide-y divide-gray-200 min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Вид работ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Стоимость</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Частота</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ближайший повтор</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Комментарий</th>
                {isAdmin && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.length > 0 ? (
                filteredData.map((record) => (
                  <tr 
                    key={record.id} 
                    className={`hover:bg-gray-50 ${isAdmin ? 'cursor-pointer' : ''}`}
                    onClick={isAdmin ? () => openFormModal(record.id) : undefined}
                  >
                    <td 
                      className="p-4 whitespace-nowrap text-sm text-gray-500"
                    >
                      {formatDate(record.shippingDate)}
                    </td>
                    <td 
                      className="p-4 whitespace-nowrap text-sm font-medium text-gray-900"
                    >
                      {record.cargoName}
                    </td>
                    <td 
                      className="p-4 whitespace-nowrap text-sm text-gray-500"
                    >
                      {formatCurrencyWithSeparators(record.shippingWeight)} ₽
                    </td>
                    <td 
                      className="p-4 whitespace-nowrap text-sm text-gray-500"
                    >
                      {record.driver}
                    </td>
                    <td 
                      className="p-4 whitespace-nowrap text-sm text-gray-500"
                    >
                      {formatDate(record.departureDate)}
                    </td>
                    <td 
                      className="p-4 text-sm text-gray-500"
                    >
                      {record.driverLicense}
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
                  <td colSpan={isAdmin ? 7 : 6} className="p-4 text-center text-sm text-gray-500">
                    Нет данных, соответствующих фильтрам. Попробуйте изменить параметры фильтрации.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {isAdmin && (
        <TransportFormModal 
          isOpen={isFormModalOpen} 
          onClose={closeFormModal} 
          recordId={selectedRecordId} 
          onAdd={addTransportRecord} 
          onUpdate={updateTransportRecord} 
        />
      )}
    </div>
  );
};

export default Transport;