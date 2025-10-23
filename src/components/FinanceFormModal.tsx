import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import Modal from './Modal';
import { formatCurrencyWithSeparators } from '../utils/formatUtils';

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

interface FinanceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordId?: number | string | null;
  onAdd: (record: Omit<FinanceRecord, 'id'>) => void | Promise<void>;
  onUpdate: (id: number | string, updatedRecord: Partial<FinanceRecord>) => void | Promise<void>;
}

const FinanceFormModal: React.FC<FinanceFormModalProps> = ({ 
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
  const [name, setName] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [classification, setClassification] = useState<string>('');
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

  // Calculate total whenever price or quantity changes
  const calculateTotal = () => {
    const priceNum = parseFloat(price) || 0;
    const quantityNum = parseFloat(quantity) || 0;
    return (priceNum * quantityNum).toFixed(2);
  };

  // Populate form with existing data when editing
  useEffect(() => {
    if (recordId && isOpen) {
      const existingRecord = financeData.find(record => 
        record.id === recordId
      );
      if (existingRecord) {
        setDate(existingRecord.date);
        setName(existingRecord.name);
        setPrice(existingRecord.price.toString());
        setQuantity(existingRecord.quantity.toString());
        setClassification(existingRecord.classification);
        setComment(existingRecord.comment);
      }
    } else if (isOpen) {
      // Reset form for new records
      const today = new Date().toISOString().split('T')[0];
      setDate(today);
      setName('');
      setPrice('');
      setQuantity('');
      setClassification('');
      setComment('');
    }
  }, [recordId, isOpen, financeData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!date || !name || !price || !quantity || !classification) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }
    
    const priceNum = parseFloat(price);
    const quantityNum = parseFloat(quantity);
    const totalNum = parseFloat(calculateTotal());
    
    if (isNaN(priceNum) || isNaN(quantityNum)) {
      alert('Цена и количество должны быть числовыми значениями');
      return;
    }
    
    setSubmitting(true);
    
    try {
      if (recordId) {
        // Update existing record
        await updateFinanceRecord(recordId, {
          date,
          name,
          price: priceNum,
          quantity: quantityNum,
          total: totalNum,
          classification,
          comment
        });
      } else {
        // Add new record
        await addFinanceRecord({
          date,
          name,
          price: priceNum,
          quantity: quantityNum,
          total: totalNum,
          classification,
          comment
        });
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
              placeholder="Название товара/услуги"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Цена *</label>
            <input
              type="number"
              name="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Кол-во *</label>
            <input
              type="number"
              name="quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              onFocus={(e) => setFocusedInput(e.target.name)}
              onBlur={() => setFocusedInput(null)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
              placeholder="Количество"
              min="0"
              step="0.1"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Сумма</label>
            <input
              type="text"
              name="total"
              value={formatCurrencyWithSeparators(calculateTotal())}
              readOnly
              className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
              placeholder="Сумма"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Категория *</label>
            <select
              name="classification"
              value={classification}
              onChange={(e) => setClassification(e.target.value)}
              onFocus={(e) => setFocusedInput(e.target.name)}
              onBlur={() => setFocusedInput(null)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
              required
            >
              <option value="">Выберите категорию</option>
              {categories
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
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
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
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
            disabled={submitting}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {submitting ? 'Сохранение...' : (recordId ? 'Сохранить изменения' : 'Добавить')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default FinanceFormModal;