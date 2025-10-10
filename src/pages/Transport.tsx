import { useState, useMemo } from 'react';
import AnimatedAccordion from '../components/AnimatedAccordion';
import AddTransportForm from '../components/AddTransportForm';
import ViewEditTransportRecordModal from '../components/ViewEditTransportRecordModal';

const Transport = () => {
  // State for filters
  const [shippingDateFilter, setShippingDateFilter] = useState<string>('');
  const [departureDateFilter, setDepartureDateFilter] = useState<string>('');
  const [arrivalDateFilter, setArrivalDateFilter] = useState<string>('');
  const [cargoNameFilter, setCargoNameFilter] = useState<string>('');
  const [driverFilter, setDriverFilter] = useState<string>('');
  const [carNumberFilter, setCarNumberFilter] = useState<string>('');
  const [driverLicenseFilter, setDriverLicenseFilter] = useState<string>('');
  const [shippingWeightFilter, setShippingWeightFilter] = useState<string>('');
  const [deliveryWeightFilter, setDeliveryWeightFilter] = useState<string>('');
  
  // State for modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<number | null>(null);

  // Sample data
  const sampleData = [
    {
      id: 1,
      shippingDate: '2023-10-15',
      departureDate: '2023-10-15',
      arrivalDate: '2023-10-17',
      cargoName: 'Электронное оборудование',
      driver: 'Иванов А.А.',
      carNumber: 'А123БВ',
      driverLicense: '1234567890',
      shippingWeight: 1250,
      deliveryWeight: 1240
    },
    {
      id: 2,
      shippingDate: '2023-10-16',
      departureDate: '2023-10-16',
      arrivalDate: '2023-10-19',
      cargoName: 'Продовольственные товары',
      driver: 'Петров Б.Б.',
      carNumber: 'В456СД',
      driverLicense: '0987654321',
      shippingWeight: 2100,
      deliveryWeight: 2090
    },
    {
      id: 3,
      shippingDate: '2023-10-17',
      departureDate: '2023-10-17',
      arrivalDate: '2023-10-20',
      cargoName: 'Строительные материалы',
      driver: 'Сидоров В.В.',
      carNumber: 'С789ЕК',
      driverLicense: '5678901234',
      shippingWeight: 3500,
      deliveryWeight: 3485
    },
    {
      id: 4,
      shippingDate: '2023-10-18',
      departureDate: '2023-10-18',
      arrivalDate: '2023-10-22',
      cargoName: 'Медицинское оборудование',
      driver: 'Кузнецов Г.Г.',
      carNumber: 'К321МН',
      driverLicense: '4321098765',
      shippingWeight: 850,
      deliveryWeight: 845
    },
    {
      id: 5,
      shippingDate: '2023-10-19',
      departureDate: '2023-10-19',
      arrivalDate: '2023-10-23',
      cargoName: 'Канцелярские товары',
      driver: 'Морозов Д.Д.',
      carNumber: 'О654РП',
      driverLicense: '3210987654',
      shippingWeight: 420,
      deliveryWeight: 418
    },
    {
      id: 6,
      shippingDate: '2023-10-19',
      departureDate: '2023-10-19',
      arrivalDate: '2023-10-23',
      cargoName: 'Канцелярские товары',
      driver: 'Морозов Д.Д.',
      carNumber: 'О654РП',
      driverLicense: '3210987654',
      shippingWeight: 420,
      deliveryWeight: 418
    },
    {
      id: 7,
      shippingDate: '2023-10-19',
      departureDate: '2023-10-19',
      arrivalDate: '2023-10-23',
      cargoName: 'Канцелярские товары',
      driver: 'Морозов Д.Д.',
      carNumber: 'О654РП',
      driverLicense: '3210987654',
      shippingWeight: 420,
      deliveryWeight: 418
    },
    {
      id: 8,
      shippingDate: '2023-10-19',
      departureDate: '2023-10-19',
      arrivalDate: '2023-10-23',
      cargoName: 'Канцелярские товары',
      driver: 'Морозов Д.Д.',
      carNumber: 'О654РП',
      driverLicense: '3210987654',
      shippingWeight: 420,
      deliveryWeight: 418
    },
    {
      id: 9,
      shippingDate: '2023-10-19',
      departureDate: '2023-10-19',
      arrivalDate: '2023-10-23',
      cargoName: 'Канцелярские товары',
      driver: 'Морозов Д.Д.',
      carNumber: 'О654РП',
      driverLicense: '3210987654',
      shippingWeight: 420,
      deliveryWeight: 418
    },
    {
      id: 10,
      shippingDate: '2023-10-19',
      departureDate: '2023-10-19',
      arrivalDate: '2023-10-23',
      cargoName: 'Канцелярские товары',
      driver: 'Морозов Д.Д.',
      carNumber: 'О654РП',
      driverLicense: '3210987654',
      shippingWeight: 420,
      deliveryWeight: 418
    },
  ];

  const [transportData, setTransportData] = useState(sampleData);
  
  // Function to add a new record
  const addTransportRecord = (newRecord: Omit<typeof sampleData[0], 'id'>) => {
    const newId = transportData.length > 0 
      ? Math.max(...transportData.map(r => r.id)) + 1 
      : 1;
    
    const recordWithId = {
      ...newRecord,
      id: newId
    };
    
    setTransportData([...transportData, recordWithId]);
  };
  
  // Function to delete a record
  const deleteTransportRecord = (id: number) => {
    setTransportData(transportData.filter(record => record.id !== id));
  };
  
  // Confirmation functions for deletion
  const confirmDelete = (id: number) => {
    setDeleteConfirmationId(id);
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

  // Function to update a record
  const updateTransportRecord = (id: number, updatedFields: Partial<typeof sampleData[0]>) => {
    setTransportData(transportData.map(record => 
      record.id === id ? { ...record, ...updatedFields } : record
    ));
  };
  
  // Apply filters to the data
  const filteredData = useMemo(() => {
    return transportData.filter(record => {
      // Shipping date filter
      if (shippingDateFilter && record.shippingDate !== shippingDateFilter) {
        return false;
      }
      
      // Departure date filter
      if (departureDateFilter && record.departureDate !== departureDateFilter) {
        return false;
      }
      
      // Arrival date filter
      if (arrivalDateFilter && record.arrivalDate !== arrivalDateFilter) {
        return false;
      }
      
      // Cargo name filter (partial match)
      if (cargoNameFilter && !record.cargoName.toLowerCase().includes(cargoNameFilter.toLowerCase())) {
        return false;
      }
      
      // Driver filter (partial match)
      if (driverFilter && !record.driver.toLowerCase().includes(driverFilter.toLowerCase())) {
        return false;
      }
      
      // Car number filter (partial match)
      if (carNumberFilter && !record.carNumber.toLowerCase().includes(carNumberFilter.toLowerCase())) {
        return false;
      }
      
      // Driver license filter (partial match)
      if (driverLicenseFilter && !record.driverLicense.toLowerCase().includes(driverLicenseFilter.toLowerCase())) {
        return false;
      }
      
      // Shipping weight filter
      if (shippingWeightFilter && record.shippingWeight.toString() !== shippingWeightFilter) {
        return false;
      }
      
      // Delivery weight filter
      if (deliveryWeightFilter && record.deliveryWeight.toString() !== deliveryWeightFilter) {
        return false;
      }
      
      return true;
    });
  }, [
    transportData, 
    shippingDateFilter, 
    departureDateFilter, 
    arrivalDateFilter, 
    cargoNameFilter, 
    driverFilter, 
    carNumberFilter, 
    driverLicenseFilter, 
    shippingWeightFilter, 
    deliveryWeightFilter
  ]);

  // Functions to handle modal
  const openAddModal = () => {
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };  

  const openViewModal = (id: number) => {
    console.log('777');
    
    setSelectedRecordId(id);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedRecordId(null);
  };

  // Clear all filters
  const clearFilters = () => {
    setShippingDateFilter('');
    setDepartureDateFilter('');
    setArrivalDateFilter('');
    setCargoNameFilter('');
    setDriverFilter('');
    setCarNumberFilter('');
    setDriverLicenseFilter('');
    setShippingWeightFilter('');
    setDeliveryWeightFilter('');
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Транспортный журнал</h1>
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
      <AnimatedAccordion title="Фильтры" defaultOpen={true}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Дата отгрузки</label>
            <input
              type="date"
              value={shippingDateFilter}
              onChange={(e) => setShippingDateFilter(e.target.value)}
              className="w-56 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Дата выезда</label>
            <input
              type="date"
              value={departureDateFilter}
              onChange={(e) => setDepartureDateFilter(e.target.value)}
              className="w-56 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Дата прибытия</label>
            <input
              type="date"
              value={arrivalDateFilter}
              onChange={(e) => setArrivalDateFilter(e.target.value)}
              className="w-56 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Наименование груза</label>
            <input
              type="text"
              placeholder="Фильтр по наименованию груза"
              value={cargoNameFilter}
              onChange={(e) => setCargoNameFilter(e.target.value)}
              className="w-56 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Водитель</label>
            <input
              type="text"
              placeholder="Фильтр по водителю"
              value={driverFilter}
              onChange={(e) => setDriverFilter(e.target.value)}
              className="w-56 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Номер автомобиля</label>
            <input
              type="text"
              placeholder="Фильтр по номеру автомобиля"
              value={carNumberFilter}
              onChange={(e) => setCarNumberFilter(e.target.value)}
              className="w-56 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Номер водительского удостоверения</label>
            <input
              type="text"
              placeholder="Фильтр по номеру ВУ"
              value={driverLicenseFilter}
              onChange={(e) => setDriverLicenseFilter(e.target.value)}
              className="w-56 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Вес при отправке</label>
            <input
              type="text"
              placeholder="Фильтр по весу при отправке"
              value={shippingWeightFilter}
              onChange={(e) => setShippingWeightFilter(e.target.value)}
              className="w-56 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Вес при отгрузке</label>
            <input
              type="text"
              placeholder="Фильтр по весу при отгрузке"
              value={deliveryWeightFilter}
              onChange={(e) => setDeliveryWeightFilter(e.target.value)}
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
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 mt-4">
        <div className="overflow-x-auto">
          {/* Mobile View - Card Layout */}
          <div className="block md:hidden">
            {filteredData.length > 0 ? (
              filteredData.map((record) => (
                <div key={record.id} className="border-b border-gray-200 p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div 
                      className="flex-1 cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-gray-900">{record.driver}</div>
                        <div className="text-sm text-gray-500">{record.shippingDate}</div>
                      </div>
                      <div className="mt-1 text-sm text-gray-500 truncate max-w-xs">{record.cargoName}</div>
                      <div className="mt-2 text-xs text-gray-500 space-y-1">
                        <div className="flex justify-between">
                          <span>Выезд:</span>
                          <span className="font-medium">{record.departureDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Прибытие:</span>
                          <span className="font-medium">{record.arrivalDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Автомобиль:</span>
                          <span className="font-medium">{record.carNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Вес отпр.:</span>
                          <span className="font-medium">{record.shippingWeight} кг</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Вес отгр.:</span>
                          <span className="font-medium">{record.deliveryWeight} кг</span>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата отгрузки</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата выезда</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата прибытия</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Наименование груза</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Водитель</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Номер автомобиля</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Номер ВУ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Вес при отправке</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Вес при отгрузке</th>
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
                      className="p-4 whitespace-nowrap text-sm text-gray-500 select-none"
                    >
                      {record.shippingDate}
                    </td>
                    <td 
                      className="p-4 whitespace-nowrap text-sm font-medium text-gray-900 select-none"
                    >
                      {record.departureDate}
                    </td>
                    <td 
                      className="p-4 whitespace-nowrap text-sm text-gray-500 select-none"
                    >
                      {record.arrivalDate}
                    </td>
                    <td 
                      className="p-4 text-sm text-gray-500 select-none"
                    >
                      {record.cargoName}
                    </td>
                    <td 
                      className="p-4 text-sm text-gray-500 select-none"
                    >
                      {record.driver}
                    </td>
                    <td 
                      className="p-4 whitespace-nowrap text-sm text-gray-500 select-none"
                    >
                      {record.carNumber}
                    </td>
                    <td 
                      className="p-4 text-sm text-gray-500 select-none"
                    >
                      {record.driverLicense}
                    </td>
                    <td 
                      className="p-4 whitespace-nowrap text-sm text-gray-500 select-none"
                    >
                      {record.shippingWeight} кг
                    </td>
                    <td 
                      className="p-4 whitespace-nowrap text-sm text-gray-500 select-none"
                    >
                      {record.deliveryWeight} кг
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
                  <td colSpan={10} className="p-4 text-center text-sm text-gray-500">
                    Нет данных, соответствующих фильтрам. Попробуйте изменить параметры фильтрации.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <AddTransportForm 
        isOpen={isAddModalOpen} 
        onClose={closeAddModal} 
        onAdd={addTransportRecord} 
      />      
      <ViewEditTransportRecordModal 
        isOpen={isViewModalOpen} 
        onClose={closeViewModal} 
        recordId={selectedRecordId} 
        onUpdate={updateTransportRecord}
        records={transportData}
      />
    </div>
  );
};

export default Transport;