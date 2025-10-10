import { useState } from 'react';

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

interface AddTransportFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (record: Omit<TransportRecord, 'id'>) => void;
}

const AddTransportForm: React.FC<AddTransportFormProps> = ({ isOpen, onClose, onAdd }) => {
  const [shippingDate, setShippingDate] = useState<string>('');
  const [departureDate, setDepartureDate] = useState<string>('');
  const [arrivalDate, setArrivalDate] = useState<string>('');
  const [cargoName, setCargoName] = useState<string>('');
  const [driver, setDriver] = useState<string>('');
  const [carNumber, setCarNumber] = useState<string>('');
  const [driverLicense, setDriverLicense] = useState<string>('');
  const [shippingWeight, setShippingWeight] = useState<string>('');
  const [deliveryWeight, setDeliveryWeight] = useState<string>('');

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Добавить запись в транспортный журнал</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Дата отгрузки *</label>
              <input
                type="date"
                value={shippingDate}
                onChange={(e) => setShippingDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Дата выезда *</label>
              <input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Дата прибытия *</label>
              <input
                type="date"
                value={arrivalDate}
                onChange={(e) => setArrivalDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Наименование груза *</label>
              <input
                type="text"
                value={cargoName}
                onChange={(e) => setCargoName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
                placeholder="Наименование груза"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Водитель *</label>
              <input
                type="text"
                value={driver}
                onChange={(e) => setDriver(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
                placeholder="ФИО водителя"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Номер автомобиля *</label>
              <input
                type="text"
                value={carNumber}
                onChange={(e) => setCarNumber(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
                placeholder="Номер автомобиля"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Номер водительского удостоверения *</label>
              <input
                type="text"
                value={driverLicense}
                onChange={(e) => setDriverLicense(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
                placeholder="Номер ВУ"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Вес при отправке *</label>
              <input
                type="number"
                value={shippingWeight}
                onChange={(e) => setShippingWeight(e.target.value)}
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
                value={deliveryWeight}
                onChange={(e) => setDeliveryWeight(e.target.value)}
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
              Добавить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransportForm;