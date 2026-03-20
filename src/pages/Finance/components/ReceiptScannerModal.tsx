import React, { useState, useRef } from 'react';
import Modal from '../../../components/Modal';
import Button from '../../../components/Button';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { useStore } from '../../../store/useStore';
import { resizeImage } from '../../../utils/imageUtils';
import { scanReceiptFromImage, getRemainingScans, ScanResultItem } from '../../../firebase/services/receiptService';
import { addToQueue } from '../../../utils/receiptQueue';
import useOnlineStatus from '../../../hooks/useOnlineStatus';
import useIsMobile from '../../../hooks/useIsMobile';
import { formatCurrencyWithSeparators } from '../../../utils/formatUtils';
import { FiTrash2, FiPlus } from 'react-icons/fi';

const TrashIcon = FiTrash2 as React.FC<React.SVGProps<SVGSVGElement>>;
const PlusIcon = FiPlus as React.FC<React.SVGProps<SVGSVGElement>>;

type Phase = 'CAPTURE' | 'PROCESSING' | 'REVIEW' | 'QUEUED';

interface ReviewItem extends ScanResultItem {
  id: string;
  classification: string;
}

interface ReceiptScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemsReady: (items: ReviewItem[], date: string, comment: string) => void;
  onQueueUpdated?: () => void;
}

const ReceiptScannerModal: React.FC<ReceiptScannerModalProps> = ({
  isOpen,
  onClose,
  onItemsReady,
  onQueueUpdated,
}) => {
  const categories = useStore((state) => state.categories);
  const isOnline = useOnlineStatus();
  const isMobile = useIsMobile();

  const [phase, setPhase] = useState<Phase>('CAPTURE');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [date, setDate] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [imageReady, setImageReady] = useState(false);
  const [processingStep, setProcessingStep] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageDataRef = useRef<{ base64: string; mimeType: string } | null>(null);

  const resetState = () => {
    setPhase('CAPTURE');
    setPreviewUrl(null);
    setItems([]);
    setDate('');
    setComment('');
    setError(null);
    setImageReady(false);
    imageDataRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setPreviewUrl(URL.createObjectURL(file));

    try {
      const resized = await resizeImage(file);
      imageDataRef.current = resized;
      setImageReady(true);
    } catch {
      setError('Не удалось обработать изображение');
      setImageReady(false);
    }
  };

  const handleScan = async () => {
    if (!imageDataRef.current) return;

    const { base64, mimeType } = imageDataRef.current;

    if (!isOnline) {
      // Queue for later
      try {
        await addToQueue(base64, mimeType);
        onQueueUpdated?.();
        setPhase('QUEUED');
      } catch {
        setError('Не удалось сохранить чек в очередь');
      }
      return;
    }

    setPhase('PROCESSING');
    try {
      setProcessingStep('Распознавание текста (OCR)...');
      const result = await scanReceiptFromImage(base64, mimeType, (step) => setProcessingStep(step));
      const reviewItems: ReviewItem[] = result.items.map((item, i) => ({
        ...item,
        id: `${Date.now()}-${i}`,
        classification: '',
      }));
      setItems(reviewItems);
      setDate(result.date || new Date().toISOString().split('T')[0]);
      setComment(result.storeName ? `Магазин: ${result.storeName}` : '');
      setPhase('REVIEW');
    } catch (err: any) {
      setError(err?.message || 'Ошибка при сканировании чека');
      setPhase('CAPTURE');
    }
  };

  const updateItem = (id: string, field: keyof ReviewItem, value: string | number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        if (field === 'price' || field === 'quantity') {
          updated.total = parseFloat(((Number(updated.price) || 0) * (Number(updated.quantity) || 0)).toFixed(2));
        }
        return updated;
      })
    );
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { id: Date.now().toString(), name: '', price: 0, quantity: 1, total: 0, classification: '' },
    ]);
  };

  const handleConfirm = () => {
    // Validate all items have classification
    const missing = items.some((item) => !item.classification);
    if (missing) {
      setError('Выберите категорию для всех позиций');
      return;
    }
    onItemsReady(items, date, comment);
    handleClose();
  };

  const expenseCategories = categories
    .filter((c) => c.type === 'expense')
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Сканирование чека" size="lg">
      {/* CAPTURE phase */}
      {phase === 'CAPTURE' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Сфотографируйте чек или выберите изображение из галереи
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
              Осталось: {getRemainingScans()}/14
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 dark:text-gray-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-medium
              file:bg-blue-50 file:text-blue-700
              dark:file:bg-blue-900/30 dark:file:text-blue-400
              hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50
              cursor-pointer"
          />

          {previewUrl && (
            <div className="mt-3">
              <img
                src={previewUrl}
                alt="Превью чека"
                className="max-h-64 rounded-lg border border-gray-200 dark:border-gray-700 mx-auto"
              />
            </div>
          )}

          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
          )}

          <div className="flex justify-end space-x-3 pt-2">
            <Button variant="secondary" onClick={handleClose}>
              Отмена
            </Button>
            <Button
              variant="primary"
              onClick={handleScan}
              disabled={!imageReady}
            >
              {isOnline ? 'Сканировать' : 'Сохранить в очередь'}
            </Button>
          </div>
        </div>
      )}

      {/* PROCESSING phase */}
      {phase === 'PROCESSING' && (
        <LoadingSpinner message={processingStep || 'Обработка...'} />
      )}

      {/* REVIEW phase */}
      {phase === 'REVIEW' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Дата</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Комментарий</label>
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
                placeholder="Комментарий"
              />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Товары ({items.length})
            </h4>
            <button
              type="button"
              onClick={addItem}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium flex items-center"
            >
              <PlusIcon className="mr-1" /> Добавить
            </button>
          </div>

          <div className="space-y-3 max-h-[40vh] overflow-y-auto">
            {items.map((item) => (
              <div
                key={item.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 relative"
              >
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}

                <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Название</label>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                      className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Категория</label>
                    <select
                      value={item.classification}
                      onChange={(e) => updateItem(item.id, 'classification', e.target.value)}
                      className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
                    >
                      <option value="">Выберите категорию</option>
                      {expenseCategories.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Цена</label>
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                      className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Кол-во</label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Сумма</label>
                      <input
                        type="text"
                        value={formatCurrencyWithSeparators(item.total.toString())}
                        readOnly
                        className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md bg-gray-100 dark:bg-gray-600"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
          )}

          <div className="flex justify-end space-x-3 pt-2">
            <Button variant="secondary" onClick={handleClose}>
              Отмена
            </Button>
            <Button variant="primary" onClick={handleConfirm}>
              Подтвердить
            </Button>
          </div>
        </div>
      )}

      {/* QUEUED phase */}
      {phase === 'QUEUED' && (
        <div className="space-y-4 text-center py-6">
          <div className="text-4xl mb-2">📥</div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-white">
            Чек сохранён в очередь
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Чек будет обработан автоматически при подключении к интернету
          </p>
          <div className="pt-2">
            <Button variant="primary" onClick={handleClose}>
              Закрыть
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ReceiptScannerModal;
