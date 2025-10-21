import { useState, useEffect } from 'react';
import Modal from './Modal';
import { AppVehicleRecord } from '../store/useStore';

interface TransportRecord {
  id: number | string;
  vehicleId: string;
  date: string;
  workType: string;
  cost: number;
  comment: string;
  frequency: string;
  mileage?: number;
}

interface TransportFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordId?: number | string | null;
  record?: TransportRecord | null; // Existing record data for editing
  vehicleData?: AppVehicleRecord[]; // Vehicle data for the dropdown
  onAdd: (record: Omit<TransportRecord, 'id'>) => void;
  onUpdate: (id: number | string, record: Partial<TransportRecord>) => void;
}

const TransportFormModal: React.FC<TransportFormModalProps> = ({ 
  isOpen, 
  onClose, 
  recordId, 
  record,
  vehicleData = [],
  onAdd, 
  onUpdate 
}) => {
  const [vehicleId, setVehicleId] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [workType, setWorkType] = useState<string>('');
  const [cost, setCost] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [frequency, setFrequency] = useState<string>('');
  const [mileage, setMileage] = useState<string>('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // Load record data if editing
  useEffect(() => {
    if (recordId && record && isOpen) {
      // Load existing record data for editing
      setVehicleId(record.vehicleId || '');
      setDate(record.date || '');
      setWorkType(record.workType || '');
      setCost(record.cost ? record.cost.toString() : '');
      setComment(record.comment || '');
      setFrequency(record.frequency || '');
      setMileage(record.mileage ? record.mileage.toString() : '');
    } else if (isOpen) {
      // Reset form for new records
      setVehicleId('');
      setDate('');
      setWorkType('');
      setCost('');
      setComment('');
      setFrequency('');
      setMileage('');
    }
  }, [recordId, record, isOpen, vehicleData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!vehicleId || !date || !workType || !cost || !frequency) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }

    // Parse cost as number
    const costNum = parseFloat(cost);
    if (isNaN(costNum)) {
      alert('Стоимость должна быть числовым значением');
      return;
    }

    // Parse mileage as number (optional)
    let mileageNum: number | undefined;
    if (mileage) {
      mileageNum = parseFloat(mileage);
      if (isNaN(mileageNum)) {
        alert('Пробег должен быть числовым значением');
        return;
      }
    }

    const recordData: Omit<TransportRecord, 'id'> = {
      vehicleId,
      date,
      workType,
      cost: costNum,
      comment,
      frequency,
      mileage: mileageNum
    };

    if (recordId) {
      onUpdate(recordId, recordData);
    } else {
      onAdd(recordData);
    }

    // Reset form
    setVehicleId('');
    setDate('');
    setWorkType('');
    setCost('');
    setComment('');
    setFrequency('');
    setMileage('');
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={recordId ? "Редактировать транспортную запись" : "Добавить запись в транспортный каталог"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Автомобиль *</label>
            <select
              name="vehicleId"
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              onFocus={(e) => setFocusedInput(e.target.name)}
              onBlur={() => setFocusedInput(null)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
              required
            >
              <option value="">Выберите автомобиль</option>
              {vehicleData.map(vehicle => (
                <option key={vehicle.id} value={vehicle.name}>
                  {vehicle.name} ({vehicle.manufacturer} {vehicle.model})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Дата записи *</label>
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
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Вид работ *</label>
            <input
              type="text"
              name="workType"
              value={workType}
              onChange={(e) => setWorkType(e.target.value)}
              onFocus={(e) => setFocusedInput(e.target.name)}
              onBlur={() => setFocusedInput(null)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
              placeholder="Наименование работ"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Стоимость *</label>
            <input
              type="number"
              name="cost"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              onFocus={(e) => setFocusedInput(e.target.name)}
              onBlur={() => setFocusedInput(null)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
              placeholder="Стоимость в рублях"
              min="0"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Комментарий</label>
            <input
              type="text"
              name="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onFocus={(e) => setFocusedInput(e.target.name)}
              onBlur={() => setFocusedInput(null)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
              placeholder="Дополнительная информация"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Частота *</label>
            <select
              name="frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              onFocus={(e) => setFocusedInput(e.target.name)}
              onBlur={() => setFocusedInput(null)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
              required
            >
              <option value="">Выберите частоту</option>
              <option value="единоразово">Единоразово</option>
              <option value="ежедневно">Ежедневно</option>
              <option value="еженедельно">Еженедельно</option>
              <option value="ежемесячно">Ежемесячно</option>
              <option value="ежеквартально">Ежеквартально</option>
              <option value="ежегодно">Ежегодно</option>
              <option value="раз в 1000 км">Раз в 1000 км</option>
              <option value="раз в 3000 км">Раз в 3000 км</option>
              <option value="раз в 5000 км">Раз в 5000 км</option>
              <option value="раз в 10000 км">Раз в 10000 км</option>
              <option value="раз в 15000 км">Раз в 15000 км</option>
              <option value="раз в 20000 км">Раз в 20000 км</option>
              <option value="раз в 30000 км">Раз в 30000 км</option>
              <option value="раз в 50000 км">Раз в 50000 км</option>
              <option value="раз в 100000 км">Раз в 100000 км</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Пробег</label>
            <input
              type="number"
              name="mileage"
              value={mileage}
              onChange={(e) => setMileage(e.target.value)}
              onFocus={(e) => setFocusedInput(e.target.name)}
              onBlur={() => setFocusedInput(null)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
              placeholder="Пробег автомобиля"
              min="0"
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

export default TransportFormModal;