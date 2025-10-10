import { useState, useMemo, useEffect } from 'react';
import { useStore } from '../store/useStore';
import AddCorrespondentForm from '../components/AddCorrespondentForm';
import ViewEditRecordModal from '../components/ViewEditRecordModal';

const Correspondent = () => {
  const correspondentData = useStore((state) => state.correspondentData);
  const setCorrespondentData = useStore((state) => state.setCorrespondentData);
  const deleteCorrespondentRecord = useStore((state) => state.deleteCorrespondentRecord);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<number | null>(null);
  
  // Filter state variables
  const [dateFilter, setDateFilter] = useState<string>('');
  const [incomingNumberFilter, setIncomingNumberFilter] = useState<string>('');
  const [outgoingNumberFilter, setOutgoingNumberFilter] = useState<string>('');
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

  const sampleData = [
    {
      id: 1,
      date: '2023-10-15',
      incomingNumber: 'ВХ-2023-001',
      subject: 'Запрос о сотрудничестве',
      outgoingNumber: 'ИСХ-2023-001',
      from: 'ООО "ТехноСнаб"',
      to: 'ОАО "Промышленные системы"',
      signedBy: 'Иванов А.А.'
    },
    {
      id: 2,
      date: '2023-10-16',
      incomingNumber: 'ВХ-2023-002',
      subject: 'Дополнение к контракту',
      outgoingNumber: 'ИСХ-2023-002',
      from: 'ЗАО "СтройИнвест"',
      to: 'ООО "Городская застройка"',
      signedBy: 'Петрова М.С.'
    },
    {
      id: 3,
      date: '2023-10-17',
      incomingNumber: 'ВХ-2023-003',
      subject: 'Отчет по поставкам',
      outgoingNumber: 'ИСХ-2023-003',
      from: 'ООО "ЛогистикСервис"',
      to: 'АО "Торговый дом"',
      signedBy: 'Сидоров В.П.'
    },
    {
      id: 4,
      date: '2023-10-18',
      incomingNumber: 'ВХ-2023-004',
      subject: 'Заявка на участие в тендере',
      outgoingNumber: 'ИСХ-2023-004',
      from: 'ООО "Инновационные технологии"',
      to: 'Министерство промышленности',
      signedBy: 'Кузнецова Е.А.'
    },
    {
      id: 5,
      date: '2023-10-19',
      incomingNumber: 'ВХ-2023-005',
      subject: 'Согласование графика поставок',
      outgoingNumber: 'ИСХ-2023-005',
      from: 'ОАО "ЭнергоСбыт"',
      to: 'ГУП "ЖКХ городского округа"',
      signedBy: 'Морозов Д.К.'
    }
  ];

  useEffect(() => {
    setCorrespondentData(sampleData);
  }, []);

  // Apply filters to the data
  const filteredData = useMemo(() => {
    return correspondentData.filter(record => {
      // Date filter
      if (dateFilter && record.date !== dateFilter) {
        return false;
      }
      
      // Incoming number filter (partial match)
      if (incomingNumberFilter && !record.incomingNumber.toLowerCase().includes(incomingNumberFilter.toLowerCase())) {
        return false;
      }
      
      // Outgoing number filter (partial match)
      if (outgoingNumberFilter && !record.outgoingNumber.toLowerCase().includes(outgoingNumberFilter.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }, [correspondentData, dateFilter, incomingNumberFilter, outgoingNumberFilter]);

  const openAddModal = () => {
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };

  const openViewModal = (id: number) => {
    setSelectedRecordId(id);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedRecordId(null);
  };

  const confirmDelete = (id: number) => {
    setDeleteConfirmationId(id);
  };

  const handleDelete = () => {
    if (deleteConfirmationId !== null) {
      deleteCorrespondentRecord(deleteConfirmationId);
      setDeleteConfirmationId(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmationId(null);
  };

  // Clear all filters
  const clearFilters = () => {
    setDateFilter('');
    setIncomingNumberFilter('');
    setOutgoingNumberFilter('');
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Корреспондентский журнал</h1>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={openAddModal}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Добавить
          </button>
        </div>
      </div>
      
      {/* Filter Controls - Accordion */}
      <div className="bg-white rounded-lg shadow-md mb-4 border border-gray-200">
        <div 
          className="flex justify-between items-center p-4 cursor-pointer"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          <h2 className="text-lg font-semibold text-gray-800">Фильтры</h2>
          <svg 
            className={`h-5 w-5 text-gray-600 transform transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
        
        {isFilterOpen && (
          <div className="p-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Дата</label>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="text-xs w-56 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Входящий номер</label>
                <input
                  type="text"
                  placeholder="Фильтр по входящему номеру"
                  value={incomingNumberFilter}
                  onChange={(e) => setIncomingNumberFilter(e.target.value)}
                  className="text-xs w-56 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Исходящий номер</label>
                <input
                  type="text"
                  placeholder="Фильтр по исходящему номеру"
                  value={outgoingNumberFilter}
                  onChange={(e) => setOutgoingNumberFilter(e.target.value)}
                  className="text-xs w-56 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
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
          </div>
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      {deleteConfirmationId && (
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
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          {/* Mobile View - Card Layout */}
          <div className="block md:hidden">
            {filteredData.length > 0 ? (
              filteredData.map((record) => (
                <div key={record.id} className="border-b border-gray-200 p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => openViewModal(record.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-gray-900">{record.incomingNumber}</div>
                        <div className="text-sm text-gray-500">{record.date}</div>
                      </div>
                      <div className="mt-1 text-sm text-gray-500 truncate max-w-xs">{record.subject}</div>
                      <div className="mt-2 text-xs text-gray-500 space-y-1">
                        <div className="flex justify-between">
                          <span>Исх. №:</span>
                          <span className="font-medium">{record.outgoingNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>От:</span>
                          <span className="font-medium">{record.from}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Кому:</span>
                          <span className="font-medium">{record.to}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Подписан:</span>
                          <span className="font-medium">{record.signedBy}</span>
                        </div>
                      </div>
                    </div>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Вх. №</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Тема обращения</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Исх. №</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">От кого</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Кому</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Подписан</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.length > 0 ? (
                filteredData.map((record) => (
                  <tr 
                    key={record.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => openViewModal(record.id)}
                  >
                    <td 
                      className="p-4 whitespace-nowrap text-sm text-gray-500"
                    >
                      {record.date}
                    </td>
                    <td 
                      className="p-4 whitespace-nowrap text-sm font-medium text-gray-900"
                    >
                      {record.incomingNumber}
                    </td>
                    <td 
                      className="p-4 text-sm text-gray-500"
                    >
                      {record.subject}
                    </td>
                    <td 
                      className="p-4 whitespace-nowrap text-sm text-gray-500"
                    >
                      {record.outgoingNumber}
                    </td>
                    <td 
                      className="p-4 text-sm text-gray-500"
                    >
                      {record.from}
                    </td>
                    <td 
                      className="p-4 text-sm text-gray-500"
                    >
                      {record.to}
                    </td>
                    <td 
                      className="p-4 whitespace-nowrap text-sm text-gray-500"
                    >
                      {record.signedBy}
                    </td>
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-4 text-center text-sm text-gray-500">
                    Нет данных, соответствующих фильтрам. Попробуйте изменить параметры фильтрации.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <AddCorrespondentForm isOpen={isAddModalOpen} onClose={closeAddModal} />
      <ViewEditRecordModal 
        isOpen={isViewModalOpen} 
        onClose={closeViewModal} 
        recordId={selectedRecordId} 
      />
    </div>
  );
};

export default Correspondent;