import React, { useState, useEffect } from 'react';
import { useStore } from '../../../store/useStore';
import Modal from '../../../components/Modal';
import Button from '../../../components/Button';
import { formatCurrencyWithSeparators } from '../../../utils/formatUtils';

interface FinanceRecord {
  id: number | string;
  date: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
  classification: string;
  comment: string;
}

interface FinanceItem {
  id: string; // unique id for each item in the form
  name: string;
  price: string;
  quantity: string;
  classification: string;
  total: number;
}

interface FinanceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordId?: number | string | null;
  onAdd: (record: Omit<FinanceRecord, 'id'>) => void | Promise<void>;
  onUpdate: (id: number | string, updatedRecord: Partial<FinanceRecord>) => void | Promise<void>;
}

const FinanceModal: React.FC<FinanceFormModalProps> = ({
  isOpen,
  onClose,
  recordId,
  onAdd,
  onUpdate
}) => {
  const financeData = useStore((state) => state.financeData);
  const categories = useStore((state) => state.categories);
  const syncCategories = useStore((state) => state.syncCategories);
  const addFinanceRecord = useStore((state) => state.addFinanceRecord);
  const updateFinanceRecord = useStore((state) => state.updateFinanceRecord);

  const [date, setDate] = useState<string>('');
  const [items, setItems] = useState<FinanceItem[]>([
    { id: Date.now().toString(), name: '', price: '', quantity: '', classification: '', total: 0 }
  ]);
  const [comment, setComment] = useState<string>('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  useEffect(() => {
    // Load categories when modal opens
    if (isOpen) {
      syncCategories().catch(error => {
        console.error('Error loading categories:', error);
      });
    }
  }, [isOpen, syncCategories]);

  const [submitting, setSubmitting] = useState(false);

  // Calculate total for a specific item
  const calculateItemTotal = (price: string, quantity: string): number => {
    const priceNum = parseFloat(price) || 0;
    const quantityNum = parseFloat(quantity) || 0;
    return parseFloat((priceNum * quantityNum).toFixed(2));
  };

  // Populate form with existing data when editing
  useEffect(() => {
    if (recordId && isOpen) {
      const existingRecord = financeData.find(record =>
        record.id === recordId
      );
      if (existingRecord) {
        setDate(existingRecord.date);
        setItems([{
          id: Date.now().toString(),
          name: existingRecord.name,
          price: existingRecord.price.toString(),
          quantity: existingRecord.quantity.toString(),
          classification: existingRecord.classification,
          total: existingRecord.total
        }]);
        setComment(existingRecord.comment);
      }
    } else if (isOpen) {
      // Reset form for new records
      const today = new Date().toISOString().split('T')[0];
      setDate(today);
      setItems([{ id: Date.now().toString(), name: '', price: '', quantity: '', classification: '', total: 0 }]);
      setComment('');
    }
  }, [recordId, isOpen, financeData]);

  // Add a new empty item to the list
  const addItem = () => {
    setItems([...items, {
      id: Date.now().toString(),
      name: '',
      price: '',
      quantity: '',
      classification: '',
      total: 0
    }]);
  };

  // Remove an item from the list
  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  // Update a specific item's field
  const updateItemField = (id: string, field: keyof FinanceItem, value: string) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };

        // Calculate total when price or quantity changes
        if (field === 'price' || field === 'quantity') {
          updatedItem.total = calculateItemTotal(updatedItem.price, updatedItem.quantity);
        }

        return updatedItem;
      }
      return item;
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields for each item
    for (const item of items) {
      if (!item.name || !item.price || !item.quantity || !item.classification) {
        alert('Пожалуйста, заполните все обязательные поля для всех наименований');
        return;
      }

      const priceNum = parseFloat(item.price);
      const quantityNum = parseFloat(item.quantity);

      if (isNaN(priceNum) || isNaN(quantityNum) || priceNum <= 0 || quantityNum <= 0) {
        alert('Цена и количество должны быть числовыми значениями больше 0');
        return;
      }
    }

    setSubmitting(true);

    try {
      if (recordId) {
        // For editing an existing record, we'll update the first item only
        // Note: This is for backward compatibility when editing a single record
        const firstItem = items[0];
        const priceNum = parseFloat(firstItem.price);
        const quantityNum = parseFloat(firstItem.quantity);
        const totalNum = calculateItemTotal(firstItem.price, firstItem.quantity);

        await updateFinanceRecord(recordId, {
          date,
          name: firstItem.name,
          price: priceNum,
          quantity: quantityNum,
          total: totalNum,
          classification: firstItem.classification,
          comment
        });
      } else {
        // Add each item individually to the database
        for (const item of items) {
          const priceNum = parseFloat(item.price);
          const quantityNum = parseFloat(item.quantity);
          const totalNum = calculateItemTotal(item.price, item.quantity);

          await addFinanceRecord({
            date,
            name: item.name,
            price: priceNum,
            quantity: quantityNum,
            total: totalNum,
            classification: item.classification,
            comment
          });
        }
      }

      onClose();
    } catch (error) {
      console.error('Error saving finance record:', error);
      alert('Ошибка при сохранении записи: ' + (error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={recordId ? "Редактировать финансовую запись" : "Добавить финансовую запись"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Дата *</label>
            <input
              type="date"
              name="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              onFocus={(e) => setFocusedInput(e.target.name)}
              onBlur={() => setFocusedInput(null)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
              required
            />
          </div>

          <div className="md:col-span-2">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Наименование *</label>
              {!recordId && (
                <button
                  type="button"
                  onClick={addItem}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  + Добавить наименование
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Items list */}
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-4 relative">
              {!recordId && items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  aria-label="Удалить наименование"
                >
                  ×
                </button>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Название *
                  </label>
                  <input
                    type="text"
                    name={`name-${index}`}
                    value={item.name}
                    onChange={(e) => updateItemField(item.id, 'name', e.target.value)}
                    onFocus={(e) => setFocusedInput(e.target.name)}
                    onBlur={() => setFocusedInput(null)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
                    placeholder="Название товара/услуги"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Категория *
                  </label>
                  <select
                    name={`classification-${index}`}
                    value={item.classification}
                    onChange={(e) => updateItemField(item.id, 'classification', e.target.value)}
                    onFocus={(e) => setFocusedInput(e.target.name)}
                    onBlur={() => setFocusedInput(null)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
                    required
                  >
                    <option value="">Выберите категорию</option>
                    {categories
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .filter((a) => a.type === 'expense')
                      .map((category) => (
                        <option key={`${category.id}-${item.id}`} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Цена *
                  </label>
                  <input
                    type="number"
                    name={`price-${index}`}
                    value={item.price}
                    onChange={(e) => updateItemField(item.id, 'price', e.target.value)}
                    onFocus={(e) => setFocusedInput(e.target.name)}
                    onBlur={() => setFocusedInput(null)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
                    placeholder="Цена за единицу"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Кол-во *
                  </label>
                  <input
                    type="number"
                    name={`quantity-${index}`}
                    value={item.quantity}
                    onChange={(e) => updateItemField(item.id, 'quantity', e.target.value)}
                    onFocus={(e) => setFocusedInput(e.target.name)}
                    onBlur={() => setFocusedInput(null)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
                    placeholder="Количество"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Сумма
                  </label>
                  <input
                    type="text"
                    name={`total-${index}`}
                    value={formatCurrencyWithSeparators(item.total.toString())}
                    readOnly
                    className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                    placeholder="Сумма"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Комментарий</label>
          <textarea
            name="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onFocus={(e) => setFocusedInput(e.target.name)}
            onBlur={() => setFocusedInput(null)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
            placeholder="Комментарий"
            rows={3}
          />
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

export default FinanceModal;