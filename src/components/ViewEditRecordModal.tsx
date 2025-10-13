import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import GenericViewEditModal from './GenericViewEditModal';

// We'll use the type from the store instead of defining it locally
import { AppCorrespondentRecord as CorrespondentRecord } from '../store/useStore';

interface ViewEditRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordId: number | string | null;
}

const ViewEditRecordModal: React.FC<ViewEditRecordModalProps> = ({ isOpen, onClose, recordId }) => {
  const correspondentData = useStore((state) => state.correspondentData);
  const updateCorrespondentRecord = useStore((state) => state.updateCorrespondentRecord);
  const addCorrespondentRecord = useStore((state) => state.addCorrespondentRecord);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const renderViewMode = (record: CorrespondentRecord) => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Дата</label>
          <div className="p-2 bg-gray-100 rounded-md">{record.date}</div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Входящий номер</label>
          <div className="p-2 bg-gray-100 rounded-md">{record.incomingNumber}</div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Тема обращения</label>
          <div className="p-2 bg-gray-100 rounded-md">{record.subject}</div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Исходящий номер</label>
          <div className="p-2 bg-gray-100 rounded-md">{record.outgoingNumber}</div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">От кого</label>
          <div className="p-2 bg-gray-100 rounded-md">{record.from}</div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Кому</label>
          <div className="p-2 bg-gray-100 rounded-md">{record.to}</div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Подписан</label>
          <div className="p-2 bg-gray-100 rounded-md">{record.signedBy}</div>
        </div>
      </div>
    </div>
  );

  const renderEditMode = (
    record: CorrespondentRecord,
    formData: Partial<CorrespondentRecord>,
    handleChange: (field: keyof CorrespondentRecord, value: any) => void
  ) => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Дата</label>
          <input
            type="date"
            name="date"
            value={formData.date || ''}
            onChange={(e) => handleChange('date', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Входящий номер</label>
          <input
            type="text"
            name="incomingNumber"
            value={formData.incomingNumber || ''}
            onChange={(e) => handleChange('incomingNumber', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Тема обращения</label>
          <input
            type="text"
            name="subject"
            value={formData.subject || ''}
            onChange={(e) => handleChange('subject', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Исходящий номер</label>
          <input
            type="text"
            name="outgoingNumber"
            value={formData.outgoingNumber || ''}
            onChange={(e) => handleChange('outgoingNumber', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">От кого</label>
          <input
            type="text"
            name="from"
            value={formData.from || ''}
            onChange={(e) => handleChange('from', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Кому</label>
          <input
            type="text"
            name="to"
            value={formData.to || ''}
            onChange={(e) => handleChange('to', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Подписан</label>
          <input
            type="text"
            name="signedBy"
            value={formData.signedBy || ''}
            onChange={(e) => handleChange('signedBy', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );

  // Handle updates (for both existing records and new records)
  const handleUpdate = async (id: number | string, updatedRecord: Partial<CorrespondentRecord>) => {
    setSubmitting(true);
    setError(null);
    
    try {
      if (id === -1 || recordId === null) {
        // Creating a new record (indicated by id = -1 from GenericViewEditModal or recordId is null)
        await addCorrespondentRecord(updatedRecord as Omit<CorrespondentRecord, 'id' | 'id'>);
      } else {
        // Updating an existing record
        await updateCorrespondentRecord(id, updatedRecord);
      }
      
      onClose(); // Close modal after successful update
    } catch (error) {
      console.error('Error updating correspondent record:', error);
      setError((error as Error).message || 'Ошибка при сохранении записи');
      throw error; // Re-throw to be handled by GenericViewEditModal
    } finally {
      setSubmitting(false);
    }
  };

  // Pre-populate date field with current date when creating new record
  const preProcessFormData = (record: CorrespondentRecord | null, formData: Partial<CorrespondentRecord>) => {
    if (recordId === null && !formData.date) {
      // If creating a new record and date is not set, set it to current date
      return {
        ...formData,
        date: new Date().toISOString().split('T')[0] // Format as YYYY-MM-DD
      };
    }
    return formData;
  };

  return (
    <div>
      {error && (
        <div className="text-red-500 text-sm py-2">
          {error}
        </div>
      )}
      <GenericViewEditModal<CorrespondentRecord>
        isOpen={isOpen}
        onClose={onClose}
        recordId={recordId}
        records={correspondentData}
        onUpdate={handleUpdate}
        renderViewMode={renderViewMode}
        renderEditMode={renderEditMode}
        title="Детали корреспондентской записи"
        preProcessFormData={preProcessFormData}
      />
    </div>
  );
};

export default ViewEditRecordModal;