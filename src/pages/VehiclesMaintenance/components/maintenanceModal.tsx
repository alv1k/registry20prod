import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../../../components/Modal';

interface MaintenanceRecord {
  id: number | string;
  vehicleId: string;
  date: string;
  workType: string;
  cost: number;
  quantity?: number;
  comment: string;
  frequency: string;
  mileage?: number;
}

interface Vehicle {
  id: number | string;
  name: string;
  manufacturer: string;
  model: string;
}

interface MaintenanceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordId?: number | string | null;
  record?: MaintenanceRecord | null;
  vehicles: Vehicle[];
  workTypeOptions: string[];
  onAdd: (record: Omit<MaintenanceRecord, 'id'>) => void;
  onUpdate: (id: number | string, record: Partial<MaintenanceRecord>) => void;
}

const MaintenanceModal: React.FC<MaintenanceFormModalProps> = ({
  isOpen,
  onClose,
  recordId,
  record,
  vehicles,
  workTypeOptions,
  onAdd,
  onUpdate
}) => {
  const [vehicleId, setVehicleId] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [workType, setWorkType] = useState<string>('');
  const [showWorkTypeDropdown, setShowWorkTypeDropdown] = useState<boolean>(false);
  const [cost, setCost] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [comment, setComment] = useState<string>('');
  const [frequency, setFrequency] = useState<string>('');
  const [mileage, setMileage] = useState<number | undefined>(undefined);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // Calculate total cost
  const totalCost = cost * (quantity || 1);

  // Load record data if editing
  useEffect(() => {
    if (recordId && record && isOpen) {
      // Load existing record data for editing
      setVehicleId(record.vehicleId || '');
      setDate(record.date || '');
      setWorkType(record.workType || '');
      setCost(record.cost || 0);
      setQuantity(record.quantity || 1);
      setComment(record.comment || '');
      setFrequency(record.frequency || '');
      setMileage(record.mileage || undefined);
    } else if (isOpen) {
      // Reset form for new records
      setVehicleId('');
      setDate(new Date().toISOString().split('T')[0]); // Default to today's date
      setWorkType('');
      setCost(0);
      setQuantity(1);
      setComment('');
      setFrequency('');
      setMileage(undefined);
    }
  }, [recordId, record, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!vehicleId || !date || !workType || cost < 0) {
      alert('Пожалуйста, заполните обязательные поля: автомобиль, дата, вид работ');
      return;
    }

    // Find the selected vehicle to get its name
    const selectedVehicle = vehicles.find(v => v.id === vehicleId);
    const vehicleName = selectedVehicle ? `${selectedVehicle.name} (${selectedVehicle.manufacturer} ${selectedVehicle.model})` : undefined;

    const recordData = {
      vehicleId,
      vehicleName,
      date,
      workType,
      cost,
      quantity,
      comment,
      frequency,
      mileage: mileage || undefined
    };

    if (recordId) {
      onUpdate(recordId, recordData);
    } else {
      onAdd(recordData);
    }

    // Reset form
    setVehicleId('');
    setDate(new Date().toISOString().split('T')[0]);
    setWorkType('');
    setCost(0);
    setQuantity(1);
    setComment('');
    setFrequency('');
    setMileage(undefined);
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={recordId ? "Редактировать запись ТО" : "Добавить запись ТО"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Автомобиль *</label>
            <select
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
              required
            >
              <option value="">Выберите автомобиль</option>
              {vehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.name} ({vehicle.manufacturer} {vehicle.model})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Дата *</label>
            <input
              type="date"
              name="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              onFocus={(e) => setFocusedInput(e.target.name)}
              onBlur={() => setFocusedInput(null)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
              required
            />
          </div>
          
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Вид работ *</label>
            <div className="relative">
              <input
                type="text"
                name="workType"
                value={workType}
                onChange={(e) => setWorkType(e.target.value)}
                onFocus={(e) => {
                  setFocusedInput(e.target.name);
                  setShowWorkTypeDropdown(true);
                }}
                onBlur={() => setTimeout(() => setShowWorkTypeDropdown(false), 200)}
                className="w-full p-2 pr-10 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
                placeholder="Например: Техническое обслуживание, Замена масла"
                required
              />
              <div
                className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                onClick={() => setShowWorkTypeDropdown(!showWorkTypeDropdown)}
              >
                <svg
                  className={`h-5 w-5 text-gray-400 transform ${showWorkTypeDropdown ? 'rotate-180' : ''}`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <AnimatePresence>
              {showWorkTypeDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
                >
                  {workTypeOptions
                    .filter(option =>
                      option.toLowerCase().includes(workType.toLowerCase())
                    )
                    .map((option, index) => (
                      <div
                        key={index}
                        className="p-2 hover:bg-blue-100 cursor-pointer"
                        onMouseDown={() => {
                          setWorkType(option);
                          setShowWorkTypeDropdown(false);
                        }}
                      >
                        {option}
                      </div>
                    ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Стоимость *</label>
            <input
              type="text"
              inputMode="decimal"
              name="cost"
              value={cost}
              onChange={(e) => {
                const value = e.target.value;
                // Remove any non-numeric characters except decimal point
                const cleanValue = value.replace(/[^0-9.]/g, '');

                // Split into integer and decimal parts
                const parts = cleanValue.split('.');
                if (parts.length > 2) return; // Prevent multiple decimal points

                let integerPart = parts[0];
                let decimalPart = parts.length > 1 ? parts[1] : '';

                // Remove leading zeros from integer part (but keep at least one digit)
                if (integerPart) {
                  integerPart = integerPart.replace(/^0+([1-9])/, '$1'); // Remove leading zeros but keep first non-zero digit
                  if (integerPart === '') integerPart = '0'; // If all digits were zeros, keep one zero
                }

                // Limit decimal part to 2 digits
                if (decimalPart.length > 2) {
                  decimalPart = decimalPart.substring(0, 2);
                }

                // Reconstruct the value
                let processedValue = integerPart;
                if (decimalPart) {
                  processedValue += '.' + decimalPart;
                }

                // Convert to number and store in state
                const numValue = processedValue === '' ? 0 : Number(processedValue);
                setCost(Math.max(0, isNaN(numValue) ? 0 : Math.round(numValue * 100) / 100));
              }}
              onFocus={(e) => setFocusedInput(e.target.name)}
              onBlur={() => setFocusedInput(null)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
              placeholder="Стоимость в рублях"
              min="0"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Количество</label>
            <input
              type="number"
              name="quantity"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(0, Number(e.target.value)))}
              onFocus={(e) => setFocusedInput(e.target.name)}
              onBlur={() => setFocusedInput(null)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
              placeholder="Количество"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Итоговая сумма</label>
            <div className="w-full p-2 border border-gray-300 rounded-md bg-gray-50">
              {totalCost.toFixed(2)} ₽
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Частота</label>
            <input
              type="text"
              name="frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              onFocus={(e) => setFocusedInput(e.target.name)}
              onBlur={() => setFocusedInput(null)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
              placeholder="Например: каждые 10000 км"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Пробег</label>
            <input
              type="number"
              name="mileage"
              value={mileage || ''}
              onChange={(e) => setMileage(e.target.value ? Number(e.target.value) : undefined)}
              onFocus={(e) => setFocusedInput(e.target.name)}
              onBlur={() => setFocusedInput(null)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
              placeholder="Пробег в км"
              min="0"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Комментарий</label>
            <textarea
              name="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onFocus={(e) => setFocusedInput(e.target.name)}
              onBlur={() => setFocusedInput(null)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
              placeholder="Дополнительная информация"
              rows={3}
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Отмена
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            {recordId ? 'Сохранить изменения' : 'Добавить'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default MaintenanceModal;