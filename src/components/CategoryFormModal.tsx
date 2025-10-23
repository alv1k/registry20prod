import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import Modal from './Modal';
import Button from './Button';

interface CategoryRecord {
  id: number | string;
  name: string;
  description?: string;
  type: 'expense' | 'income';
}

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordId?: number | string | null;
  onAdd: (record: Omit<CategoryRecord, 'id'>) => void | Promise<void>;
  onUpdate: (id: number | string, updatedRecord: Partial<CategoryRecord>) => void | Promise<void>;
}

const CategoryFormModal: React.FC<CategoryFormModalProps> = ({ 
  isOpen, 
  onClose, 
  recordId, 
  onAdd,
  onUpdate
}) => {
  const categories = useStore((state) => state.categories);
  const addCategory = useStore((state) => state.addCategory);
  const updateCategory = useStore((state) => state.updateCategory);

  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);

  // Populate form with existing data when editing
  useEffect(() => {
    if (recordId && isOpen) {
      const existingCategory = categories.find(category => 
        category.id === recordId
      );
      if (existingCategory) {
        setName(existingCategory.name);
        setDescription(existingCategory.description || '');
        setType(existingCategory.type);
      }
    } else if (isOpen) {
      // Reset form for new records
      setName('');
      setDescription('');
      setType('expense');
    }
  }, [recordId, isOpen, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!name || !type) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }
    
    setSubmitting(true);
    
    try {
      if (recordId) {
        // Update existing record
        await updateCategory(recordId, {
          name,
          description,
          type
        });
      } else {
        // Add new record
        await addCategory({
          name,
          description,
          type
        });
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Ошибка при сохранении категории: ' + (error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={recordId ? "Редактировать категорию" : "Добавить категорию"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Название *</label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={(e) => setFocusedInput(e.target.name)}
              onBlur={() => setFocusedInput(null)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
              placeholder="Название категории"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Тип *</label>
            <select
              name="type"
              value={type}
              onChange={(e) => setType(e.target.value as 'expense' | 'income')}
              onFocus={(e) => setFocusedInput(e.target.name)}
              onBlur={() => setFocusedInput(null)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
              required
            >
              <option value="expense">Расход</option>
              <option value="income">Доход</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
            <textarea
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onFocus={(e) => setFocusedInput(e.target.name)}
              onBlur={() => setFocusedInput(null)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
              placeholder="Описание категории"
              rows={3}
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <Button
            type="button"
            onClick={onClose}
            disabled={submitting}
            variant="secondary"
          >
            Отмена
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            variant="primary"
          >
            {submitting ? 'Сохранение...' : (recordId ? 'Сохранить изменения' : 'Добавить')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CategoryFormModal;