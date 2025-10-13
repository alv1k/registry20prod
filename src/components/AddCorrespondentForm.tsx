import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import Modal from './Modal';

interface AddCorrespondentFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddCorrespondentForm: React.FC<AddCorrespondentFormProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0], // Установить текущую дату по умолчанию
    incomingNumber: '',
    subject: '',
    outgoingNumber: '',
    from: '',
    to: '',
    signedBy: ''
  });
  
  const addCorrespondentRecord = useStore((state) => state.addCorrespondentRecord);
  const isLoading = useStore((state) => state.isCorrespondentDataLoading);
  const error = useStore((state) => state.correspondentDataError);

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.date || !formData.incomingNumber || !formData.subject || !formData.from || !formData.to || !formData.signedBy) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }
    
    setSubmitting(true);
    
    try {
      await addCorrespondentRecord({
        date: formData.date,
        incomingNumber: formData.incomingNumber,
        subject: formData.subject,
        outgoingNumber: formData.outgoingNumber,
        from: formData.from,
        to: formData.to,
        signedBy: formData.signedBy
      });
      
      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0], // Reset to current date
        incomingNumber: '',
        subject: '',
        outgoingNumber: '',
        from: '',
        to: '',
        signedBy: ''
      });
      
      onClose();
    } catch (error) {
      console.error('Error adding correspondent record:', error);
      alert('Ошибка при добавлении записи: ' + (error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Добавить запись в корреспондентский журнал">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Дата *</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Входящий номер *</label>
            <input
              type="text"
              name="incomingNumber"
              value={formData.incomingNumber}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
              placeholder="Например: ВХ-2023-001"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Тема обращения *</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
              placeholder="Тема обращения"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Исходящий номер</label>
            <input
              type="text"
              name="outgoingNumber"
              value={formData.outgoingNumber}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
              placeholder="Например: ИСХ-2023-001"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">От кого *</label>
            <input
              type="text"
              name="from"
              value={formData.from}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
              placeholder="Организация или лицо"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Кому *</label>
            <input
              type="text"
              name="to"
              value={formData.to}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
              placeholder="Организация или лицо"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Подписан *</label>
            <input
              type="text"
              name="signedBy"
              value={formData.signedBy}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
              placeholder="ФИО подписанта"
              required
            />
          </div>
        </div>
        
        {error && (
          <div className="text-red-500 text-sm py-2">
            {error}
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={submitting || isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {submitting ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddCorrespondentForm;