import React, { useState, useEffect } from 'react';
import AnimatedAccordion from '../components/AnimatedAccordion';
import HouseholdFormModal from '../components/HouseholdFormModal';
import { useStore } from '../store/useStore';
import { AppHouseholdRecord } from '../store/useStore';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/Button';
import { formatDate } from '../utils/formatUtils';

// Define type for household record
interface HouseholdRecord {
  id: number | string;
  date: string;
  description: string;
  area: string;
  completed?: boolean;
}

const Domestic: React.FC = () => {
  // Use the store for household records
  const householdData = useStore((state) => state.householdData);
  const syncHouseholdData = useStore((state) => state.syncHouseholdData);
  const updateHouseholdRecord = useStore((state) => state.updateHouseholdRecord);
  const isDataLoading = useStore((state) => state.isHouseholdDataLoading);
  const dataError = useStore((state) => state.householdDataError);

  // State for current month/year in calendar
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // State for selected date and its records
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDateRecords, setSelectedDateRecords] = useState<HouseholdRecord[] | null>(null);

  // Form modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<number | string | null>(null);

  // Get today's date string in YYYY-MM-DD format (using local timezone)
  const today = new Date();
  // Use toLocaleDateString with 'en-CA' locale to get YYYY-MM-DD format in local timezone
  const todayString = today.toLocaleDateString('en-CA');
  
  // Load data from Firebase when component mounts
  useEffect(() => {
    syncHouseholdData().catch(error => {
      console.error('Error loading household data:', error);
    });
  }, [syncHouseholdData]);

  // Set initial default to show week records
  useEffect(() => {
    // Don't set a specific date when default filter is 'week'
    // The week filter will be handled by getFilteredRecords function
    setSelectedDate(null);
    setSelectedDateRecords(null);
  }, []);

  // Function to handle date click in calendar
  const handleDateClick = (dateString: string) => {
    const records = householdData.filter(record => record.date === dateString);
    setSelectedDate(dateString);
    setSelectedDateRecords(records.length > 0 ? records : null);
  };

  // Define the type for calendar day
  interface CalendarDay {
    date: Date;
    isCurrentMonth: boolean;
    dateString: string;
    hasRecord?: boolean;
    areas?: string[];
  }

  // Function to generate calendar days for the current month
  const getCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    // Days from previous month to show (adjusted for Monday start: 1=Monday, 0=Sunday becomes 7)
    let startDay = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    if (startDay === 0) startDay = 7; // Adjust Sunday to be after Saturday (7)
    const daysFromPrevMonth = startDay - 1; // Now represents how many days to show from previous month
    // Total days in month
    const daysInMonth = lastDay.getDate();
    
    const days: CalendarDay[] = [];
    
    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = daysFromPrevMonth; i > 0; i--) {
      const day = prevMonthLastDay - i + 1;
      const prevMonthDate = new Date(year, month - 1, day);
      const dateString = prevMonthDate.toLocaleDateString('en-CA'); // Use local date format
      const dayRecords = householdData.filter(record => record.date === dateString);
      const uniqueAreas = Array.from(new Set(dayRecords.map(record => record.area)));
      days.push({
        date: prevMonthDate,
        isCurrentMonth: false,
        dateString,
        hasRecord: dayRecords.length > 0,
        areas: uniqueAreas
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dateString = date.toLocaleDateString('en-CA'); // Use local date format
      const dayRecords = householdData.filter(record => record.date === dateString);
      const uniqueAreas = Array.from(new Set(dayRecords.map(record => record.area)));
      days.push({
        date,
        isCurrentMonth: true,
        dateString,
        hasRecord: dayRecords.length > 0,
        areas: uniqueAreas
      });
    }
    
    // Next month days
    const remainingDays = 42 - days.length; // 6 rows x 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      const dateString = date.toLocaleDateString('en-CA'); // Use local date format
      const dayRecords = householdData.filter(record => record.date === dateString);
      const uniqueAreas = Array.from(new Set(dayRecords.map(record => record.area)));
      days.push({
        date,
        isCurrentMonth: false,
        dateString,
        hasRecord: dayRecords.length > 0,
        areas: uniqueAreas
      });
    }
    
    return days;
  };

  // Function to navigate to previous month
  const prevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  // Function to navigate to next month
  const nextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Function to format month and year for display
  const formatMonthYear = (date: Date) => {
    return date.toLocaleString('ru-RU', { month: 'long', year: 'numeric' });
  };

  // Define color mapping for different areas
  const areaColorMap: Record<string, string> = {
    'Гостиная': 'bg-yellow-200',
    'Кухня': 'bg-red-200',
    'Спальня': 'bg-green-200',
    'Ванная': 'bg-blue-200',
    'Коридор': 'bg-purple-200',
    'Все комнаты': 'bg-pink-200',
    'Туалет': 'bg-indigo-200',
    'Прихожая': 'bg-gray-200',
    'Балкон': 'bg-orange-200',
    'Лоджия': 'bg-teal-200',
    // Default color for unknown areas
    'default': 'bg-blue-100'
  };

  const calendarDays = getCalendarDays();
  const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const openFormModal = (id?: number | string | null) => {
    if (id !== undefined) {
      setEditingRecordId(id);
    } else {
      setEditingRecordId(null);
    }
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setEditingRecordId(null);
  };

  // State for delete confirmation
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<number | string | null>(null);

  // State for notes filters
  const [notesFilter, setNotesFilter] = useState<'today' | 'week' | 'month' | 'quarter' | 'halfYear' | 'year' | 'fiveYears'>('week');

  const { user, isAdmin } = useAuth();
  
  const deleteHouseholdRecord = useStore((state) => state.deleteHouseholdRecord);

  const confirmDelete = (id: number | string) => {
    if (isAdmin) {
      setDeleteConfirmationId(id);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmationId !== null) {
      await deleteHouseholdRecord(deleteConfirmationId);
      setDeleteConfirmationId(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmationId(null);
  };

  // Function to get filtered records based on selected filter
  const getFilteredRecords = () => {
    if (notesFilter === 'today') {
      // Today's records are already handled by selectedDateRecords
      return selectedDateRecords;
    }

    // Use local date without time components for proper comparison
    const now = new Date();
    // Create date at start of day in local timezone to avoid timezone issues
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let endDate = new Date(startOfDay);

    switch(notesFilter) {
      case 'week':
        endDate.setDate(startOfDay.getDate() + 7);
        break;
      case 'month':
        endDate.setMonth(startOfDay.getMonth() + 1);
        break;
      case 'quarter':
        endDate.setMonth(startOfDay.getMonth() + 3);
        break;
      case 'halfYear':
        endDate.setMonth(startOfDay.getMonth() + 6);
        break;
      case 'year':
        endDate.setFullYear(startOfDay.getFullYear() + 1);
        break;
      case 'fiveYears':
        endDate.setFullYear(startOfDay.getFullYear() + 5);
        break;
    }

    return householdData.filter(record => {
      // Parse the date string from the record using local timezone
      const [year, month, day] = record.date.split('-').map(Number);
      const recordDate = new Date(year, month - 1, day); // month is 0-indexed
      return recordDate >= startOfDay && recordDate <= endDate;
    });
  };

  const handleToggleCompleted = async (id: number | string, completed: boolean) => {
    try {
      await updateHouseholdRecord(id, { completed });
    } catch (error) {
      console.error('Error updating household record completion status:', error);
      // Optionally show an error message to the user
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Бытовой каталог</h1>
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Calendar section */}
        <AnimatedAccordion title="Календарь" defaultOpen={true}>
          <div className="mt-2 bg-white rounded-lg shadow-md border border-gray-200 p-4">
            <div className="flex justify-between items-center mb-4">
              <button 
                onClick={prevMonth}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <h2 className="text-lg font-semibold text-gray-800">
                {formatMonthYear(currentDate)}
              </h2>
              <button 
                onClick={nextMonth}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekdays.map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-1">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-4">
              {calendarDays.map((day, index) => {
                const isToday = day.dateString === todayString;
                const hasRecord = day.hasRecord && day.isCurrentMonth;
                
                // Determine background color based on areas
                let bgColorClass = '';
                if (day.areas && day.areas.length > 0) {
                  const primaryArea = day.areas[0]; // Use the first area for the background
                  bgColorClass = areaColorMap[primaryArea] || areaColorMap['default'];
                } else {
                  bgColorClass = day.isCurrentMonth ? 'bg-white' : 'bg-gray-50';
                }

                return (
                  <div 
                    key={index}
                    onClick={() => handleDateClick(day.dateString)}
                    className={`min-h-8 flex flex-col items-center justify-center p-1 border rounded-lg cursor-pointer
                      ${bgColorClass}
                      ${day.isCurrentMonth ? 'hover:bg-gray-50' : 'text-gray-400'}
                      ${isToday ? 'border-blue-500' : 'border-gray-200'}
                      ${selectedDate === day.dateString ? 'ring-2 ring-blue-400' : ''}`}
                  >
                    <span className={`text-sm ${isToday ? 'font-bold text-blue-600' : ''}`}>
                      {day.date.getDate()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </AnimatedAccordion>

        {/* Notes section for selected date's records */}
        <AnimatedAccordion title="Заметки" defaultOpen={true}>
          <div className="mt-2 bg-white rounded-lg shadow-md border border-gray-200 p-4 h-fit overflow-y-auto">
            {/* Filter Controls */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Фильтр по периоду</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setNotesFilter('today')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    notesFilter === 'today' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Сегодня
                </button>
                <button
                  onClick={() => setNotesFilter('week')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    notesFilter === 'week' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Неделя
                </button>
                <button
                  onClick={() => setNotesFilter('month')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    notesFilter === 'month' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Месяц
                </button>
                <button
                  onClick={() => setNotesFilter('quarter')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    notesFilter === 'quarter' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  3 месяца
                </button>
                <button
                  onClick={() => setNotesFilter('halfYear')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    notesFilter === 'halfYear' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Полгода
                </button>
                <button
                  onClick={() => setNotesFilter('year')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    notesFilter === 'year' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Год
                </button>
                <button
                  onClick={() => setNotesFilter('fiveYears')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    notesFilter === 'fiveYears' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  5 лет
                </button>
              </div>
            </div>

            {/* Filtered Records Display */}
            {(() => {
              const recordsToShow = notesFilter === 'today' ? selectedDateRecords : getFilteredRecords();
              
              if (recordsToShow && recordsToShow.length > 0) {
                // Determine header text based on filter
                let headerText = '';
                if (notesFilter === 'today') {
                  headerText = `Записи за ${selectedDate ? formatDate(selectedDate) : 'неизвестная дата'} (${recordsToShow.length} ${recordsToShow.length === 1 ? 'запись' : recordsToShow.length < 5 ? 'записи' : 'записей'})`;
                } else {
                  headerText = `Записи (${recordsToShow.length} ${recordsToShow.length === 1 ? 'запись' : recordsToShow.length < 5 ? 'записи' : 'записей'})`;
                }
                
                return (
                  <div className="flex flex-col">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{headerText}</h3>
                    <div className="space-y-3 flex-grow">
                      {recordsToShow.map((record) => (
                        <div key={record.id} className="border-l-4 border-blue-500 pl-3 py-2 bg-gray-50 rounded flex items-start">
                          <input
                            type="checkbox"
                            checked={record.completed || false}
                            onChange={() => handleToggleCompleted(record.id, !record.completed)}
                            className="mt-1 mr-2 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <div className="flex-grow space-y-1">
                            <div>
                              <span className="font-medium text-gray-700">Описание:</span> 
                              <span className={`ml-2 ${record.completed ? 'line-through text-gray-500' : ''}`}>{record.description}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              } else {
                let message = '';
                if (notesFilter === 'today') {
                  message = selectedDate 
                    ? `На дату ${formatDate(selectedDate)} нет записей в домашнем каталоге.` 
                    : 'Выберите дату в календаре для просмотра записей.';
                } else {
                  message = `Нет записей для выбранного периода (${notesFilter}).`;
                }
                
                return (
                  <div className="text-gray-500 italic flex-grow">
                    {message}
                  </div>
                );
              }
            })()}
          </div>
        </AnimatedAccordion>
      </div>

      {/* Accordion with table */}
      <AnimatedAccordion title="Бытовые записи" defaultOpen={true} className="mt-4">
        <div className="mt-2 bg-white rounded-lg shadow-md border border-gray-200 overflow-x-auto">
          <div className="overflow-x-auto">
            {isDataLoading ? (
              <div className="py-12">
                <LoadingSpinner message="Загрузка бытовых данных..." />
              </div>
            ) : (
              <>
                {/* Mobile View - Card Layout */}
                <div className="block md:hidden">
                  {householdData.length > 0 ? (
                    householdData.map((record) => (
                      <div key={record.id} className="border-b border-gray-200 p-4 hover:bg-gray-50">
                        <div 
                          className={`flex justify-between items-start ${isAdmin ? 'cursor-pointer' : ''}`}
                          onClick={isAdmin ? () => openFormModal(record.id) : undefined}
                        >
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-medium text-gray-900">{record.description}</div>
                              <div className="text-sm text-gray-500">{formatDate(record.date)}</div>
                            </div>
                            <div className="mt-1 text-sm text-gray-500">
                              <span className="font-medium">Область:</span> {record.area}
                            </div>
                            <div className="mt-1 text-sm">
                              <span className="font-medium">Статус:</span> 
                              <span className={`ml-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${record.completed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {record.completed ? 'Выполнено' : 'Не выполнено'}
                              </span>
                            </div>
                          </div>
                          {isAdmin && (
                            <div className="ml-4 flex space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openFormModal(record.id);
                                }}
                                className="text-blue-600 hover:text-blue-900"
                                title="Редактировать запись"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                              </button>
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
                      Нет данных для отображения
                    </div>
                  )}
                </div>

                {/* Desktop View - Table */}
                <table className="hidden md:table divide-y divide-gray-200 min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Описание</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Область</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Выполнено</th>
                      {isAdmin && (
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {householdData.length > 0 ? (
                      householdData.map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => openFormModal(record.id)}>
                          <td className="p-4 whitespace-nowrap text-sm text-gray-500">{formatDate(record.date)}</td>
                          <td className="p-4 whitespace-nowrap text-sm text-gray-900">{record.description}</td>
                          <td className="p-4 whitespace-nowrap text-sm text-gray-500">{record.area}</td>
                          <td className="p-4 whitespace-nowrap text-sm">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${record.completed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {record.completed ? 'Выполнено' : 'Не выполнено'}
                            </span>
                          </td>
                          {isAdmin && (
                            <td className="p-4 whitespace-nowrap text-right text-sm font-medium flex justify-end space-x-2">
                              <button
                                onClick={() => openFormModal(record.id)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Редактировать запись"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => confirmDelete(record.id)}
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
                        <td colSpan={isAdmin ? 5 : 4} className="p-4 text-center text-sm text-gray-500">
                          Нет данных для отображения
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

      {isAdmin && (
        <HouseholdFormModal 
          isOpen={isFormModalOpen} 
          onClose={closeFormModal} 
          recordId={editingRecordId}
          onAdd={(record) => {
            // New record will appear automatically when syncHouseholdData is called
          }}
          onUpdate={(id, updatedRecord) => {
            // Updated record will appear automatically when syncHouseholdData is called
          }}
        />
      )}
    </div>
  );
};

export default Domestic;