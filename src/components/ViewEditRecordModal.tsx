import React from 'react';
import { useStore } from '../store/useStore';
import GenericViewEditModal from './GenericViewEditModal';

interface CorrespondentRecord {
  id: number;
  date: string;
  incomingNumber: string;
  subject: string;
  outgoingNumber: string;
  from: string;
  to: string;
  signedBy: string;
}

interface ViewEditRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordId: number | null;
}

const ViewEditRecordModal: React.FC<ViewEditRecordModalProps> = ({ isOpen, onClose, recordId }) => {
  const correspondentData = useStore((state) => state.correspondentData);
  const updateCorrespondentRecord = useStore((state) => state.updateCorrespondentRecord);

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

  const handleUpdate = (id: number, updatedRecord: Partial<CorrespondentRecord>) => {
    updateCorrespondentRecord(id, updatedRecord);
  };

  return (
    <GenericViewEditModal<CorrespondentRecord>
      isOpen={isOpen}
      onClose={onClose}
      recordId={recordId}
      records={correspondentData}
      onUpdate={handleUpdate}
      renderViewMode={renderViewMode}
      renderEditMode={renderEditMode}
      title="Детали корреспондентской записи"
    />
  );
};

export default ViewEditRecordModal;