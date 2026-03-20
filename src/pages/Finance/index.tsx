import { useState, useMemo, useEffect, useRef } from 'react';
import { useStore } from '../../store/useStore';
import FinanceModal from './components/financeModal';
import CategoryModal from './components/categoryModal';
import AnimatedAccordion from '../../components/AnimatedAccordion';
import Charts from './components/charts';
import CategoryManager from './components/categoryManager';
import GroceryListManager from './components/groceryListManager';
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/Button';
import Tabs from '../../components/Tabs';
import { formatCurrencyWithSeparators, formatDate } from '../../utils/formatUtils';
import { useAuth } from '../../contexts/AuthContext';
import { exportRecordsToExcel } from '../../utils/exportUtils';
import { FiPlus, FiDownload, FiX, FiTrash2, FiChevronDown, FiCamera } from 'react-icons/fi';
import useIsMobile from '../../hooks/useIsMobile';
import ReceiptScannerModal from './components/ReceiptScannerModal';
import useReceiptQueue from '../../hooks/useReceiptQueue';

// Type the icons properly
const PlusIcon = FiPlus as React.FC<React.SVGProps<SVGSVGElement>>;
const DownloadIcon = FiDownload as React.FC<React.SVGProps<SVGSVGElement>>;
const XIcon = FiX as React.FC<React.SVGProps<SVGSVGElement>>;
const TrashIcon = FiTrash2 as React.FC<React.SVGProps<SVGSVGElement>>;
const ChevronDownIcon = FiChevronDown as React.FC<React.SVGProps<SVGSVGElement>>;
const CameraIcon = FiCamera as React.FC<React.SVGProps<SVGSVGElement>>;

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
  
  const [isFinanceFormModalOpen, setIsFinanceFormModalOpen] = useState(false);
  const [isCategoryFormModalOpen, setIsCategoryFormModalOpen] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState<number | string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | string | null>(null);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<number | string | null>(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);

  // Ref for the table container
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Ref for the categories content container
  const categoriesContentRef = useRef<HTMLDivElement>(null);
  const [categoriesHeight, setCategoriesHeight] = useState<number | string>('auto');

  const isMobile = useIsMobile();

  // Receipt scanner state
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerInitialItems, setScannerInitialItems] = useState<any[] | undefined>(undefined);
  const [scannerInitialDate, setScannerInitialDate] = useState<string | undefined>(undefined);
  const [scannerInitialComment, setScannerInitialComment] = useState<string | undefined>(undefined);
  const { pendingCount, processedResults, clearProcessedResult, refreshCount } = useReceiptQueue();

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
  const [showAllExpensesByCategory, setShowAllExpensesByCategory] = useState<boolean>(false);
  
  // Keep getCurrentMonth function for clearFilters
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
        
        // Name and comment filter (partial match in both fields)
        if (nameFilter &&
            !record.name.toLowerCase().includes(nameFilter.toLowerCase()) &&
            !record.comment.toLowerCase().includes(nameFilter.toLowerCase())) {
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

  const openFinanceFormModal = (id?: number | string | null) => {
    if (id !== undefined) {
      setSelectedRecordId(id);
    } else {
      setSelectedRecordId(null);
    }
    setIsFinanceFormModalOpen(true);
  };

  const closeFinanceFormModal = () => {
    setIsFinanceFormModalOpen(false);
    setSelectedRecordId(null);
  };

  const openCategoryFormModal = (id?: number | string | null) => {
    if (id !== undefined) {
      setSelectedCategoryId(id);
    } else {
      setSelectedCategoryId(null);
    }
    setIsCategoryFormModalOpen(true);
  };

  const closeCategoryFormModal = () => {
    setIsCategoryFormModalOpen(false);
    setSelectedCategoryId(null);
  };

  // We'll store the grocery list manager's open function once it registers
  const groceryListOpenFunctionRef = useRef<(() => void) | null>(null);

  const openGroceryListFormModal = (id?: number | string | null) => {
    if (groceryListOpenFunctionRef.current) {
      groceryListOpenFunctionRef.current();
    }
  }

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
  const getExpensesByCategories = useMemo(() => {
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
    return showAllExpensesByCategory ? sortedCategories : sortedCategories.slice(0, 3);
  }, [filteredData, showAllExpensesByCategory]);

  // Update height of categories container when categories change
  useEffect(() => {
    // Use setTimeout to allow DOM to update first
    const timer = setTimeout(() => {
      if (categoriesContentRef.current) {
        const contentHeight = categoriesContentRef.current.scrollHeight;
        const newHeight = showAllExpensesByCategory
          ? contentHeight
          : Math.min(contentHeight, 150);
        // Handle case when there are no categories
        setCategoriesHeight(getExpensesByCategories.length > 0 ? newHeight : 60); // Provide default height for no-data case
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [getExpensesByCategories, showAllExpensesByCategory]);

  const handleRecordsDownload = () => {
    // Export the filtered finance data to Excel
    exportRecordsToExcel(
      filteredData,
      `Финансовые_записи_${new Date().toISOString().slice(0, 10)}.xlsx`,
      'Финансовые записи'
    );
  }

  const showAllExpensesByCategoryHandler = () => {
    setShowAllExpensesByCategory(prev => !prev);
  }
  
  // Handle receipt scanner results
  const handleScannerItemsReady = (items: any[], date: string, comment: string) => {
    const financeItems = items.map((item: any) => ({
      id: item.id,
      name: item.name,
      price: String(item.price),
      quantity: String(item.quantity),
      classification: item.classification,
      total: item.total,
    }));
    setScannerInitialItems(financeItems);
    setScannerInitialDate(date);
    setScannerInitialComment(comment);
    setSelectedRecordId(null);
    setIsFinanceFormModalOpen(true);
  };

  // Handle processed queue results
  const handleProcessedResult = (result: typeof processedResults[0]) => {
    const items = result.result.items.map((item, i) => ({
      id: `${Date.now()}-${i}`,
      name: item.name,
      price: String(item.price),
      quantity: String(item.quantity),
      classification: '',
      total: item.total,
    }));
    setScannerInitialItems(items);
    setScannerInitialDate(result.result.date || new Date().toISOString().split('T')[0]);
    setScannerInitialComment(result.result.storeName ? `Магазин: ${result.result.storeName}` : '');
    setSelectedRecordId(null);
    setIsFinanceFormModalOpen(true);
    clearProcessedResult(result.queueId);
  };

  const financeTabs = [
    {
      id: 'tab1',
      title: 'Финансы',
      content: (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex sm:items-center sm:justify-between gap-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Записи</h3>
              <div className="flex gap-3 ms-auto">
                {isAdmin && (
                  <>
                    <Button
                      onClick={() => setIsScannerOpen(true)}
                      variant="secondary"
                      className="flex items-center relative"
                      title="Сканировать чек"
                    >
                      <CameraIcon />
                      {pendingCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                          {pendingCount}
                        </span>
                      )}
                    </Button>
                    <Button
                      onClick={() => openFinanceFormModal()}
                      variant="primary"
                      className="flex items-center"
                    >
                      <PlusIcon className="mr-2" />
                      Добавить
                    </Button>
                  </>
                )}
                <Button
                  onClick={handleRecordsDownload}
                  variant="secondary"
                  className="flex items-center"
                >
                  <DownloadIcon />
                </Button>
              </div>
            </div>
          </div>

          <div ref={tableContainerRef} className="overflow-y-auto max-h-[600px]">
            <div className="overflow-x-auto">
              {isDataLoading ? (
                <div className="py-12 flex justify-center">
                  <LoadingSpinner message="Загрузка финансовых данных..." />
                </div>
              ) : (
                <>
                  {/* Mobile View - Card Layout */}
                  <div className="sm:hidden divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredData.length > 0 ? (
                      filteredData.map((record) => (
                        <div
                          key={record.id}
                          className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${isAdmin ? 'cursor-pointer' : ''}`}
                          onClick={isAdmin ? () => openFinanceFormModal(record.id) : undefined}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div className="font-medium text-gray-900 dark:text-white">{record.name}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(record.date)}</div>
                              </div>
                              <div className="mt-1 text-sm text-gray-500 dark:text-gray-400 truncate text-wrap">{record.comment}</div>
                              <div className="mt-3 space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-300">Цена:</span>
                                  <span className="font-medium dark:text-gray-200">{formatCurrencyWithSeparators(record.price)} ₽</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-300">Кол-во:</span>
                                  <span className="font-medium dark:text-gray-200">{record.quantity}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-300">Сумма:</span>
                                  <span className="font-medium text-green-600 dark:text-green-400">{formatCurrencyWithSeparators(record.total)} ₽</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-300">Категория:</span>
                                  <span className="font-medium dark:text-gray-200">{record.classification}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          {isAdmin && (
                            <div className="flex-shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  confirmDelete(record.id);
                                }}
                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1 text-sm"
                                title="Удалить запись"
                              >
                                {
                                  !isMobile ?
                                  <TrashIcon className="h-5 w-5" />
                                  :
                                  'Удалить'
                                }
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        Нет данных, соответствующих фильтрам. Попробуйте изменить параметры фильтрации.
                      </div>
                    )}
                  </div>

                  {/* Desktop View - Table */}
                  <table className="hidden sm:table min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Дата</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Название</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Цена</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Кол-во</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Сумма</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Категория</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Комментарий</th>
                        {isAdmin && (
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Действия</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredData.length > 0 ? (
                        filteredData.map((record, index) => (
                          <tr
                            key={record.id}
                            className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${isAdmin ? 'cursor-pointer' : ''}`}
                            onClick={isAdmin ? () => openFinanceFormModal(record.id) : undefined}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(record.date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {record.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {formatCurrencyWithSeparators(record.price)} ₽
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {record.quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400 font-medium">
                              {formatCurrencyWithSeparators(record.total)} ₽
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {record.classification}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                              {record.comment}
                            </td>
                            {isAdmin && (
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end space-x-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      confirmDelete(record.id);
                                    }}
                                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1"
                                    title="Удалить запись"
                                  >
                                    <TrashIcon className="h-5 w-5" />
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={isAdmin ? 8 : 7} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
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
        </div>
      )
    },{
      id: 'tab2',
      title: 'Бюджет',
      content: (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Планирование бюджета</h3>
          <p className="text-gray-700 dark:text-gray-300">Здесь будет отображаться информация о запланированном бюджете.</p>
          <ul className="mt-2 space-y-1">
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              <span className="text-gray-700 dark:text-gray-300">Доходы и расходы</span>
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              <span className="text-gray-700 dark:text-gray-300">Категории расходов</span>
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
              <span className="text-gray-700 dark:text-gray-300">Отчеты</span>
            </li>
          </ul>
        </div>
      )
    },{
      id: 'tab3',
      title: 'Аналитика',
      content: (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Аналитика</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Total Amount Block */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-blue-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300">Общая сумма</h4>
                  <div className="mt-2 text-2xl font-bold text-blue-700 dark:text-blue-400">
                    {formatCurrencyWithSeparators(calculateTotalAmount)} ₽
                  </div>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-gray-700 rounded-lg">
                  <DownloadIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                по выбранным фильтрам
              </div>
            </div>

            {/* Top 3 Categories Block */}
            <div className="bg-gradient-to-br min-h-[210px] from-indigo-50 to-indigo-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-indigo-100 dark:border-gray-700">
              <div className="flex justify-between">
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  <span className="relative h-5 text-nowrap">
                    <span className={`
                      absolute inset-0 transition-opacity duration-300 ease-in-out
                      ${showAllExpensesByCategory ? 'opacity-0' : 'opacity-100'}
                    `}>
                      Топ 3 категории
                    </span>
                    <span className={`
                      absolute inset-0 transition-opacity duration-300 ease-in-out
                      ${showAllExpensesByCategory ? 'opacity-100' : 'opacity-0'}
                    `}>
                      Расходы по категориям
                    </span>
                  </span>
                </h4>
                <span
                  className="transition-transform duration-300 ease-in-out cursor-pointer text-gray-600 dark:text-gray-300"
                  style={{
                    transform: showAllExpensesByCategory ? 'rotate(0deg)' : 'rotate(180deg)'
                  }}
                  onClick={() => showAllExpensesByCategoryHandler()}
                >
                    <ChevronDownIcon />
                </span>
              </div>
              <div
                ref={categoriesContentRef}
                className={`
                  mt-4 space-y-4 overflow-hidden
                `}
                style={{
                  height: categoriesHeight + 'px',
                  transition: 'height 0.5s ease-in-out'
                }}
              >
                {getExpensesByCategories.length > 0 ? (
                  getExpensesByCategories.map((category, index) => (
                    <div key={category.name} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3 ${
                          index === 0 ? 'bg-yellow-500' :
                          index === 1 ? 'bg-gray-400' :
                          index === 2 ? 'bg-amber-700' : 'bg-slate-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="text-gray-900 font-medium truncate max-w-[100px] md:max-w-fit dark:text-white">{category.name}</div>
                      </div>
                      <div className="font-semibold text-gray-700 dark:text-gray-300">
                        {formatCurrencyWithSeparators(category.total)} ₽
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-center py-4 dark:text-gray-400">
                    Нет данных для отображения
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
            <Charts records={filteredData} />
          </div>
        </div>
      )
    },{
      id: 'tab4',
      title: 'Категории',
      content: (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Управление категориями</h3>
              {isAdmin && (
                <Button
                  onClick={() => openCategoryFormModal()}
                  variant="primary"
                  className="flex items-center"
                >
                  <PlusIcon className="mr-2" />
                  Добавить
                </Button>
              )}
            </div>
          </div>
          <div className="p-6">
            <div className="max-h-96 overflow-y-auto">
              <CategoryManager onAddCategoryClick={() => openCategoryFormModal()} />
            </div>
          </div>
        </div>
      )
    },{
      id: 'tab5',
      title: 'Список покупок',
      content: (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between gap-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Список покупок</h3>
              {isAdmin && (
                <Button
                  onClick={() => openGroceryListFormModal()}
                  variant="primary"
                  className="flex items-center"
                >
                  <PlusIcon className={ isMobile ? '' : 'mr-2' } />
                  {
                    !isMobile &&
                    'Добавить покупки'
                  }
                </Button>
              )}
            </div>
          </div>
          <div className="p-6">
            <div className="max-h-96 overflow-y-auto">
              <GroceryListManager
                onRegisterOpenForm={(func) => {
                  groceryListOpenFunctionRef.current = func;
                }}
                onAddGroceryClick={() => openGroceryListFormModal()}
              />
            </div>
          </div>
        </div>
      )
    },
  ];

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Каталог финансов</h1>

      {/* Error message */}
      {dataError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-6 flex items-center">
          <XIcon className="h-5 w-5 mr-2" />
          {dataError}
        </div>
      )}

      {/* Filter Controls - Accordion */}
      <AnimatedAccordion title="Фильтры" defaultOpen={true}>
        <div className="md:flex gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Название и комментарий</label>
            <input
              type="text"
              placeholder="Фильтр по названию и комментарию"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="w-56 p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Классификация</label>
            <select
              value={classificationFilter}
              onChange={(e) => setClassificationFilter(e.target.value)}
              className="w-56 p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="" className="dark:bg-gray-700 dark:text-white">Не выбрано</option>
              {categories
                .sort((a, b) => a.name.localeCompare(b.name))
                .filter((a) => a.type === 'expense')
                .map((category) => (
                <option key={category.id} value={category.name} className="dark:bg-gray-700 dark:text-white">
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Период</label>
            <div className="flex space-x-2">
              <select
                value={periodFilter.type}
                onChange={(e) => {
                  const newType = e.target.value as 'all' | 'month' | 'quarter' | 'year';
                  const currentYear = new Date().getFullYear();
                  let newValue = '';
                  if (newType === 'month') {
                    newValue = getCurrentMonth();
                  } else if (newType === 'quarter') {
                    const currentQuarter = Math.floor(new Date().getMonth() / 3) + 1;
                    newValue = `${currentYear}-Q${currentQuarter}`;
                  } else if (newType === 'year') {
                    newValue = currentYear.toString();
                  }
                  setPeriodFilter({ type: newType, value: newValue });
                }}
                className="w-32 p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all" className="dark:bg-gray-700 dark:text-white">Весь</option>
                <option value="month" className="dark:bg-gray-700 dark:text-white">Месяц</option>
                <option value="quarter" className="dark:bg-gray-700 dark:text-white">Квартал</option>
                <option value="year" className="dark:bg-gray-700 dark:text-white">Год</option>
              </select>
              {periodFilter.type !== 'all' && (
                <>
                  {periodFilter.type === 'year' ? (
                    <select
                      value={periodFilter.value}
                      onChange={(e) => setPeriodFilter({...periodFilter, value: e.target.value})}
                      className="w-32 p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      {Array.from({length: 10}, (_, i) => {
                        const year = new Date().getFullYear() - i;
                        return <option key={year} value={year.toString()} className="dark:bg-gray-700 dark:text-white">{year}</option>;
                      })}
                    </select>
                  ) : periodFilter.type === 'month' ? (
                    <div className="flex space-x-2">
                      <select
                        value={periodFilter.value.split('-')[0] || new Date().getFullYear()}
                        onChange={(e) => {
                          const selectedYear = e.target.value;
                          const currentMonth = periodFilter.value.split('-')[1] || '01';
                          setPeriodFilter({...periodFilter, value: `${selectedYear}-${currentMonth}`});
                        }}
                        className="w-24 p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        {Array.from({length: 10}, (_, i) => {
                          const year = new Date().getFullYear() - i;
                          return <option key={year} value={year.toString()} className="dark:bg-gray-700 dark:text-white">{year}</option>;
                        })}
                      </select>
                      <select
                        value={periodFilter.value.split('-')[1] || '01'}
                        onChange={(e) => {
                          const selectedMonth = e.target.value;
                          const currentYear = periodFilter.value.split('-')[0] || new Date().getFullYear().toString();
                          setPeriodFilter({...periodFilter, value: `${currentYear}-${selectedMonth}`});
                        }}
                        className="w-24 p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        {Array.from({length: 12}, (_, i) => {
                          const month = i + 1;
                          const monthStr = month < 10 ? `0${month}` : month;
                          const displayMonth = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'][i];
                          return <option key={month} value={monthStr} className="dark:bg-gray-700 dark:text-white">{displayMonth}</option>;
                        })}
                      </select>
                    </div>
                  ) : periodFilter.type === 'quarter' ? (
                    <div className="flex space-x-2">
                      <select
                        value={periodFilter.value.split('-')[0] || new Date().getFullYear()}
                        onChange={(e) => {
                          const selectedYear = e.target.value;
                          const currentQuarter = periodFilter.value.split('-')[1] || 'Q1';
                          setPeriodFilter({...periodFilter, value: `${selectedYear}-${currentQuarter}`});
                        }}
                        className="w-24 p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        {Array.from({length: 10}, (_, i) => {
                          const year = new Date().getFullYear() - i;
                          return <option key={year} value={year.toString()} className="dark:bg-gray-700 dark:text-white">{year}</option>;
                        })}
                      </select>
                      <select
                        value={periodFilter.value.split('-')[1] || 'Q1'}
                        onChange={(e) => {
                          const selectedQuarter = e.target.value;
                          const currentYear = periodFilter.value.split('-')[0] || new Date().getFullYear().toString();
                          setPeriodFilter({...periodFilter, value: `${currentYear}-${selectedQuarter}`});
                        }}
                        className="w-24 p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        {Array.from({length: 4}, (_, i) => {
                          const quarter = i + 1;
                          return <option key={quarter} value={`Q${quarter}`} className="dark:bg-gray-700 dark:text-white">Q{quarter}</option>;
                        })}
                      </select>
                    </div>
                  ) : null}
                </>
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

      {/* Processed queue results notification */}
      {processedResults.length > 0 && (
        <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="text-sm font-medium text-green-800 dark:text-green-300 mb-2">
            Обработано чеков из очереди: {processedResults.length}
          </div>
          <div className="space-y-2">
            {processedResults.map((result) => (
              <div key={result.queueId} className="flex items-center justify-between">
                <span className="text-sm text-green-700 dark:text-green-400">
                  {result.result.items.length} товаров
                  {result.result.storeName && ` — ${result.result.storeName}`}
                </span>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleProcessedResult(result)}
                >
                  Просмотреть
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary blocks */}
      <div>
        <Tabs tabs={financeTabs} />
      </div>

      {/* Delete Confirmation Modal */}
      {isAdmin && deleteConfirmationId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Подтверждение удаления</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Вы уверены, что хотите удалить эту запись? Это действие нельзя отменить.</p>
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
      
      {isAdmin && (
        <>
          <FinanceModal
            isOpen={isFinanceFormModalOpen}
            onClose={() => {
              closeFinanceFormModal();
              setScannerInitialItems(undefined);
              setScannerInitialDate(undefined);
              setScannerInitialComment(undefined);
            }}
            recordId={selectedRecordId}
            onAdd={addFinanceRecordAndScroll}
            onUpdate={updateFinanceRecord}
            initialItems={scannerInitialItems}
            initialDate={scannerInitialDate}
            initialComment={scannerInitialComment}
          />
          <ReceiptScannerModal
            isOpen={isScannerOpen}
            onClose={() => setIsScannerOpen(false)}
            onItemsReady={handleScannerItemsReady}
            onQueueUpdated={refreshCount}
          />
          <CategoryModal
            isOpen={isCategoryFormModalOpen}
            onClose={closeCategoryFormModal}
            recordId={selectedCategoryId}
            onAdd={(newCategory) => {
              // Category addition is handled inside the store
            }}
            onUpdate={(id, updatedFields) => {
              // Category update is handled inside the store
            }}
          />
        </>
      )}
    </div>
  );
};

export default Finance;