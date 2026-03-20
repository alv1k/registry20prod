import { useState, useEffect } from 'react';
import Modal from '../../../components/Modal';

interface VehicleRecord {
  id: number | string;
  name: string;
  manufacturer: string;
  model: string;
  engineVolume: string;
  engineNumber: string;
  vin: string;
  stsData: string;
  ptsData: string;
}

interface VehicleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordId?: number | string | null;
  record?: VehicleRecord | null;
  onAdd: (record: Omit<VehicleRecord, 'id'>) => void;
  onUpdate: (id: number | string, record: Partial<VehicleRecord>) => void;
}

const VehicleModal: React.FC<VehicleFormModalProps> = ({ 
  isOpen, 
  onClose, 
  recordId, 
  record,
  onAdd, 
  onUpdate 
}) => {
  const [name, setName] = useState<string>('');
  const [manufacturer, setManufacturer] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [engineVolume, setEngineVolume] = useState<string>('');
  const [engineNumber, setEngineNumber] = useState<string>('');
  const [vin, setVin] = useState<string>('');
  const [stsData, setStsData] = useState<string>('');
  const [ptsData, setPtsData] = useState<string>('');
  const [, setFocusedInput] = useState<string | null>(null);

  // Load record data if editing
  useEffect(() => {
    if (recordId && record && isOpen) {
      // Load existing record data for editing
      setName(record.name || '');
      setManufacturer(record.manufacturer || '');
      setModel(record.model || '');
      setEngineVolume(record.engineVolume || '');
      setEngineNumber(record.engineNumber || '');
      setVin(record.vin || '');
      setStsData(record.stsData || '');
      setPtsData(record.ptsData || '');
    } else if (isOpen) {
      // Reset form for new records
      setName('');
      setManufacturer('');
      setModel('');
      setEngineVolume('');
      setEngineNumber('');
      setVin('');
      setStsData('');
      setPtsData('');
    }
  }, [recordId, record, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!name || !manufacturer || !model) {
      alert('Пожалуйста, заполните обязательные поля: название, производитель и марка');
      return;
    }

    const recordData = {
      name,
      manufacturer,
      model,
      engineVolume,
      engineNumber,
      vin,
      stsData,
      ptsData
    };

    if (recordId) {
      onUpdate(recordId, recordData);
    } else {
      onAdd(recordData);
    }

    // Reset form
    setName('');
    setManufacturer('');
    setModel('');
    setEngineVolume('');
    setEngineNumber('');
    setVin('');
    setStsData('');
    setPtsData('');
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={recordId ? "Редактировать данные автомобиля" : "Добавить новый автомобиль"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Название *</label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={(e) => setFocusedInput(e.target.name)}
              onBlur={() => setFocusedInput(null)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
              placeholder="Например: Грузовик 1"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Производитель *</label>
            <input
              type="text"
              name="manufacturer"
              value={manufacturer}
              onChange={(e) => setManufacturer(e.target.value)}
              onFocus={(e) => setFocusedInput(e.target.name)}
              onBlur={() => setFocusedInput(null)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
              placeholder="Например: Mercedes-Benz"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Марка *</label>
            <input
              type="text"
              name="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              onFocus={(e) => setFocusedInput(e.target.name)}
              onBlur={() => setFocusedInput(null)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
              placeholder="Например: Actros"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Объем двигателя</label>
            <input
              type="text"
              name="engineVolume"
              value={engineVolume}
              onChange={(e) => setEngineVolume(e.target.value)}
              onFocus={(e) => setFocusedInput(e.target.name)}
              onBlur={() => setFocusedInput(null)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
              placeholder="Например: 12.8 л"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Номер двигателя</label>
            <input
              type="text"
              name="engineNumber"
              value={engineNumber}
              onChange={(e) => setEngineNumber(e.target.value)}
              onFocus={(e) => setFocusedInput(e.target.name)}
              onBlur={() => setFocusedInput(null)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
              placeholder="Номер двигателя"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Номер VIN/кузова</label>
            <input
              type="text"
              name="vin"
              value={vin}
              onChange={(e) => setVin(e.target.value)}
              onFocus={(e) => setFocusedInput(e.target.name)}
              onBlur={() => setFocusedInput(null)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
              placeholder="Номер VIN"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Данные СТС</label>
            <input
              type="text"
              name="stsData"
              value={stsData}
              onChange={(e) => setStsData(e.target.value)}
              onFocus={(e) => setFocusedInput(e.target.name)}
              onBlur={() => setFocusedInput(null)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
              placeholder="Серия и номер СТС"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Данные ПТС</label>
            <input
              type="text"
              name="ptsData"
              value={ptsData}
              onChange={(e) => setPtsData(e.target.value)}
              onFocus={(e) => setFocusedInput(e.target.name)}
              onBlur={() => setFocusedInput(null)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
              placeholder="Серия и номер ПТС"
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

export default VehicleModal;