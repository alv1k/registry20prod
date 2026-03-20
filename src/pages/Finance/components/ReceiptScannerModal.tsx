import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import jsQR from 'jsqr';
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
import { FiTrash2, FiPlus, FiCamera } from 'react-icons/fi';

const TrashIcon = FiTrash2 as React.FC<React.SVGProps<SVGSVGElement>>;
const PlusIcon = FiPlus as React.FC<React.SVGProps<SVGSVGElement>>;
const CameraIcon = FiCamera as React.FC<React.SVGProps<SVGSVGElement>>;

type Phase = 'CHOOSE' | 'QR_SCAN' | 'CAPTURE' | 'PROCESSING' | 'REVIEW' | 'QUEUED';

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

  const [phase, setPhase] = useState<Phase>('CHOOSE');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [date, setDate] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [imageReady, setImageReady] = useState(false);
  const [processingStep, setProcessingStep] = useState('');

  const [qrManualText, setQrManualText] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrFileInputRef = useRef<HTMLInputElement>(null);
  const imageDataRef = useRef<{ base64: string; mimeType: string } | null>(null);
  const qrScannerRef = useRef<Html5Qrcode | null>(null);
  const qrContainerRef = useRef<string>('qr-reader-' + Math.random().toString(36).slice(2));

  const stopQrScanner = useCallback(async () => {
    if (qrScannerRef.current) {
      try {
        const state = qrScannerRef.current.getState();
        if (state === 2) { // SCANNING
          await qrScannerRef.current.stop();
        }
      } catch {
        // ignore
      }
      qrScannerRef.current = null;
    }
  }, []);

  const resetState = useCallback(() => {
    setPhase('CHOOSE');
    setPreviewUrl(null);
    setItems([]);
    setDate('');
    setComment('');
    setError(null);
    setImageReady(false);
    setProcessingStep('');
    setQrManualText('');
    setShowManualInput(false);
    imageDataRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (qrFileInputRef.current) qrFileInputRef.current.value = '';
    stopQrScanner();
  }, [stopQrScanner]);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [resetState, onClose]);

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => { stopQrScanner(); };
  }, [stopQrScanner]);

  // Process QR data through our Vercel API
  const processQrData = async (qrText: string) => {
    await stopQrScanner();
    setPhase('PROCESSING');
    setProcessingStep('Проверка чека через ФНС...');

    try {
      const response = await fetch('/api/check-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrraw: qrText }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Ошибка при проверке чека');
      }

      const result = await response.json();

      if (!result.items || result.items.length === 0) {
        throw new Error('Товары не найдены в чеке. Попробуйте сканировать фото.');
      }

      const reviewItems: ReviewItem[] = result.items.map((item: ScanResultItem, i: number) => ({
        ...item,
        id: `${Date.now()}-${i}`,
        classification: '',
      }));

      setItems(reviewItems);
      setDate(result.date || new Date().toISOString().split('T')[0]);
      setComment(result.storeName ? `Магазин: ${result.storeName}` : '');
      setPhase('REVIEW');
    } catch (err: any) {
      setError(err?.message || 'Ошибка при проверке чека');
      setPhase('CHOOSE');
    }
  };

  // Start QR scanner
  const startQrScanner = async () => {
    setPhase('QR_SCAN');
    setError(null);

    // Wait for DOM element to render
    await new Promise(r => setTimeout(r, 300));

    try {
      const scanner = new Html5Qrcode(qrContainerRef.current);
      qrScannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          // QR found
          processQrData(decodedText);
        },
        () => {
          // QR not found in frame — ignore
        }
      );
    } catch {
      setError('Камера недоступна. Загрузите фото QR кода или введите данные вручную.');
    }
  };

  // Scan QR from uploaded image file using jsQR
  const handleQrFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    try {
      const imageData = await fileToImageData(file);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code && code.data) {
        processQrData(code.data);
      } else {
        setError('QR код не найден на изображении. Попробуйте более чёткое фото или введите данные вручную.');
      }
    } catch {
      setError('Не удалось обработать изображение.');
    }

    if (qrFileInputRef.current) qrFileInputRef.current.value = '';
  };

  // Convert File to ImageData for jsQR
  const fileToImageData = (file: File): Promise<ImageData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) { reject(new Error('No canvas context')); return; }
          ctx.drawImage(img, 0, 0);
          resolve(ctx.getImageData(0, 0, img.width, img.height));
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  // Submit manual QR text
  const handleManualQrSubmit = () => {
    const text = qrManualText.trim();
    if (!text) return;

    // Validate it looks like a receipt QR
    if (text.includes('fn=') && text.includes('fp=')) {
      processQrData(text);
    } else {
      setError('Некорректный формат. Ожидается строка вида: t=20230916T1825&s=2099.00&fn=...&i=...&fp=...&n=1');
    }
  };

  // Handle photo file selection
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

  // Scan photo with AI
  const handlePhotoScan = async () => {
    if (!imageDataRef.current) return;

    const { base64, mimeType } = imageDataRef.current;

    if (!isOnline) {
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
      {/* CHOOSE phase — pick method */}
      {phase === 'CHOOSE' && (
        <div className="space-y-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Выберите способ сканирования чека
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* QR scan option */}
            <button
              onClick={startQrScanner}
              disabled={!isOnline}
              className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-900 dark:text-white">QR код чека</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Точные данные из ФНС
                </div>
              </div>
            </button>

            {/* Photo scan option */}
            <button
              onClick={() => { setPhase('CAPTURE'); setError(null); }}
              className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
            >
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <CameraIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-900 dark:text-white">Фото чека</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  AI распознавание ({getRemainingScans()}/200)
                </div>
              </div>
            </button>
          </div>

          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
          )}

          <div className="flex justify-end pt-2">
            <Button variant="secondary" onClick={handleClose}>
              Отмена
            </Button>
          </div>
        </div>
      )}

      {/* QR_SCAN phase */}
      {phase === 'QR_SCAN' && (
        <div className="space-y-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Наведите камеру на QR код чека
          </div>

          <div
            id={qrContainerRef.current}
            className="w-full max-w-sm mx-auto rounded-lg overflow-hidden"
            style={{ minHeight: 300 }}
          />

          {/* Fallback options */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-3">
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              QR плохо читается?
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              {/* Upload QR photo */}
              <label className="flex-1 flex items-center justify-center gap-2 p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <CameraIcon className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700 dark:text-gray-300">Фото QR кода</span>
                <input
                  ref={qrFileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleQrFileChange}
                  className="hidden"
                />
              </label>

              {/* Manual input toggle */}
              <button
                onClick={() => setShowManualInput(!showManualInput)}
                className="flex-1 flex items-center justify-center gap-2 p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span className="text-gray-700 dark:text-gray-300">Ввести вручную</span>
              </button>
            </div>

            {/* Manual QR string input */}
            {showManualInput && (
              <div className="space-y-2">
                <textarea
                  value={qrManualText}
                  onChange={(e) => setQrManualText(e.target.value)}
                  placeholder="t=20230916T1825&s=2099.00&fn=9960440502897843&i=22841&fp=1963030161&n=1"
                  className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring focus:ring-blue-200 focus:border-blue-500"
                  rows={2}
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleManualQrSubmit}
                  disabled={!qrManualText.trim()}
                  fullWidth
                >
                  Отправить
                </Button>
              </div>
            )}
          </div>

          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
          )}

          <div className="flex justify-center gap-3 pt-2">
            <Button variant="secondary" onClick={() => { stopQrScanner(); setPhase('CHOOSE'); }}>
              Назад
            </Button>
          </div>
        </div>
      )}

      {/* CAPTURE phase — photo */}
      {phase === 'CAPTURE' && (
        <div className="space-y-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Сфотографируйте чек или выберите изображение
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

          <div className="flex justify-between pt-2">
            <Button variant="secondary" onClick={() => { resetState(); setPhase('CHOOSE'); }}>
              Назад
            </Button>
            <Button
              variant="primary"
              onClick={handlePhotoScan}
              disabled={!imageReady}
            >
              {isOnline ? 'Сканировать' : 'В очередь'}
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
