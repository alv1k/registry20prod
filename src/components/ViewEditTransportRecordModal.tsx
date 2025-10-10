import { useState, useEffect } from 'react';

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

interface ViewEditTransportRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordId: number | null;
  onUpdate: (id: number, updatedRecord: Partial<TransportRecord>) => void;
  records: TransportRecord[];
}

const ViewEditTransportRecordModal: React.FC<ViewEditTransportRecordModalProps> = ({ 
  isOpen, 
  onClose, 
  recordId, 
  onUpdate,
  records 
}) => {
  const [record, setRecord] = useState<TransportRecord | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form fields
  const [shippingDate, setShippingDate] = useState<string>('');
  const [departureDate, setDepartureDate] = useState<string>('');
  const [arrivalDate, setArrivalDate] = useState<string>('');
  const [cargoName, setCargoName] = useState<string>('');
  const [driver, setDriver] = useState<string>('');
  const [carNumber, setCarNumber] = useState<string>('');
  const [driverLicense, setDriverLicense] = useState<string>('');
  const [shippingWeight, setShippingWeight] = useState<string>('');
  const [deliveryWeight, setDeliveryWeight] = useState<string>('');

  // Load record data when recordId changes
  useEffect(() => {
    if (recordId !== null) {
      const foundRecord = records.find(r => r.id === recordId);
      if (foundRecord) {
        setRecord(foundRecord);
        setShippingDate(foundRecord.shippingDate);
        setDepartureDate(foundRecord.departureDate);
        setArrivalDate(foundRecord.arrivalDate);
        setCargoName(foundRecord.cargoName);
        setDriver(foundRecord.driver);
        setCarNumber(foundRecord.carNumber);
        setDriverLicense(foundRecord.driverLicense);
        setShippingWeight(foundRecord.shippingWeight.toString());
        setDeliveryWeight(foundRecord.deliveryWeight.toString());
      }
    } else {
      setRecord(null);
    }
  }, [recordId, records]);

  if (!isOpen || recordId === null || record === null) return null;

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

    // Update the record
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

    setIsEditing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {isEditing ? 'Редактировать запись' : 'Просмотреть запись'}
          </h2>
          <button 
            onClick={() => {
              if (isEditing) {
                // Reset form to original values
                setShippingDate(record.shippingDate);
                setDepartureDate(record.departureDate);
                setArrivalDate(record.arrivalDate);
                setCargoName(record.cargoName);
                setDriver(record.driver);
                setCarNumber(record.carNumber);
                setDriverLicense(record.driverLicense);
                setShippingWeight(record.shippingWeight.toString());
                setDeliveryWeight(record.deliveryWeight.toString());
                setIsEditing(false);
              }
              onClose();
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {isEditing ? (
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
                onClick={() => {
                  // Reset form to original values
                  setShippingDate(record.shippingDate);
                  setDepartureDate(record.departureDate);
                  setArrivalDate(record.arrivalDate);
                  setCargoName(record.cargoName);
                  setDriver(record.driver);
                  setCarNumber(record.carNumber);
                  setDriverLicense(record.driverLicense);
                  setShippingWeight(record.shippingWeight.toString());
                  setDeliveryWeight(record.deliveryWeight.toString());
                  setIsEditing(false);
                  onClose();
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Сохранить
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Дата отгрузки</label>
                <p className="p-2 border border-gray-200 rounded-md bg-gray-50">{record.shippingDate}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Дата выезда</label>
                <p className="p-2 border border-gray-200 rounded-md bg-gray-50">{record.departureDate}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Дата прибытия</label>
                <p className="p-2 border border-gray-200 rounded-md bg-gray-50">{record.arrivalDate}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Наименование груза</label>
                <p className="p-2 border border-gray-200 rounded-md bg-gray-50">{record.cargoName}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Водитель</label>
                <p className="p-2 border border-gray-200 rounded-md bg-gray-50">{record.driver}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Номер автомобиля</label>
                <p className="p-2 border border-gray-200 rounded-md bg-gray-50">{record.carNumber}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Номер водительского удостоверения</label>
                <p className="p-2 border border-gray-200 rounded-md bg-gray-50">{record.driverLicense}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Вес при отправке</label>
                <p className="p-2 border border-gray-200 rounded-md bg-gray-50">{record.shippingWeight} кг</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Вес при отгрузке</label>
                <p className="p-2 border border-gray-200 rounded-md bg-gray-50">{record.deliveryWeight} кг</p>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Редактировать
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewEditTransportRecordModal;