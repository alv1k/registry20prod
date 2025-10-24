import { useState, useMemo, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import FinanceFormModal from '../components/FinanceFormModal';
import PlannedBudgetFormModal from '../components/PlannedBudgetFormModal';
import AnimatedAccordion from '../components/AnimatedAccordion';
import FinanceCharts from '../components/FinanceCharts';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/Button';
import { formatCurrencyWithSeparators, formatDate } from '../utils/formatUtils';
import { useAuth } from '../contexts/AuthContext';

const UnifiedFinance = () => {
  // Financial data
  const financeData = useStore((state) => state.financeData);
  const syncFinanceData = useStore((state) => state.syncFinanceData);
  const addFinanceRecord = useStore((state) => state.addFinanceRecord);
  const updateFinanceRecord = useStore((state) => state.updateFinanceRecord);
  const deleteFinanceRecord = useStore((state) => state.deleteFinanceRecord);
  const isFinanceDataLoading = useStore((state) => state.isFinanceDataLoading);
  const financeDataError = useStore((state) => state.financeDataError);
  
  // Planned budget data
  const plannedBudgetData = useStore((state) => state.plannedBudgetData);
  const syncPlannedBudgetData = useStore((state) => state.syncPlannedBudgetData);
  const addPlannedBudgetRecord = useStore((state) => state.addPlannedBudgetRecord);
  const updatePlannedBudgetRecord = useStore((state) => state.updatePlannedBudgetRecord);
  const deletePlannedBudgetRecord = useStore((state) => state.deletePlannedBudgetRecord);
  const isPlannedBudgetDataLoading = useStore((state) => state.isPlannedBudgetDataLoading);
  const plannedBudgetDataError = useStore((state) => state.plannedBudgetDataError);
  
  // Categories
  const categories = useStore((state) => state.categories);
  const syncCategories = useStore((state) => state.syncCategories);

  const { user, isAdmin } = useAuth();
  
  // Form modal states
  const [isFinanceFormModalOpen, setIsFinanceFormModalOpen] = useState(false);
  const [isPlannedBudgetFormModalOpen, setIsPlannedBudgetFormModalOpen] = useState(false);
  const [selectedFinanceRecordId, setSelectedFinanceRecordId] = useState<number | string | null>(null);
  const [selectedPlannedBudgetRecordId, setSelectedPlannedBudgetRecordId] = useState<number | string | null>(null);
  
  // Delete confirmation states
  const [deleteFinanceConfirmationId, setDeleteFinanceConfirmationId] = useState<number | string | null>(null);
  const [deletePlannedBudgetConfirmationId, setDeletePlannedBudgetConfirmationId] = useState<number | string | null>(null);
  
  // Active tab state
  const [activeTab, setActiveTab] = useState<'finance' | 'budget' | 'comparison' | 'analytics'>('finance');
  
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

  // Refs
  const financeTableContainerRef = useRef<HTMLDivElement>(null);
  const budgetTableContainerRef = useRef<HTMLDivElement>(null);

  // Load data from Firebase when component mounts
  useEffect(() => {
    // Load financial data
    syncFinanceData().catch(error => {
      console.error('Error loading finance data:', error);
    });
    
    // Load planned budget data
    syncPlannedBudgetData().catch(error => {
      console.error('Error loading planned budget data:', error);
    });
    
    // Load categories
    syncCategories().catch(error => {
      console.error('Error loading categories:', error);
    });
  }, [syncFinanceData, syncPlannedBudgetData, syncCategories]);

  // Open finance form modal
  const openFinanceFormModal = (id?: number | string | null) => {
    if (id !== undefined) {
      setSelectedFinanceRecordId(id);
    } else {
      setSelectedFinanceRecordId(null);
    }
    setIsFinanceFormModalOpen(true);
  };

  // Close finance form modal
  const closeFinanceFormModal = () => {
    setIsFinanceFormModalOpen(false);
    setSelectedFinanceRecordId(null);
  };

  // Open planned budget form modal
  const openPlannedBudgetFormModal = (id?: number | string | null) => {
    if (id !== undefined) {
      setSelectedPlannedBudgetRecordId(id);
    } else {
      setSelectedPlannedBudgetRecordId(null);
    }
    setIsPlannedBudgetFormModalOpen(true);
  };

  // Close planned budget form modal
  const closePlannedBudgetFormModal = () => {
    setIsPlannedBudgetFormModalOpen(false);
    setSelectedPlannedBudgetRecordId(null);
  };

  // Confirm delete for finance record
  const confirmDeleteFinance = (id: number | string) => {
    if (isAdmin) {
      setDeleteFinanceConfirmationId(id);
    }
  };

  // Handle delete for finance record
  const handleDeleteFinance = () => {
    if (deleteFinanceConfirmationId !== null) {
      deleteFinanceRecord(deleteFinanceConfirmationId);
      setDeleteFinanceConfirmationId(null);
    }
  };

  // Cancel delete for finance record
  const cancelDeleteFinance = () => {
    setDeleteFinanceConfirmationId(null);
  };

  // Confirm delete for planned budget record
  const confirmDeletePlannedBudget = (id: number | string) => {
    if (isAdmin) {
      setDeletePlannedBudgetConfirmationId(id);
    }
  };

  // Handle delete for planned budget record
  const handleDeletePlannedBudget = () => {
    if (deletePlannedBudgetConfirmationId !== null) {
      deletePlannedBudgetRecord(deletePlannedBudgetConfirmationId);
      setDeletePlannedBudgetConfirmationId(null);
    }
  };

  // Cancel delete for planned budget record
  const cancelDeletePlannedBudget = () => {
    setDeletePlannedBudgetConfirmationId(null);
  };

  // Clear all filters - Reset to current month
  const clearFilters = () => {
    setDateFilter('');
    setNameFilter('');
    setClassificationFilter('');
    setPeriodFilter({type: 'month', value: getCurrentMonth()});
  };

  // Apply filters to the data and sort by date (newest first)
  const filteredFinanceData = useMemo(() => {
    return financeData
      .filter(record => {
        // Date filter - используем оригинальный формат даты для фильтрации
        if (dateFilter && record.date !== dateFilter) {
          return false;
        }
        
        // Name filter (partial match)
        if (nameFilter && !record.name.toLowerCase().includes(nameFilter.toLowerCase())) {
          return false;
        }
        
        // Classification filter (exact match)
        if (classificationFilter && record.classification !== classificationFilter) {
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
        
        return true;
      })
      .sort((a, b) => {
        // Sort by date, newest first
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB.getTime() - dateA.getTime(); // Descending order (newest first)
      });
  }, [financeData, dateFilter, nameFilter, classificationFilter, periodFilter]);

  // Apply filters to the planned budget data and sort by date (soonest first)
  const filteredPlannedBudgetData = useMemo(() => {
    return plannedBudgetData
      .filter(record => {
        // Classification filter (partial match) - use classification instead of name for planned budgets
        if (nameFilter && record.classification && !record.classification.toLowerCase().includes(nameFilter.toLowerCase())) {
          return false;
        }
        
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
  }, [plannedBudgetData, nameFilter, classificationFilter, periodFilter]);

  // State for total finance expenses
  const [calculateTotalFinanceExpenses, setCalculateTotalFinanceExpenses] = useState(0);

  // Calculate total expenses for filtered financial data (negative values) when data changes
  useEffect(() => {
    const total = filteredFinanceData
      .filter(record => record.total >= 0) // Only expenses (negative values)
      .reduce((sum, record) => sum + Math.abs(record.total), 0); // Sum absolute values
    setCalculateTotalFinanceExpenses(total);
  }, [filteredFinanceData]);

  // State for total finance income
  const [calculateTotalFinanceIncome, setCalculateTotalFinanceIncome] = useState(0);

  // Calculate total income for filtered financial data (positive values) when data changes
  useEffect(() => {
    const total = filteredFinanceData
      .filter(record => record.total >= 0) // Only income (non-negative values)
      .reduce((sum, record) => sum + record.total, 0);
    setCalculateTotalFinanceIncome(total);
  }, [filteredFinanceData]);

  // State for total planned amount
  const [calculateTotalPlannedAmount, setCalculateTotalPlannedAmount] = useState(0);

  // Calculate total planned amount when filtered data changes
  useEffect(() => {
    const total = filteredPlannedBudgetData.reduce((sum, record) => sum + record.plannedAmount, 0);
    setCalculateTotalPlannedAmount(total);
  }, [filteredPlannedBudgetData]);

  // Calculate actual expenses for a specific planned budget item
  const calculateActualExpensesForPlannedItem = (plannedItemClassification: string) => {
    // Find actual expenses that match this planned item's classification AND current filters
    const matchingExpenses = filteredFinanceData.filter(expense => 
      expense.classification === plannedItemClassification && expense.total < 0
    );
    
    // Sum up the matching expenses (use absolute value for expenses)
    return matchingExpenses.reduce((sum, expense) => sum + Math.abs(expense.total), 0);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Финансовый каталог и бюджетирование</h1>
      </div>
      
      {/* Two big buttons for adding records */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div 
          className="bg-white rounded-lg shadow-md p-6 border border-gray-200 cursor-pointer hover:bg-blue-50 transition-colors"
          onClick={() => openFinanceFormModal()}
        >
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Добавить финансовую запись</h3>
              <p className="text-gray-600">Фактические доходы и расходы</p>
            </div>
          </div>
        </div>
        
        <div 
          className="bg-white rounded-lg shadow-md p-6 border border-gray-200 cursor-pointer hover:bg-green-50 transition-colors"
          onClick={() => openPlannedBudgetFormModal()}
        >
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Добавить запланированный бюджет</h3>
              <p className="text-gray-600">Планируемые расходы и доходы</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs for different views */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => {
                setActiveTab('finance');
                clearFilters();
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'finance'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Финансовые записи ({filteredFinanceData.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('budget');
                clearFilters();
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'budget'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Запланированные бюджеты ({filteredPlannedBudgetData.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('comparison');
                clearFilters();
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'comparison'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Сравнение план/факт
            </button>
            <button
              onClick={() => {
                setActiveTab('analytics');
                clearFilters();
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Аналитика
            </button>
          </nav>
        </div>
      </div>
      
      {/* Tab Content */}
      {activeTab === 'finance' && (
        <div>
          <div className="md:flex md:gap-3">
            {/* Finance Filters Accordion */}
            <AnimatedAccordion title="Фильтры" defaultOpen={true}>
              <div className="flex flex-wrap gap-4">                          
                <div className="min-w-[224px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
                  <input
                    type="text"
                    placeholder="Фильтр по названию"
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
                  />
                </div>
                
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
            <div className="bg-white rounded-lg shadow-md md:p-6 my-0 md:my-3 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Расходы</h3>
                <div className="flex items-center">
                <div className="text-3xl font-bold text-red-600">
                  {formatCurrencyWithSeparators(calculateTotalFinanceExpenses)} ₽
                </div>
                <div className="ml-4 text-sm text-gray-500">
                  по выбранным фильтрам
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md md:p-6 my-0 md:my-3 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Доходы</h3>
                <div className="flex items-center">
                <div className="text-3xl font-bold text-green-600">
                  {formatCurrencyWithSeparators(calculateTotalFinanceIncome)} ₽
                </div>
              </div>
            </div>
          </div>
          
          {/* Finance Records Table */}
          <AnimatedAccordion title="Таблица финансов" defaultOpen={true}>
            <div ref={financeTableContainerRef} className="mt-2 bg-white rounded-lg shadow-md border border-gray-200 overflow-y-auto max-h-[500px]">
              <div className="overflow-x-auto">
                {isFinanceDataLoading ? (
                  <div className="py-12">
                    <LoadingSpinner message="Загрузка финансовых данных..." />
                  </div>
                ) : (
                  <>
                    {/* Desktop View - Table */}
                    <table className="hidden md:table divide-y divide-gray-200 min-w-full">
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
                        {filteredFinanceData.length > 0 ? (
                          filteredFinanceData.map((record) => (
                            <tr 
                              key={record.id} 
                              className={`hover:bg-gray-50 ${isAdmin ? 'cursor-pointer' : ''}`}
                              onClick={isAdmin ? () => openFinanceFormModal(record.id) : undefined}
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
                                className={`p-4 whitespace-nowrap text-sm ${record.total >= 0 ? 'text-green-600' : 'text-red-600'}`}
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
                                      confirmDeleteFinance(record.id);
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
                    
                    {/* Mobile View - Card Layout */}
                    <div className="block md:hidden overflow-y-scroll">
                      {filteredFinanceData.length > 0 ? (
                        filteredFinanceData.map((record) => (
                          <div key={record.id} className="border-b border-gray-200 p-4 hover:bg-gray-50">
                            <div 
                              className={`flex-1 ${isAdmin ? 'cursor-pointer' : ''}`}
                              onClick={isAdmin ? () => openFinanceFormModal(record.id) : undefined}
                            >
                              <div className="flex items-center justify-between">
                                <div className="text-sm font-medium text-gray-900">{record.classification}</div>
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
                                  <span className={`font-medium ${record.total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrencyWithSeparators(record.total)} ₽
                                  </span>
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
                                    confirmDeleteFinance(record.id);
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
                  </>
                )}
              </div>
            </div>
          </AnimatedAccordion>
        </div>
      )}
      
      {activeTab === 'budget' && (
        <div>
          {/* Planned Budget Filters Accordion */}
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
          
          {/* Summary blocks for planned budget */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
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
            
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Потрачено</h3>
              <div className="flex items-center">
                <div className="text-3xl font-bold text-green-600">
                  {formatCurrencyWithSeparators(calculateTotalFinanceExpenses)} ₽
                </div>
                <div className="ml-4 text-sm text-gray-500">
                  по выбранным фильтрам
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Отклонение</h3>
              <div className="flex items-center">
                <div className={`text-3xl font-bold ${calculateTotalFinanceExpenses - calculateTotalPlannedAmount >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrencyWithSeparators(Math.abs(calculateTotalFinanceExpenses - calculateTotalPlannedAmount))} ₽
                </div>
                <div className="ml-4 text-sm text-gray-500">
                  {calculateTotalFinanceExpenses - calculateTotalPlannedAmount >= 0 ? 'Превышение' : 'Экономия'}
                </div>
              </div>
            </div>
          </div>
          
          {/* Planned Budget Records Table */}
          <AnimatedAccordion title="Таблица запланированного бюджета" defaultOpen={true}>
            <div ref={budgetTableContainerRef} className="mt-2 bg-white rounded-lg shadow-md border border-gray-200 overflow-y-auto max-h-[500px]">
              <div className="overflow-x-auto">
                {isPlannedBudgetDataLoading ? (
                  <div className="py-12">
                    <LoadingSpinner message="Загрузка данных запланированного бюджета..." />
                  </div>
                ) : (
                  <>
                    {/* Desktop View - Table */}
                    <table className="hidden md:table divide-y divide-gray-200 min-w-full">
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
                        {filteredPlannedBudgetData.length > 0 ? (
                          filteredPlannedBudgetData.map((record) => (
                            <tr 
                              key={record.id} 
                              className={`hover:bg-gray-50 ${isAdmin ? 'cursor-pointer' : ''}`}
                              onClick={isAdmin ? () => openPlannedBudgetFormModal(record.id) : undefined}
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
                                {formatCurrencyWithSeparators(calculateActualExpensesForPlannedItem(record.classification))} ₽
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
                                      confirmDeletePlannedBudget(record.id);
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
                    
                    {/* Mobile View - Card Layout */}
                    <div className="block md:hidden overflow-y-scroll">
                      {filteredPlannedBudgetData.length > 0 ? (
                        filteredPlannedBudgetData.map((record) => (
                          <div key={record.id} className="border-b border-gray-200 p-4 hover:bg-gray-50">
                            <div 
                              className={`flex-1 ${isAdmin ? 'cursor-pointer' : ''}`}
                              onClick={isAdmin ? () => openPlannedBudgetFormModal(record.id) : undefined}
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
                                {calculateActualExpensesForPlannedItem(record.classification) !== 0 && (
                                  <div className="flex justify-between">
                                    <span>Потрачено:</span>
                                    <span className="font-medium">{formatCurrencyWithSeparators(calculateActualExpensesForPlannedItem(record.classification))} 33₽</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            {isAdmin && (
                              <div className="ml-4 flex-shrink-0">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    confirmDeletePlannedBudget(record.id);
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
                  </>
                )}
              </div>
            </div>
          </AnimatedAccordion>
        </div>
      )}
      
      {activeTab === 'comparison' && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Сравнение план/факт</h3>
          <p className="text-gray-600">Здесь будет отображаться сравнение запланированных и фактических расходов по категориям.</p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800">Запланировано: {formatCurrencyWithSeparators(calculateTotalPlannedAmount)} ₽</h4>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-800">Фактически потрачено: {formatCurrencyWithSeparators(calculateTotalFinanceExpenses)} ₽</h4>
            </div>
          </div>
          <div className="mt-4">
            <div className={`p-4 rounded-lg ${calculateTotalFinanceExpenses - calculateTotalPlannedAmount >= 0 ? 'bg-red-50' : 'bg-green-50'}`}>
              <h4 className={`font-medium ${calculateTotalFinanceExpenses - calculateTotalPlannedAmount >= 0 ? 'text-red-800' : 'text-green-800'}`}>
                Отклонение: {formatCurrencyWithSeparators(Math.abs(calculateTotalFinanceExpenses - calculateTotalPlannedAmount))} ₽ 
                ({calculateTotalFinanceExpenses - calculateTotalPlannedAmount >= 0 ? 'превышение' : 'экономия'})
              </h4>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'analytics' && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Аналитика и отчеты</h3>
          <p className="text-gray-600">Здесь будут отображаться графики и аналитические данные по финансам и бюджетированию.</p>
          {/* Finance Charts Component would go here */}
        </div>
      )}
      
      {/* Delete Confirmation Modals */}
      {isAdmin && deleteFinanceConfirmationId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Подтверждение удаления</h3>
            <p className="text-gray-600 mb-6">Вы уверены, что хотите удалить эту финансовую запись? Это действие нельзя отменить.</p>
            <div className="flex justify-end space-x-3">
              <Button
                onClick={cancelDeleteFinance}
                variant="secondary"
              >
                Отмена
              </Button>
              <Button
                onClick={handleDeleteFinance}
                variant="danger"
              >
                Удалить
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {isAdmin && deletePlannedBudgetConfirmationId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Подтверждение удаления</h3>
            <p className="text-gray-600 mb-6">Вы уверены, что хотите удалить эту запись запланированного бюджета? Это действие нельзя отменить.</p>
            <div className="flex justify-end space-x-3">
              <Button
                onClick={cancelDeletePlannedBudget}
                variant="secondary"
              >
                Отмена
              </Button>
              <Button
                onClick={handleDeletePlannedBudget}
                variant="danger"
              >
                Удалить
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Finance Form Modal */}
      {isAdmin && (
        <FinanceFormModal 
          isOpen={isFinanceFormModalOpen} 
          onClose={closeFinanceFormModal} 
          recordId={selectedFinanceRecordId} 
          onAdd={addFinanceRecord} 
          onUpdate={updateFinanceRecord} 
        />
      )}
      
      {/* Planned Budget Form Modal */}
      {isAdmin && (
        <PlannedBudgetFormModal 
          isOpen={isPlannedBudgetFormModalOpen} 
          onClose={closePlannedBudgetFormModal} 
          recordId={selectedPlannedBudgetRecordId} 
          onAdd={addPlannedBudgetRecord} 
          onUpdate={updatePlannedBudgetRecord} 
        />
      )}
    </div>
  );
};

export default UnifiedFinance;