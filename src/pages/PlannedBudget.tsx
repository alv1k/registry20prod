import { useState, useMemo, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import PlannedBudgetFormModal from '../components/PlannedBudgetFormModal';
import AnimatedAccordion from '../components/AnimatedAccordion';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatCurrencyWithSeparators, formatDate } from '../utils/formatUtils';
import { useAuth } from '../contexts/AuthContext';

const PlannedBudget = () => {
  const plannedBudgetData = useStore((state) => state.plannedBudgetData);
  const syncPlannedBudgetData = useStore((state) => state.syncPlannedBudgetData);
  const addPlannedBudgetRecord = useStore((state) => state.addPlannedBudgetRecord);
  const updatePlannedBudgetRecord = useStore((state) => state.updatePlannedBudgetRecord);
  const deletePlannedBudgetRecord = useStore((state) => state.deletePlannedBudgetRecord);
  const isDataLoading = useStore((state) => state.isPlannedBudgetDataLoading);
  const dataError = useStore((state) => state.plannedBudgetDataError);
  const categories = useStore((state) => state.categories);
  const syncCategories = useStore((state) => state.syncCategories);

  const { user, isAdmin } = useAuth();
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState<number | string | null>(null);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<number | string | null>(null);

  // Ref for the table container
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Filter state variables
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
    syncPlannedBudgetData().catch(error => {
      console.error('Error loading planned budget data:', error);
    });    
    syncCategories().catch(error => {
      console.error('Error loading categories:', error);
    });    
  }, [syncPlannedBudgetData, syncCategories]);

  // Apply filters to the data and sort by date (soonest first)
  const filteredData = useMemo(() => {
    return plannedBudgetData
      .filter(record => {
        // Classification filter (exact match)
        if (classificationFilter && record.classification !== classificationFilter) {
          return false;
        }
        
        // Period filter
        if (periodFilter.type !== 'all') {
          const recordDate = new Date(record.plannedDate);
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
        
        return true;
      })
      .sort((a, b) => {
        // Sort by planned date, soonest first
        const dateA = new Date(a.plannedDate);
        const dateB = new Date(b.plannedDate);
        return dateA.getTime() - dateB.getTime(); // Ascending order (soonest first)
      });
  }, [plannedBudgetData, classificationFilter, periodFilter]);
  
  console.log(filteredData, 'filteredData');
  
  // Get all finance data to calculate actual spending
  const financeData = useStore((state) => state.financeData);
  
  // Calculate actual spending by classification based on current filters
  const calculateActualSpendingByClassification = useMemo(() => {
    // First, filter finance data by the same period filter as planned budget
    const filteredFinanceData = financeData.filter(record => {
      console.log(record, 'here');
      
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
      
      return true;
    });
    
    // Group finance data by classification and sum the totals
    const spendingByClassification: Record<string, number> = {};
    filteredFinanceData.forEach(record => {
      if (spendingByClassification[record.classification]) {
        spendingByClassification[record.classification] += record.total;
      } else {
        spendingByClassification[record.classification] = record.total;
      }
    });
    
    return spendingByClassification;
  }, [financeData, periodFilter]);

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

  const confirmDelete = (id: number | string) => {
    if (isAdmin) {
      setDeleteConfirmationId(id);
    }
  };

  const handleDelete = () => {
    if (deleteConfirmationId !== null) {
      deletePlannedBudgetRecord(deleteConfirmationId);
      setDeleteConfirmationId(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmationId(null);
  };

  // Clear all filters - Reset to current month
  const clearFilters = () => {
    setClassificationFilter('');
    setPeriodFilter({type: 'month', value: getCurrentMonth()});
  };

  // Calculate total planned amount for filtered data
  const calculateTotalPlannedAmount = useMemo(() => {
    return filteredData.reduce((sum, record) => sum + record.plannedAmount, 0);
  }, [filteredData]);

  // Calculate total actual amount based on filtered finance data
  const calculateTotalActualAmount = useMemo(() => {
    return Object.values(calculateActualSpendingByClassification).reduce((sum, amount) => sum + amount, 0);
  }, [calculateActualSpendingByClassification]);

  // Calculate variance (planned vs actual)
  const calculateVariance = useMemo(() => {
    return calculateTotalActualAmount - calculateTotalPlannedAmount;
  }, [calculateTotalActualAmount, calculateTotalPlannedAmount]);

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Запланированный бюджет</h1>
        <div className="flex flex-wrap gap-3">
          {isAdmin && (
            <Button 
              onClick={() => openFormModal()}
              className="flex items-center"
              variant="primary"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Добавить
            </Button>
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
        <div className="flex flex-wrap gap-4">          
          <div className="min-w-[224px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Классификация</label>
            <select
              value={classificationFilter}
              onChange={(e) => setClassificationFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
            >
              <option value="">Не выбрано</option>
              {categories
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          

          
          <div className="min-w-[224px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Период</label>
            <div className="flex space-x-2">
              <select
                value={periodFilter.type}
                onChange={(e) => setPeriodFilter({type: e.target.value as any, value: periodFilter.value})}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
              >
                <option value="all">Весь</option>
                <option value="month">Месяц</option>
                <option value="quarter">Квартал</option>
                <option value="year">Год</option>
              </select>
              {periodFilter.type !== 'all' && (
                <select
                  value={periodFilter.value}
                  onChange={(e) => setPeriodFilter({...periodFilter, value: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
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
          <Button
            onClick={clearFilters}
            variant="secondary"
          >
            Очистить фильтры
          </Button>
        </div>
      </AnimatedAccordion>
      
      {/* Summary blocks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* Total Planned Amount Block */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Запланировано</h3>
          <div className="flex items-center">
            <div className="text-3xl font-bold text-blue-600">
              {formatCurrencyWithSeparators(calculateTotalPlannedAmount)} ₽
            </div>
            <div className="ml-4 text-sm text-gray-500">
              по выбранным фильтрам
            </div>
          </div>
        </div>
        
        {/* Total Actual Amount Block */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Потрачено</h3>
          <div className="flex items-center">
            <div className="text-3xl font-bold text-green-600">
              {formatCurrencyWithSeparators(calculateTotalActualAmount)} ₽
            </div>
            <div className="ml-4 text-sm text-gray-500">
              по выбранным фильтрам
            </div>
          </div>
        </div>
        
        {/* Variance Block */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Отклонение</h3>
          <div className="flex items-center">
            <div className={`text-3xl font-bold ${calculateVariance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatCurrencyWithSeparators(Math.abs(calculateVariance))} ₽
            </div>
            <div className="ml-4 text-sm text-gray-500">
              {calculateVariance >= 0 ? 'Превышение' : 'Экономия'}
            </div>
          </div>
        </div>
      </div>

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
      
      <AnimatedAccordion title="Таблица запланированного бюджета" defaultOpen={true}>
        <div ref={tableContainerRef} className="mt-2 bg-white rounded-lg shadow-md border border-gray-200 overflow-y-auto max-h-[500px]">
          <div className="overflow-x-auto">
            {isDataLoading ? (
              <div className="py-12">
                <LoadingSpinner message="Загрузка данных запланированного бюджета..." />
              </div>
            ) : (
              <>
                {/* Mobile View - Card Layout */}
                <div className="block md:hidden overflow-y-scroll">
                  {filteredData.length > 0 ? (
                    filteredData.map((record) => (
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
                              <span className="font-medium">{formatCurrencyWithSeparators(record.plannedAmount)} ₽</span>
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Потрачено22</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата</th>
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
                            {Object.entries(record).map(([key, value]) => {
                                console.log(key, value, 'test');
                                return key;
                              }) 
                            }
                            {/* {(() => {
                              const actualSpending = calculateActualSpendingByClassification[record.classification] || 0;
                              return formatCurrencyWithSeparators(actualSpending) + ' ₽';
                            })()} */}
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
      
      {isAdmin && (
        <PlannedBudgetFormModal 
          isOpen={isFormModalOpen} 
          onClose={closeFormModal} 
          recordId={selectedRecordId} 
          onAdd={addPlannedBudgetRecord} 
          onUpdate={updatePlannedBudgetRecord} 
        />
      )}
    </div>
  );
};

export default PlannedBudget;