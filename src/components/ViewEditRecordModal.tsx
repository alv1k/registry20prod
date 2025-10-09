import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import Modal from './Modal';

interface ViewEditRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordId: number | null;
}

const ViewEditRecordModal: React.FC<ViewEditRecordModalProps> = ({ isOpen, onClose, recordId }) => {
  const correspondentData = useStore((state) => state.correspondentData);
  const updateCorrespondentRecord = useStore((state) => state.updateCorrespondentRecord);
  
  const record = correspondentData.find(r => r.id === recordId);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    date: record?.date || '',
    incomingNumber: record?.incomingNumber || '',
    subject: record?.subject || '',
    outgoingNumber: record?.outgoingNumber || '',
    from: record?.from || '',
    to: record?.to || '',
    signedBy: record?.signedBy || ''
  });

  React.useEffect(() => {
    if (record) {
      setFormData({
        date: record.date || '',
        incomingNumber: record.incomingNumber || '',
        subject: record.subject || '',
        outgoingNumber: record.outgoingNumber || '',
        from: record.from || '',
        to: record.to || '',
        signedBy: record.signedBy || ''
      });
    }
  }, [record]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    if (recordId) {
      updateCorrespondentRecord(recordId, formData);
      setIsEditing(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!record) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Детали записи">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Дата</label>
            {isEditing ? (
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
              />
            ) : (
              <div className="p-2 bg-gray-100 rounded-md">{formData.date}</div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Входящий номер</label>
            {isEditing ? (
              <input
                type="text"
                name="incomingNumber"
                value={formData.incomingNumber}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
              />
            ) : (
              <div className="p-2 bg-gray-100 rounded-md">{formData.incomingNumber}</div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Тема обращения</label>
            {isEditing ? (
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
              />
            ) : (
              <div className="p-2 bg-gray-100 rounded-md">{formData.subject}</div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Исходящий номер</label>
            {isEditing ? (
              <input
                type="text"
                name="outgoingNumber"
                value={formData.outgoingNumber}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
              />
            ) : (
              <div className="p-2 bg-gray-100 rounded-md">{formData.outgoingNumber}</div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">От кого</label>
            {isEditing ? (
              <input
                type="text"
                name="from"
                value={formData.from}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
              />
            ) : (
              <div className="p-2 bg-gray-100 rounded-md">{formData.from}</div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Кому</label>
            {isEditing ? (
              <input
                type="text"
                name="to"
                value={formData.to}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
              />
            ) : (
              <div className="p-2 bg-gray-100 rounded-md">{formData.to}</div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Подписан</label>
            {isEditing ? (
              <input
                type="text"
                name="signedBy"
                value={formData.signedBy}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
              />
            ) : (
              <div className="p-2 bg-gray-100 rounded-md">{formData.signedBy}</div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Закрыть
          </button>
          <button
            type="button"
            onClick={handleEditToggle}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            {isEditing ? 'Отмена' : 'Редактировать'}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Сохранить
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ViewEditRecordModal;