import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal';
import Button from '../../../components/Button';

interface PeriodEvent {
  id?: string | number;
  date: string;
  description?: string;
  category?: string;
}

interface PeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: PeriodEvent) => Promise<void>;
  onDelete: (id: string | number) => Promise<void>;
  event?: PeriodEvent | null;
  categoryList?: string[];
}

// Define default period categories if none provided
const DEFAULT_PERIOD_CATEGORIES = [
  'Менструация',
  'Овуляция',
  'Предменструальный синдром',
  'Базальная температура',
  'Другое'
];

// Define category colors
const CATEGORY_COLORS: { [key: string]: string } = {
  'Менструация': 'bg-red-500',
  'Овуляция': 'bg-blue-500',
  'Предменструальный синдром': 'bg-yellow-500',
  'Базальная температура': 'bg-green-500',
  'Другое': 'bg-gray-500'
};

// Function to get color class for a category
const getCategoryColor = (category: string, categoryList?: string[]): string => {
  // If categoryList is provided, try to match colors based on position or name
  if (categoryList && categoryList.length > 0) {
    // Check if this category exists in the provided list
    const index = categoryList.indexOf(category);
    if (index !== -1) {
      // If we have a color for this category specifically, use it
      if (CATEGORY_COLORS[category]) {
        return CATEGORY_COLORS[category];
      }
      // Otherwise, we can assign colors based on position if needed
      // For now, just return a default color
      return 'bg-purple-500';
    }
  }

  // Use default color mapping if available
  return CATEGORY_COLORS[category] || 'bg-gray-500';
};

const PeriodModal: React.FC<PeriodModalProps> = ({ isOpen, onClose, onSave, onDelete, event, categoryList }) => {
  const [date, setDate] = useState(event?.date || new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState(event?.description || '');
  const [category, setCategory] = useState('');

  // Reset form when modal opens or when event changes
  useEffect(() => {
    if (isOpen) {
      setDate(event?.date || new Date().toISOString().split('T')[0]);
      setDescription(event?.description || '');
      if (event?.category) {
        setCategory(event.category);
      } else if (categoryList && categoryList.length > 0) {
        setCategory(categoryList[0]);
      } else {
        setCategory(DEFAULT_PERIOD_CATEGORIES[0]);
      }
    }
  }, [isOpen, event, categoryList]);
  const [isSaving, setIsSaving] = useState(false);

  // Get the actual category list to use (either provided or default)
  const actualCategoryList = categoryList && categoryList.length > 0 ? categoryList : DEFAULT_PERIOD_CATEGORIES;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newEvent: PeriodEvent = {
      id: event?.id,
      date,
      description,
      category
    };

    setIsSaving(true);
    try {
      await onSave(newEvent);
      onClose();
    } catch (error) {
      console.error('Error saving period event:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    // Reset form state when closing
    setDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    setCategory(actualCategoryList[0] || DEFAULT_PERIOD_CATEGORIES[0]);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={event ? "Редактировать событие" : "Добавить событие"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 mt-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Дата *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Категория
            </label>
            <div className="flex items-center space-x-2">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                {actualCategoryList.map((cat, index) => (
                  <option key={index} value={cat} className="dark:bg-gray-700 dark:text-white">{cat}</option>
                ))}
              </select>
              <div
                className={`w-6 h-6 rounded-full ${getCategoryColor(category, categoryList)} border border-gray-300 dark:border-gray-500`}
                title={`Цвет категории: ${category}`}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Описание
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Описание события"
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-between mt-6">
          {event?.id && (
            <Button
              type="button"
              onClick={async () => {
                if (event?.id && window.confirm('Вы уверены, что хотите удалить это событие?')) {
                  try {
                    await onDelete(event.id);
                    handleClose(); // Reset form after deletion
                  } catch (error) {
                    console.error('Error deleting event:', error);
                  }
                }
              }}
              variant="danger"
              disabled={isSaving}
            >
              Удалить
            </Button>
          )}
          <div className="flex space-x-3 ml-auto">
            <Button
              type="button"
              onClick={handleClose}
              variant="secondary"
              disabled={isSaving}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSaving}
            >
              {isSaving ? 'Сохранение...' : (event ? 'Сохранить' : 'Добавить')}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default PeriodModal;