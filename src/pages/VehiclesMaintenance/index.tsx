// src/pages/VehiclesMaintenance.tsx
import { useState, useMemo, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import AnimatedAccordion from '../../components/AnimatedAccordion';
import VehicleModal from './components/vehicleModal';
import MaintenanceModal from './components/maintenanceModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import Charts from './components/charts';
import Button from '../../components/Button';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrencyWithSeparators, formatDate } from '../../utils/formatUtils';
import { exportRecordsToExcel, exportMaintenanceRecordsToExcel } from '../../utils/exportUtils';

interface VehicleMaintenanceRecord {
  id: number | string;
  vehicleId: string;
  vehicleName?: string;
  date: string;
  workType: string;
  cost: number;
  comment: string;
  frequency: string;
  mileage?: number;
}

const VehiclesMaintenance = () => {
  const vehicleData = useStore((state) => state.vehicleData);
  const syncVehicleData = useStore((state) => state.syncVehicleData);
  const addVehicleRecord = useStore((state) => state.addVehicleRecord);
  const updateVehicleRecord = useStore((state) => state.updateVehicleRecord);
  const deleteVehicleRecord = useStore((state) => state.deleteVehicleRecord);
  const isVehicleDataLoading = useStore((state) => state.isVehicleDataLoading);
  const vehicleDataError = useStore((state) => state.vehicleDataError);

  // Maintenance records data
  const maintenanceData: VehicleMaintenanceRecord[] = useStore((state) => state.maintenanceData);
  const syncMaintenanceData = useStore((state) => state.syncMaintenanceData);
  const addMaintenanceRecord = useStore((state) => state.addMaintenanceRecord);
  const updateMaintenanceRecord = useStore((state) => state.updateMaintenanceRecord);
  const deleteMaintenanceRecord = useStore((state) => state.deleteMaintenanceRecord);
  const isMaintenanceDataLoading = useStore((state) => state.isMaintenanceDataLoading);
  const maintenanceDataError = useStore((state) => state.maintenanceDataError);

  const { user, isAdmin } = useAuth();
  
  // State for modals
  const [isMaintenanceFormModalOpen, setIsMaintenanceFormModalOpen] = useState(false);
  const [isVehicleFormModalOpen, setIsVehicleFormModalOpen] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState<number | string | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | string | null>(null);
  const [deleteConfirmationVehicleId, setDeleteConfirmationVehicleId] = useState<number | string | null>(null);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<number | string | null>(null);

  useEffect(() => {
    // Load data from Firebase when component mounts
    syncVehicleData().catch(error => {
      console.error('Error loading vehicle data:', error);
    });
    
    syncMaintenanceData().catch(error => {
      console.error('Error loading maintenance data:', error);
    });
  }, [syncVehicleData, syncMaintenanceData]);

  // State for filters
  const [dateFilter, setDateFilter] = useState<string>('2025-10-01');
  const [workTypeFilter, setWorkTypeFilter] = useState<string>('');
  const [minCostFilter, setMinCostFilter] = useState<string>('');
  const [maxCostFilter, setMaxCostFilter] = useState<string>('');
  const [frequencyFilter, setFrequencyFilter] = useState<string>('');
  const [commentFilter, setCommentFilter] = useState<string>('');
  const [vehicleFilter, setVehicleFilter] = useState<string>('');
  const [minMileageFilter, setMinMileageFilter] = useState<string>('');
  const [maxMileageFilter, setMaxMileageFilter] = useState<string>('');

  // Get unique frequency values from maintenance data for dropdown
  const frequencyOptions = useMemo(() => {
    const frequencies = new Set<string>();
    maintenanceData.forEach(record => {
      if (record.frequency) {
        frequencies.add(record.frequency);
      }
    });
    return Array.from(frequencies).sort();
  }, [maintenanceData]);

  // Confirmation functions for deletion
  const confirmDelete = (id: number | string) => {
    if (isAdmin) {
      setDeleteConfirmationId(id);
    }
  };

  const handleDelete = () => {
    if (deleteConfirmationId !== null) {
      deleteMaintenanceRecord(deleteConfirmationId);
      setDeleteConfirmationId(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmationId(null);
  };

  // Apply filters to the data
  const filteredData = useMemo(() => {
    return maintenanceData.filter(record => {      
      // Date filter
      if (dateFilter && record.date !== dateFilter) {
        return false;
      }
      
      // Work type filter (partial match)
      if (workTypeFilter && !record.workType.toLowerCase().includes(workTypeFilter.toLowerCase())) {
        return false;
      }
      
      // Min cost filter
      if (minCostFilter && record.cost < parseFloat(minCostFilter)) {
        return false;
      }
      
      // Max cost filter
      if (maxCostFilter && record.cost > parseFloat(maxCostFilter)) {
        return false;
      }
      
      // Frequency filter (exact match)
      if (frequencyFilter && record.frequency !== frequencyFilter) {
        return false;
      }
      
      // Comment filter (partial match)
      if (commentFilter && !record.comment.toLowerCase().includes(commentFilter.toLowerCase())) {
        return false;
      }
      
      // Vehicle filter
      if (vehicleFilter && record.vehicleId !== vehicleFilter) {
        return false;
      }
      
      // Min mileage filter
      if (minMileageFilter && record.mileage !== undefined && record.mileage < parseFloat(minMileageFilter)) {
        return false;
      }
      
      // Max mileage filter
      if (maxMileageFilter && record.mileage !== undefined && record.mileage > parseFloat(maxMileageFilter)) {
        return false;
      }
      
      return true;
    });
  }, [
    maintenanceData, 
    dateFilter, 
    workTypeFilter, 
    minCostFilter, 
    maxCostFilter, 
    frequencyFilter, 
    commentFilter,
    vehicleFilter,
    minMileageFilter,
    maxMileageFilter
  ]);

  // Functions to handle modals
  const openMaintenanceFormModal = (id?: number | string | null) => {    
    if (id !== undefined) {
      setSelectedRecordId(id);
    } else {
      setSelectedRecordId(null);
    }
    setIsMaintenanceFormModalOpen(true);
  };

  const closeMaintenanceFormModal = () => {
    setIsMaintenanceFormModalOpen(false);
    setSelectedRecordId(null);
  };

  const openVehicleFormModal = (id?: number | string | null) => {
    if (id !== undefined) {
      setSelectedVehicleId(id);
    } else {
      setSelectedVehicleId(null);
    }
    setIsVehicleFormModalOpen(true);
  };

  const closeVehicleFormModal = () => {
    setIsVehicleFormModalOpen(false);
    setSelectedVehicleId(null);
  };

  // Handle adding a new vehicle
  const handleAddVehicle = async (vehicle: any) => {
    await addVehicleRecord(vehicle);
  };

  // Handle updating a vehicle
  const handleUpdateVehicle = async (id: number | string, vehicle: any) => {
    await updateVehicleRecord(id, vehicle);
  };

  // Clear all filters
  const clearFilters = () => {
    setDateFilter('');
    setWorkTypeFilter('');
    setMinCostFilter('');
    setMaxCostFilter('');
    setFrequencyFilter('');
    setCommentFilter('');
    setVehicleFilter('');
    setMinMileageFilter('');
    setMaxMileageFilter('');
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Каталог технического обслуживания автомобилей</h1>
        <div className="flex flex-wrap gap-3">
          {isAdmin && (
            <Button 
              onClick={() => openMaintenanceFormModal()}
              variant="primary" className="flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Добавить запись
            </Button>
          )}
        </div>
      </div>
      
      {/* Error messages */}
      {(vehicleDataError || maintenanceDataError) && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {vehicleDataError && <div>{vehicleDataError}</div>}
          {maintenanceDataError && <div>{maintenanceDataError}</div>}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Частота</label>
            <select
              value={frequencyFilter}
              onChange={(e) => setFrequencyFilter(e.target.value)}
              className="w-56 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
            >
              <option value="">Все частоты</option>
              {frequencyOptions.map(frequency => (
                <option key={frequency} value={frequency}>
                  {frequency}
                </option>
              ))}
            </select>
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
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Автомобиль</label>
            <select
              value={vehicleFilter}
              onChange={(e) => setVehicleFilter(e.target.value)}
              className="w-56 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
            >
              <option value="">Все автомобили</option>
              {vehicleData.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.name} ({vehicle.manufacturer} {vehicle.model})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Мин. пробег</label>
            <input
              type="number"
              placeholder="Мин. пробег"
              value={minMileageFilter}
              onChange={(e) => setMinMileageFilter(e.target.value)}
              className="w-56 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Макс. пробег</label>
            <input
              type="number"
              placeholder="Макс. пробег"
              value={maxMileageFilter}
              onChange={(e) => setMaxMileageFilter(e.target.value)}
              className="w-56 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
            />
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
      
      {/* Vehicles Charts */}
      <div className="mt-6">
        <AnimatedAccordion title="Аналитика расходов" defaultOpen={true}>
          <Charts records={filteredData} vehicles={vehicleData} />
        </AnimatedAccordion>
      </div>
      
      {/* Delete Confirmation Modal */}
      {isAdmin && deleteConfirmationId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Подтверждение удаления</h3>
            <p className="text-gray-600 mb-6">Вы уверены, что хотите удалить эту запись? Это действие нельзя отменить.</p>
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
      
      <AnimatedAccordion title="Записи" defaultOpen={false}>
        <div className="flex justify-between mb-4">
          <h3 className="text-lg font-semibold mb-2">Записи технического обслуживания</h3>
          <button onClick={() => exportMaintenanceRecordsToExcel(
            filteredData,
            `Техническое_обслуживание_${new Date().toISOString().slice(0, 10)}.xlsx`,
            'Записи ТО'
          )} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Скачать в .xlsx
          </button>
        </div>
        <div className="overflow-x-auto">
          {isMaintenanceDataLoading ? (
            <div className="py-12">
              <LoadingSpinner message="Загрузка данных технического обслуживания..." />
            </div>
          ) : maintenanceDataError ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {maintenanceDataError}
            </div>
          ) : (
            <>
              {/* Mobile View - Card Layout */}
              <div className="block md:hidden">
            {filteredData.length > 0 ? (
              filteredData.map((record) => (
                <div key={record.id} className="border-b border-gray-200 p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div 
                      className={`flex-1 ${isAdmin ? 'cursor-pointer' : ''}`}
                      onClick={isAdmin ? () => openMaintenanceFormModal(record.id) : undefined}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-gray-900">{record.workType}</div>
                        <div className="text-sm text-gray-500">{formatDate(record.date)}</div>
                      </div>
                      <div className="mt-1 text-sm text-gray-500 truncate max-w-xs">{record.comment}</div>
                      <div className="mt-2 text-xs text-gray-500 space-y-1">
                        <div className="flex justify-between">
                          <span>Стоимость:</span>
                          <span className="font-medium">{formatCurrencyWithSeparators(record.cost)} ₽</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Частота:</span>
                          <span className="font-medium">{record.frequency}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Пробег:</span>
                          <span className="font-medium">{record.mileage !== undefined ? `${record.mileage} км` : 'Не указан'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Автомобиль:</span>
                          <span className="font-medium">{record.vehicleId}</span>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Пробег</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Комментарий</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Автомобиль</th>
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
                    onClick={isAdmin ? () => openMaintenanceFormModal(record.id) : undefined}
                  >
                    <td 
                      className="p-4 whitespace-nowrap text-sm text-gray-500"
                    >
                      {formatDate(record.date)}
                    </td>
                    <td 
                      className="p-4 whitespace-nowrap text-sm font-medium text-gray-900"
                    >
                      {record.workType}
                    </td>
                    <td 
                      className="p-4 whitespace-nowrap text-sm text-gray-500"
                    >
                      {formatCurrencyWithSeparators(record.cost)} ₽
                    </td>
                    <td 
                      className="p-4 whitespace-nowrap text-sm text-gray-500"
                    >
                      {record.frequency}
                    </td>
                    <td 
                      className="p-4 whitespace-nowrap text-sm text-gray-500"
                    >
                      {record.mileage !== undefined ? `${record.mileage} км` : 'Не указан'}
                    </td>
                    <td 
                      className="p-4 text-sm text-gray-500"
                    >
                      {record.comment}
                    </td>
                    <td 
                      className="p-4 text-sm text-gray-500"
                    >
                      {record.vehicleId}
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
                  <td colSpan={isAdmin ? 9 : 8} className="p-4 text-center text-sm text-gray-500">
                    Нет данных, соответствующих фильтрам. Попробуйте изменить параметры фильтрации.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  </AnimatedAccordion>
      
      {/* Vehicle Management Section */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Управление автомобилями</h2>
          {isAdmin && (
            <Button 
              onClick={() => openVehicleFormModal()}
              variant="primary" className="flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Добавить автомобиль
            </Button>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            {isVehicleDataLoading ? (
              <div className="py-12">
                <LoadingSpinner message="Загрузка данных об автомобилях..." />
              </div>
            ) : vehicleDataError ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {vehicleDataError}
              </div>
            ) : (
              <>
                {/* Mobile View - Card Layout */}
                <div className="block md:hidden">
              {vehicleData.length > 0 ? (
                vehicleData.map(vehicle => (
                  <div key={vehicle.id} className="border-b border-gray-200 p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium text-gray-900">{vehicle.name}</div>
                          {isAdmin && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => openVehicleFormModal(vehicle.id)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Редактировать автомобиль"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteConfirmationVehicleId(vehicle.id);
                                }}
                                className="text-red-600 hover:text-red-900"
                                title="Удалить автомобиль"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="mt-1 text-sm text-gray-500">
                          {vehicle.manufacturer} {vehicle.model}
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          VIN: {vehicle.vin || 'Не указан'} | 
                          Двигатель: {vehicle.engineNumber || 'Не указан'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-sm text-gray-500">
                  Нет данных о транспортных средствах.
                </div>
              )}
            </div>
            
            {/* Desktop View - Table */}
            <table className="hidden md:table divide-y divide-gray-200 min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Производитель</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Марка</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">VIN/Кузов</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Данные СТС</th>
                  {isAdmin && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vehicleData.length > 0 ? (
                  vehicleData.map(vehicle => (
                    <tr key={vehicle.id} className="hover:bg-gray-50">
                      <td className="p-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {vehicle.name}
                      </td>
                      <td className="p-4 whitespace-nowrap text-sm text-gray-500">
                        {vehicle.manufacturer}
                      </td>
                      <td className="p-4 whitespace-nowrap text-sm text-gray-500">
                        {vehicle.model}
                      </td>
                      <td className="p-4 whitespace-nowrap text-sm text-gray-500">
                        {vehicle.vin}
                      </td>
                      <td className="p-4 whitespace-nowrap text-sm text-gray-500">
                        {vehicle.stsData}
                      </td>
                      {isAdmin && (
                        <td className="p-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => openVehicleFormModal(vehicle.id)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                            title="Редактировать автомобиль"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmationVehicleId(vehicle.id);
                            }}
                            className="text-red-600 hover:text-red-900"
                            title="Удалить автомобиль"
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
                      Нет данных о транспортных средствах.
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
      
      {/* Maintenance Form Modal */}
      {isAdmin && (
        <MaintenanceModal 
          isOpen={isMaintenanceFormModalOpen} 
          onClose={closeMaintenanceFormModal} 
          recordId={selectedRecordId} 
          record={selectedRecordId ? maintenanceData.find(m => m.id === selectedRecordId) as any : undefined}
          vehicles={vehicleData}
          onAdd={addMaintenanceRecord} 
          onUpdate={updateMaintenanceRecord} 
        />
      )}
      
      {/* Vehicle Form Modal */}
      {isAdmin && (
        <VehicleModal 
          isOpen={isVehicleFormModalOpen} 
          onClose={closeVehicleFormModal} 
          recordId={selectedVehicleId} 
          record={selectedVehicleId ? vehicleData.find(v => v.id === selectedVehicleId) as any : undefined}
          onAdd={handleAddVehicle} 
          onUpdate={handleUpdateVehicle} 
        />
      )}
      
      {/* Delete Confirmation Modal for Vehicles */}
      {isAdmin && deleteConfirmationVehicleId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Подтверждение удаления</h3>
            <p className="text-gray-600 mb-6">Вы уверены, что хотите удалить этот автомобиль? Это действие нельзя отменить.</p>
            <div className="flex justify-end space-x-3">
              <Button
                onClick={() => setDeleteConfirmationVehicleId(null)}
                variant="secondary"
              >
                Отмена
              </Button>
              <Button
                onClick={async () => {
                  try {
                    await deleteVehicleRecord(deleteConfirmationVehicleId);
                    setDeleteConfirmationVehicleId(null);
                  } catch (error) {
                    console.error('Error deleting vehicle:', error);
                    alert('Ошибка при удалении автомобиля. Попробуйте еще раз.');
                  }
                }}
                variant="danger"
              >
                Удалить
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehiclesMaintenance;