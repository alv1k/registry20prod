import { useState, useEffect } from 'react';
import GenericViewEditModal from './GenericViewEditModal';

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
  recordId: number | string | null; // Support both number and string IDs
  onUpdate: (id: number | string, updatedRecord: Partial<TransportRecord>) => void | Promise<void>; // Match GenericViewEditModal signature
  records: TransportRecord[];
}

const ViewEditTransportRecordModal: React.FC<ViewEditTransportRecordModalProps> = ({ 
  isOpen, 
  onClose, 
  recordId, 
  onUpdate,
  records 
}) => {
  // Define form data type for TransportRecord
  type TransportFormData = Partial<TransportRecord>;

  const renderViewMode = (record: TransportRecord) => (
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
  );

  const renderEditMode = (
    record: TransportRecord, 
    formData: TransportFormData, 
    handleChange: (field: keyof TransportRecord, value: any) => void
  ) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Дата отгрузки *</label>
        <input
          type="date"
          value={formData.shippingDate || ''}
          onChange={(e) => handleChange('shippingDate', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Дата выезда *</label>
        <input
          type="date"
          value={formData.departureDate || ''}
          onChange={(e) => handleChange('departureDate', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Дата прибытия *</label>
        <input
          type="date"
          value={formData.arrivalDate || ''}
          onChange={(e) => handleChange('arrivalDate', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Наименование груза *</label>
        <input
          type="text"
          value={formData.cargoName || ''}
          onChange={(e) => handleChange('cargoName', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
          placeholder="Наименование груза"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Водитель *</label>
        <input
          type="text"
          value={formData.driver || ''}
          onChange={(e) => handleChange('driver', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
          placeholder="ФИО водителя"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Номер автомобиля *</label>
        <input
          type="text"
          value={formData.carNumber || ''}
          onChange={(e) => handleChange('carNumber', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
          placeholder="Номер автомобиля"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Номер водительского удостоверения *</label>
        <input
          type="text"
          value={formData.driverLicense || ''}
          onChange={(e) => handleChange('driverLicense', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
          placeholder="Номер ВУ"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Вес при отправке *</label>
        <input
          type="number"
          value={formData.shippingWeight || ''}
          onChange={(e) => handleChange('shippingWeight', parseFloat(e.target.value) || 0)}
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
          value={formData.deliveryWeight || ''}
          onChange={(e) => handleChange('deliveryWeight', parseFloat(e.target.value) || 0)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
          placeholder="Вес при отгрузке (кг)"
          min="0"
          required
        />
      </div>
    </div>
  );

  return (
    <GenericViewEditModal<TransportRecord>
      isOpen={isOpen}
      onClose={onClose}
      recordId={recordId}
      records={records}
      onUpdate={onUpdate}
      renderViewMode={renderViewMode}
      renderEditMode={renderEditMode}
      title="Детали транспортной записи"
    />
  );
};

export default ViewEditTransportRecordModal;