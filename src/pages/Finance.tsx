import { useState, useMemo, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import FinanceFormModal from '../components/FinanceFormModal';
import AnimatedAccordion from '../components/AnimatedAccordion';
import FinanceCharts from '../components/FinanceCharts';
import CategoriesManager from '../components/CategoriesManager';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatCurrencyWithSeparators, formatDate } from '../utils/formatUtils';
import { useAuth } from '../contexts/AuthContext';

const Finance = () => {
  const financeData = useStore((state) => state.financeData);
  const syncFinanceData = useStore((state) => state.syncFinanceData);
  const addFinanceRecord = useStore((state) => state.addFinanceRecord);
  const updateFinanceRecord = useStore((state) => state.updateFinanceRecord);
  const deleteFinanceRecord = useStore((state) => state.deleteFinanceRecord);
  const isDataLoading = useStore((state) => state.isFinanceDataLoading);
  const dataError = useStore((state) => state.financeDataError);
  const categories = useStore((state) => state.categories);
  const syncCategories = useStore((state) => state.syncCategories);

  const { user, isAdmin } = useAuth();
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState<number | string | null>(null);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<number | string | null>(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);

  // Ref for the table container
  const tableContainerRef = useRef<HTMLDivElement>(null);
  


  // Auto-scroll to the bottom of the table when shouldScrollToBottom is true
  useEffect(() => {
    if (shouldScrollToBottom && tableContainerRef.current) {
      // Scroll to the bottom of the container
      tableContainerRef.current.scrollTop = tableContainerRef.current.scrollHeight;
      // Reset the flag
      setShouldScrollToBottom(false);
    }
  }, [shouldScrollToBottom]);

  // Filter state variables
  const [dateFilter, setDateFilter] = useState<string>('');
  const [nameFilter, setNameFilter] = useState<string>('');
  const [classificationFilter, setClassificationFilter] = useState<string>('');
  
  // Set default period filter to current month
  const getCurrentMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    return `${year}-${month}`;
  };
  
  const [periodFilter, setPeriodFilter] = useState<{type: 'all' | 'month' | 'quarter' | 'year', value: string}>({type: 'month', value: getCurrentMonth()});

  useEffect(() => {
    // Load data from Firebase when component mounts
    syncFinanceData().catch(error => {
      console.error('Error loading finance data:', error);
    });    
    syncCategories().catch(error => {
      console.error('Error loading categories:', error);
    });    
  }, [syncFinanceData, syncCategories]);

  // Apply filters to the data and sort by date (newest first)
  const filteredData = useMemo(() => {
    return financeData
      .filter(record => {
        // Date filter - используем оригинальный формат даты для фильтрации
        if (dateFilter && record.date !== dateFilter) {
          return false;
        }
        
        // Period filter
        if (periodFilter.type !== 'all') {
          const recordDate = new Date(record.date);
          const recordYear = recordDate.getFullYear().toString();
          const recordMonth = recordDate.getMonth() + 1; // месяцы в JS от 0 до 11
          const recordQuarter = Math.floor(recordDate.getMonth() / 3) + 1;
          
          switch(periodFilter.type) {
            case 'month':
              // periodFilter.value format: 'YYYY-MM'
              if (recordYear !== periodFilter.value.split('-')[0] || 
                  recordMonth !== parseInt(periodFilter.value.split('-')[1])) {
                return false;
              }
              break;
            case 'quarter':
              // periodFilter.value format: 'YYYY-Q' where Q is quarter number
              const [year, quarter] = periodFilter.value.split('-');
              if (recordYear !== year || recordQuarter !== parseInt(quarter.charAt(1))) {
                return false;
              }
              break;
            case 'year':
              // periodFilter.value format: 'YYYY'
              if (recordYear !== periodFilter.value) {
                return false;
              }
              break;
          }
        }
        
        // Name filter (partial match)
        if (nameFilter && !record.name.toLowerCase().includes(nameFilter.toLowerCase())) {
          return false;
        }
        
        // Classification filter (exact match)
        if (classificationFilter && record.classification !== classificationFilter) {
          return false;
        }
        
        return true;
      })
      .sort((a, b) => {
        // Sort by date, newest first
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB.getTime() - dateA.getTime(); // Descending order (newest first)
      });
  }, [financeData, dateFilter, nameFilter, classificationFilter, periodFilter]);

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

  // Wrapper function to add a record and trigger scroll to bottom
  const addFinanceRecordAndScroll = async (record: any) => {
    try {
      await addFinanceRecord(record);
      // Set flag to trigger scroll to bottom after the record is added
      setShouldScrollToBottom(true);
    } catch (error) {
      console.error('Error adding finance record:', error);
    }
  };

  const confirmDelete = (id: number | string) => {
    if (isAdmin) {
      setDeleteConfirmationId(id);
    }
  };

  const handleDelete = () => {
    if (deleteConfirmationId !== null) {
      deleteFinanceRecord(deleteConfirmationId);
      setDeleteConfirmationId(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmationId(null);
  };

  // Clear all filters - Reset to current month
  const clearFilters = () => {
    setDateFilter('');
    setNameFilter('');
    setClassificationFilter('');
    setPeriodFilter({type: 'month', value: getCurrentMonth()});
  };

  // Calculate total amount for filtered data
  const calculateTotalAmount = useMemo(() => {
    return filteredData.reduce((sum, record) => sum + record.total, 0);
  }, [filteredData]);

  // Get top 3 most expensive categories
  const getTopCategories = useMemo(() => {
    // Group records by classification and sum totals
    const categoryTotals: Record<string, number> = {};
    
    filteredData.forEach(record => {
      if (!categoryTotals[record.classification]) {
        categoryTotals[record.classification] = 0;
      }
      categoryTotals[record.classification] += record.total;
    });
    
    // Convert to array and sort by total (descending)
    const sortedCategories = Object.entries(categoryTotals)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);
    
    // Return top 3
    return sortedCategories.slice(0, 3);
  }, [filteredData]);

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Финансовый журнал</h1>
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
      <AnimatedAccordion title="Фильтры" defaultOpen={false}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
            <input
              type="text"
              placeholder="Фильтр по названию"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="w-56 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Классификация</label>
            <select
              value={classificationFilter}
              onChange={(e) => setClassificationFilter(e.target.value)}
              className="w-56 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
            >
              <option value="">Все классификации</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Период</label>
            <div className="flex space-x-2">
              <select
                value={periodFilter.type}
                onChange={(e) => setPeriodFilter({type: e.target.value as any, value: periodFilter.value})}
                className="w-1/2 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
              >
                <option value="all">Все</option>
                <option value="month">Месяц</option>
                <option value="quarter">Квартал</option>
                <option value="year">Год</option>
              </select>
              {periodFilter.type !== 'all' && (
                <select
                  value={periodFilter.value}
                  onChange={(e) => setPeriodFilter({...periodFilter, value: e.target.value})}
                  className="w-1/2 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
                >
                  {periodFilter.type === 'year' && Array.from({length: 10}, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return <option key={year} value={year.toString()}>{year}</option>;
                  })}
                  {periodFilter.type === 'month' && Array.from({length: 12}, (_, i) => {
                    const month = i + 1;
                    const year = new Date().getFullYear();
                    const monthStr = month < 10 ? `0${month}` : month;
                    const displayMonth = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'][i];
                    return <option key={month} value={`${year}-${monthStr}`}>{displayMonth}</option>;
                  })}
                  {periodFilter.type === 'quarter' && Array.from({length: 4}, (_, i) => {
                    const quarter = i + 1;
                    const year = new Date().getFullYear();
                    return <option key={quarter} value={`${year}-Q${quarter}`}>Q{quarter}</option>;
                  })}
                </select>
              )}
            </div>
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
      
      {/* Summary blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Total Amount Block */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Общая сумма</h3>
          <div className="flex items-center">
            <div className="text-3xl font-bold text-blue-600">
              {formatCurrencyWithSeparators(calculateTotalAmount)} ₽
            </div>
            <div className="ml-4 text-sm text-gray-500">
              по выбранным фильтрам
            </div>
          </div>
        </div>
        
        {/* Top 3 Categories Block */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Топ 3 категории</h3>
          <div className="space-y-3">
            {getTopCategories.length > 0 ? (
              getTopCategories.map((category, index) => (
                <div key={category.name} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3 ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 'bg-amber-700'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="font-medium text-gray-800">{category.name}</div>
                  </div>
                  <div className="font-semibold text-gray-700">
                    {formatCurrencyWithSeparators(category.total)} ₽
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-center py-4">
                Нет данных для отображения
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chart section */}
      <div className="md:block hidden overflow-y-scroll">
        <FinanceCharts records={filteredData} />
      </div>
      
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
      
      <AnimatedAccordion title="Таблица финансов" defaultOpen={true}>
        <div ref={tableContainerRef} className="mt-2 bg-white rounded-lg shadow-md border border-gray-200 overflow-y-auto max-h-[500px]">
          <div className="overflow-x-auto">
            {isDataLoading ? (
              <div className="py-12">
                <LoadingSpinner message="Загрузка финансовых данных..." />
              </div>
            ) : (
              <>
                {/* Mobile View - Card Layout */}
                <div className="block md:hidden overflow-y-scroll">
                  {filteredData.length > 0 ? (
                    filteredData.map((record) => (
                      <div key={record.id} className="border-b border-gray-200 p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div 
                            className={`flex-1 ${isAdmin ? 'cursor-pointer' : ''}`}
                            onClick={isAdmin ? () => openFormModal(record.id) : undefined}
                          >
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-medium text-gray-900">{record.name}</div>
                              <div className="text-sm text-gray-500">{formatDate(record.date)}</div>
                            </div>
                            <div className="mt-1 text-sm text-gray-500 truncate max-w-xs">{record.comment}</div>
                            <div className="mt-2 text-xs text-gray-500 space-y-1">
                              <div className="flex justify-between">
                                <span>Цена:</span>
                                <span className="font-medium">{formatCurrencyWithSeparators(record.price)} ₽</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Кол-во:</span>
                                <span className="font-medium">{record.quantity}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Сумма:</span>
                                <span className="font-medium">{formatCurrencyWithSeparators(record.total)} ₽</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Классификация:</span>
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Цена</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Кол-во</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Сумма</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Классификация</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Комментарий</th>
                      {isAdmin && (
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredData.length > 0 ? (
                      filteredData.map((record, index) => (
                        <tr 
                          key={record.id} 
                          className={`hover:bg-gray-50 ${isAdmin ? 'cursor-pointer' : ''}`}
                          onClick={isAdmin ? () => openFormModal(record.id) : undefined}
                        >
                          <td 
                            className="p-4 whitespace-nowrap text-sm text-gray-500"
                          >
                            {formatDate(record.date)}
                          </td>
                          <td 
                            className="p-4 whitespace-nowrap text-sm font-medium text-gray-900"
                          >
                            {record.name}
                          </td>
                          <td 
                            className="p-4 whitespace-nowrap text-sm text-gray-500"
                          >
                            {formatCurrencyWithSeparators(record.price)} ₽
                          </td>
                          <td 
                            className="p-4 whitespace-nowrap text-sm text-gray-500"
                          >
                            {record.quantity}
                          </td>
                          <td 
                            className="p4 whitespace-nowrap text-sm text-gray-500"
                          >
                            {formatCurrencyWithSeparators(record.total)} ₽
                          </td>
                          <td 
                            className="p-4 whitespace-nowrap text-sm text-gray-500"
                          >
                            {record.classification}
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
                        <td colSpan={isAdmin ? 8 : 7} className="p-4 text-center text-sm text-gray-500">
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
      </AnimatedAccordion>
      
      <AnimatedAccordion title="Управление категориями" defaultOpen={false}>
        <div className="max-h-96 overflow-y-auto pr-2">
          <CategoriesManager />
        </div>
      </AnimatedAccordion>
      
      {isAdmin && (
        <FinanceFormModal 
          isOpen={isFormModalOpen} 
          onClose={closeFormModal} 
          recordId={selectedRecordId} 
          onAdd={addFinanceRecordAndScroll} 
          onUpdate={updateFinanceRecord} 
        />
      )}
    </div>
  );
};

export default Finance;