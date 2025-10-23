import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import Modal from './Modal';
import Button from './Button';

interface PlannedBudgetRecordForm {
  plannedAmount: number;
  classification: string;
  plannedDate: string;
  comment?: string;
}

interface PlannedBudgetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordId?: number | string | null;
  onAdd: (record: PlannedBudgetRecordForm) => void | Promise<void>;
  onUpdate: (id: number | string, updatedRecord: Partial<PlannedBudgetRecordForm>) => void | Promise<void>;
}

const PlannedBudgetFormModal: React.FC<PlannedBudgetFormModalProps> = ({ 
  isOpen, 
  onClose, 
  recordId, 
  onAdd,
  onUpdate
}) => {
  const categories = useStore((state) => state.categories);
  const syncCategories = useStore((state) => state.syncCategories);

  // Remove name state since we're using classification only
  const [plannedAmount, setPlannedAmount] = useState<string>('');
  const [classification, setClassification] = useState<string>('');
  // For planned date, we'll use plannedMonthYear in format YYYY-MM
  const [plannedMonthYear, setPlannedMonthYear] = useState<string>(new Date().toISOString().slice(0, 7)); // Format: YYYY-MM
  const [comment, setComment] = useState<string>('');
  const [actualAmount, setActualAmount] = useState<string>('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Load categories when modal opens
    if (isOpen) {
      syncCategories().catch(error => {
        console.error('Error loading categories:', error);
      });
    }
  }, [isOpen, syncCategories]);

  // Populate form with existing data when editing
  useEffect(() => {
    if (recordId && isOpen) {
      // In a real implementation, you would fetch the specific record
      // For now, we'll just clear the form for new records
    } else if (isOpen) {
      // Reset form for new records
      setPlannedAmount('');
      setClassification('');
      setPlannedMonthYear(new Date().toISOString().slice(0, 7)); // Format: YYYY-MM
      setComment('');
      setActualAmount('');
    }
  }, [recordId, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!plannedAmount || !classification || !plannedMonthYear) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }
    
    const plannedAmountNum = parseFloat(plannedAmount);
    const actualAmountNum = actualAmount ? parseFloat(actualAmount) : undefined;
    
    if (isNaN(plannedAmountNum)) {
      alert('Запланированная сумма должна быть числовым значением');
      return;
    }
    
    if (actualAmount && isNaN(actualAmountNum!)) {
      alert('Фактическая сумма должна быть числовым значением');
      return;
    }
    
    setSubmitting(true);
    
    try {
      if (recordId) {
        // Update existing record
        await onUpdate(recordId, {
          plannedAmount: plannedAmountNum,
          classification,
          plannedDate: `${plannedMonthYear}-01`, // Convert YYYY-MM to first day of the month
          comment: comment || ''
        });
      } else {
        // Add new record
        await onAdd({
          plannedAmount: plannedAmountNum,
          classification,
          plannedDate: `${plannedMonthYear}-01`, // Convert YYYY-MM to first day of the month
          comment: comment || ''
        });
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving planned budget record:', error);
      alert('Ошибка при сохранении записи: ' + (error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={recordId ? "Редактировать запланированный бюджет" : "Добавить запланированный бюджет"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Запланированная сумма *</label>
            <input
              type="number"
              name="plannedAmount"
              value={plannedAmount}
              onChange={(e) => setPlannedAmount(e.target.value)}
              onFocus={(e) => setFocusedInput(e.target.name)}
              onBlur={() => setFocusedInput(null)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
              placeholder="Запланированная сумма"
              min="0"
              step="0.01"
              required
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
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Планируемый месяц/год *</label>
            <select
              name="plannedMonthYear"
              value={plannedMonthYear}
              onChange={(e) => setPlannedMonthYear(e.target.value)}
              onFocus={(e) => setFocusedInput(e.target.name)}
              onBlur={() => setFocusedInput(null)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
              required
            >
              {Array.from({length: 24}, (_, i) => {
                const date = new Date();
                date.setMonth(date.getMonth() - 11 + i); // Last 11 months + next 12 months
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const monthName = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'][date.getMonth()];
                return (
                  <option key={`${year}-${month}`} value={`${year}-${month}`}>
                    {monthName} {year}
                  </option>
                );
              })}
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

export default PlannedBudgetFormModal;