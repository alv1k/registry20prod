import { useState, useEffect } from 'react';
import Modal from './Modal'; // Предполагаем, что у вас есть компонент Modal

interface TransportRecord {
  id: number;
  shippingDate: string;
  departureDate: string;
  arrivalDate: string;
  cargoName: string;
  driver: string;
  carNumber: string;
  driverLicense: string;
  shippingWeight: number;
  deliveryWeight: number;
}

interface TransportFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordId?: number | string | null; // Optional for new records
  onUpdate: (id: number | string, updatedRecord: Partial<TransportRecord>) => void | Promise<void>; // For updates
  onAdd: (record: Omit<TransportRecord, 'id'>) => void | Promise<void>; // For new records
  record?: TransportRecord | null; // Existing record data for editing
}

const TransportFormModal: React.FC<TransportFormModalProps> = ({ 
  isOpen, 
  onClose, 
  recordId, 
  onUpdate,
  onAdd,
  record
}) => {
  const [shippingDate, setShippingDate] = useState<string>('');
  const [departureDate, setDepartureDate] = useState<string>('');
  const [arrivalDate, setArrivalDate] = useState<string>('');
  const [cargoName, setCargoName] = useState<string>('');
  const [driver, setDriver] = useState<string>('');
  const [carNumber, setCarNumber] = useState<string>('');
  const [driverLicense, setDriverLicense] = useState<string>('');
  const [shippingWeight, setShippingWeight] = useState<string>('');
  const [deliveryWeight, setDeliveryWeight] = useState<string>('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // Initialize form data when recordId changes or modal opens for editing
  useEffect(() => {
    if (recordId && record && isOpen) {
      // Load existing record data for editing
      setShippingDate(record.shippingDate);
      setDepartureDate(record.departureDate);
      setArrivalDate(record.arrivalDate);
      setCargoName(record.cargoName);
      setDriver(record.driver);
      setCarNumber(record.carNumber);
      setDriverLicense(record.driverLicense);
      setShippingWeight(record.shippingWeight.toString());
      setDeliveryWeight(record.deliveryWeight.toString());
    } else if (isOpen) {
      // Reset form for new records
      setShippingDate('');
      setDepartureDate('');
      setArrivalDate('');
      setCargoName('');
      setDriver('');
      setCarNumber('');
      setDriverLicense('');
      setShippingWeight('');
      setDeliveryWeight('');
    }
  }, [recordId, record, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!shippingDate || !departureDate || !arrivalDate || !cargoName || !driver || !carNumber || !driverLicense || !shippingWeight || !deliveryWeight) {
      alert('Пожалуйста, заполните все поля');
      return;
    }

    // Parse weights as numbers
    const shippingWeightNum = parseFloat(shippingWeight);
    const deliveryWeightNum = parseFloat(deliveryWeight);

    if (isNaN(shippingWeightNum) || isNaN(deliveryWeightNum)) {
      alert('Вес должен быть числовым значением');
      return;
    }

    if (recordId) {
      // Update existing record
      onUpdate(recordId, {
        shippingDate,
        departureDate,
        arrivalDate,
        cargoName,
        driver,
        carNumber,
        driverLicense,
        shippingWeight: shippingWeightNum,
        deliveryWeight: deliveryWeightNum
      });
    } else {
      // Add new record
      onAdd({
        shippingDate,
        departureDate,
        arrivalDate,
        cargoName,
        driver,
        carNumber,
        driverLicense,
        shippingWeight: shippingWeightNum,
        deliveryWeight: deliveryWeightNum
      });
    }

    // Reset form
    setShippingDate('');
    setDepartureDate('');
    setArrivalDate('');
    setCargoName('');
    setDriver('');
    setCarNumber('');
    setDriverLicense('');
    setShippingWeight('');
    setDeliveryWeight('');
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={recordId ? "Редактировать транспортную запись" : "Добавить запись в транспортный журнал"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Дата отгрузки *</label>
            <input
              type="date"
              name="shippingDate"
              value={shippingDate}
              onChange={(e) => setShippingDate(e.target.value)}
              onFocus={(e) => setFocusedInput(e.target.name)}
              onBlur={() => setFocusedInput(null)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Дата выезда *</label>
            <input
              type="date"
              name="departureDate"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              onFocus={(e) => setFocusedInput(e.target.name)}
              onBlur={() => setFocusedInput(null)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Дата прибытия *</label>
            <input
              type="date"
              name="arrivalDate"
              value={arrivalDate}
              onChange={(e) => setArrivalDate(e.target.value)}
              onFocus={(e) => setFocusedInput(e.target.name)}
              onBlur={() => setFocusedInput(null)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Наименование груза *</label>
            <input
              type="text"
              name="cargoName"
              value={cargoName}
              onChange={(e) => setCargoName(e.target.value)}
              onFocus={(e) => setFocusedInput(e.target.name)}
              onBlur={() => setFocusedInput(null)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
              placeholder="Наименование груза"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Водитель *</label>
            <input
              type="text"
              name="driver"
              value={driver}
              onChange={(e) => setDriver(e.target.value)}
              onFocus={(e) => setFocusedInput(e.target.name)}
              onBlur={() => setFocusedInput(null)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
              placeholder="ФИО водителя"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Номер автомобиля *</label>
            <input
              type="text"
              name="carNumber"
              value={carNumber}
              onChange={(e) => setCarNumber(e.target.value)}
              onFocus={(e) => setFocusedInput(e.target.name)}
              onBlur={() => setFocusedInput(null)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
              placeholder="Номер автомобиля"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Номер водительского удостоверения *</label>
            <input
              type="text"
              name="driverLicense"
              value={driverLicense}
              onChange={(e) => setDriverLicense(e.target.value)}
              onFocus={(e) => setFocusedInput(e.target.name)}
              onBlur={() => setFocusedInput(null)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
              placeholder="Номер ВУ"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Вес при отправке *</label>
            <input
              type="number"
              name="shippingWeight"
              value={shippingWeight}
              onChange={(e) => setShippingWeight(e.target.value)}
              onFocus={(e) => setFocusedInput(e.target.name)}
              onBlur={() => setFocusedInput(null)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
              placeholder="Вес при отправке (кг)"
              min="0"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Вес при отгрузке *</label>
            <input
              type="number"
              name="deliveryWeight"
              value={deliveryWeight}
              onChange={(e) => setDeliveryWeight(e.target.value)}
              onFocus={(e) => setFocusedInput(e.target.name)}
              onBlur={() => setFocusedInput(null)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
              placeholder="Вес при отгрузке (кг)"
              min="0"
              required
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