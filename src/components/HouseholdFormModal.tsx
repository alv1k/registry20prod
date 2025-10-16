import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { AppHouseholdRecord } from '../store/useStore';

interface HouseholdFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordId?: number | string | null;
  onAdd?: (record: Omit<AppHouseholdRecord, 'id'>) => void;
  onUpdate?: (id: number | string, updatedRecord: Partial<AppHouseholdRecord>) => void;
}

const HouseholdFormModal: React.FC<HouseholdFormModalProps> = ({
  isOpen,
  onClose,
  recordId,
  onAdd,
  onUpdate
}) => {
  const [formData, setFormData] = useState<Omit<AppHouseholdRecord, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    description: '',
    area: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const householdData = useStore((state) => state.householdData);
  const addHouseholdRecord = useStore((state) => state.addHouseholdRecord);
  const updateHouseholdRecord = useStore((state) => state.updateHouseholdRecord);

  // If editing an existing record, populate form with existing data
  useEffect(() => {
    if (recordId && householdData.length > 0) {
      const existingRecord = householdData.find(record => record.id === recordId);
      if (existingRecord) {
        setFormData({
          date: existingRecord.date,
          description: existingRecord.description,
          area: existingRecord.area
        });
      }
    } else {
      // Reset form for new record
      setFormData({
        date: new Date().toISOString().split('T')[0],
        description: '',
        area: ''
      });
    }
  }, [recordId, householdData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.date) {
      newErrors.date = 'Дата обязательна';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Описание обязательно';
    }

    if (!formData.area.trim()) {
      newErrors.area = 'Область обязательна';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (recordId) {
        // Update existing record
        await updateHouseholdRecord(recordId, formData);
        if (onUpdate) {
          onUpdate(recordId, formData);
        }
      } else {
        // Add new record
        await addHouseholdRecord(formData);
        if (onAdd) {
          onAdd(formData);
        }
      }
      onClose();
    } catch (error) {
      console.error('Error saving household record:', error);
      setErrors({ form: 'Ошибка сохранения записи: ' + (error as Error).message });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {recordId ? 'Редактировать запись' : 'Добавить новую запись'}
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Дата
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${errors.date ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Описание
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className={`w-full p-2 border rounded-md ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Область
              </label>
              <input
                type="text"
                name="area"
                value={formData.area}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${errors.area ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Кухня, гостиная и т.д."
              />
              {errors.area && <p className="text-red-500 text-sm mt-1">{errors.area}</p>}
            </div>

            {errors.form && <p className="text-red-500 text-sm mb-4">{errors.form}</p>}

            <div className="flex justify-end space-x-3">
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
                {recordId ? 'Сохранить' : 'Добавить'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HouseholdFormModal;