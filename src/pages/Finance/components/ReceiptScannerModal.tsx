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
        if (state === 2) await qrScannerRef.current.stop();
      } catch { /* ignore */ }
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

  useEffect(() => {
    return () => { stopQrScanner(); };
  }, [stopQrScanner]);

  // Process QR data through Vercel API
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
        const err = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(err.error || 'Ошибка при проверке чека');
      }

      const result = await response.json();

      if (!result.items || result.items.length === 0) {
        throw new Error('Товары не найдены. Попробуйте фото чека.');
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

  const startQrScanner = async () => {
    setPhase('QR_SCAN');
    setError(null);
    await new Promise(r => setTimeout(r, 300));

    try {
      const scanner = new Html5Qrcode(qrContainerRef.current);
      qrScannerRef.current = scanner;
      const qrboxSize = isMobile ? 200 : 250;

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: qrboxSize, height: qrboxSize } },
        (decodedText) => processQrData(decodedText),
        () => {}
      );
    } catch {
      setError('Камера недоступна. Загрузите фото QR или введите вручную.');
    }
  };

  // jsQR file scan
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
        setError('QR не найден. Обрежьте фото так, чтобы QR был крупнее.');
      }
    } catch (err: any) {
      setError(`Ошибка: ${err?.message || String(err)}`);
    }
    if (qrFileInputRef.current) qrFileInputRef.current.value = '';
  };

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
        img.onerror = () => reject(new Error('Image load failed'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('File read failed'));
      reader.readAsDataURL(file);
    });
  };

  const handleManualQrSubmit = () => {
    const text = qrManualText.trim();
    if (!text) return;
    if (text.includes('fn=') && text.includes('fp=')) {
      processQrData(text);
    } else {
      setError('Формат: t=20230916T1825&s=2099.00&fn=...&i=...&fp=...&n=1');
    }
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

  const handlePhotoScan = async () => {
    if (!imageDataRef.current) return;
    const { base64, mimeType } = imageDataRef.current;

    if (!isOnline) {
      try {
        await addToQueue(base64, mimeType);
        onQueueUpdated?.();
        setPhase('QUEUED');
      } catch { setError('Не удалось сохранить в очередь'); }
      return;
    }

    setPhase('PROCESSING');
    try {
      const result = await scanReceiptFromImage(base64, mimeType, (step) => setProcessingStep(step));
      const reviewItems: ReviewItem[] = result.items.map((item, i) => ({
        ...item, id: `${Date.now()}-${i}`, classification: '',
      }));
      setItems(reviewItems);
      setDate(result.date || new Date().toISOString().split('T')[0]);
      setComment(result.storeName ? `Магазин: ${result.storeName}` : '');
      setPhase('REVIEW');
    } catch (err: any) {
      setError(err?.message || 'Ошибка сканирования');
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
    if (items.length > 1) setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { id: Date.now().toString(), name: '', price: 0, quantity: 1, total: 0, classification: '' },
    ]);
  };

  const handleConfirm = () => {
    if (items.some((item) => !item.classification)) {
      setError('Выберите категорию для всех позиций');
      return;
    }
    onItemsReady(items, date, comment);
    handleClose();
  };

  const expenseCategories = categories
    .filter((c) => c.type === 'expense')
    .sort((a, b) => a.name.localeCompare(b.name));

  const inputClass = "w-full p-2.5 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500";
  const labelClass = "block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1";

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Сканирование чека" size="lg">
      {/* CHOOSE */}
      {phase === 'CHOOSE' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Выберите способ сканирования
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={startQrScanner}
              disabled={!isOnline}
              className="flex flex-col items-center gap-2 p-4 sm:p-6 border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900 dark:text-white">QR код</div>
                <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Данные из ФНС
                </div>
              </div>
            </button>

            <button
              onClick={() => { setPhase('CAPTURE'); setError(null); }}
              className="flex flex-col items-center gap-2 p-4 sm:p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <CameraIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900 dark:text-white">Фото</div>
                <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  AI ({getRemainingScans()}/200)
                </div>
              </div>
            </button>
          </div>

          {error && <p className="text-red-600 dark:text-red-400 text-xs">{error}</p>}

          <div className="flex justify-end">
            <Button variant="secondary" onClick={handleClose}>Отмена</Button>
          </div>
        </div>
      )}

      {/* QR_SCAN */}
      {phase === 'QR_SCAN' && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Наведите камеру на QR код
          </p>

          <div
            id={qrContainerRef.current}
            className="w-full mx-auto rounded-lg overflow-hidden"
            style={{ maxWidth: isMobile ? '100%' : 380, minHeight: isMobile ? 250 : 300 }}
          />

          <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-2">
            <p className="text-[11px] text-gray-500 dark:text-gray-400 text-center">
              QR плохо читается?
            </p>

            <div className="flex gap-2">
              <label className="flex-1 flex items-center justify-center gap-1.5 p-2 text-xs border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors active:bg-gray-100">
                <CameraIcon className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-gray-700 dark:text-gray-300">Фото QR</span>
                <input
                  ref={qrFileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleQrFileChange}
                  className="hidden"
                />
              </label>

              <button
                onClick={() => setShowManualInput(!showManualInput)}
                className="flex-1 flex items-center justify-center gap-1.5 p-2 text-xs border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors active:bg-gray-100"
              >
                <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span className="text-gray-700 dark:text-gray-300">Вручную</span>
              </button>
            </div>

            {showManualInput && (
              <div className="space-y-2">
                <textarea
                  value={qrManualText}
                  onChange={(e) => setQrManualText(e.target.value)}
                  placeholder="t=20230916T1825&s=2099.00&fn=...&i=...&fp=...&n=1"
                  className={`${inputClass} text-xs`}
                  rows={2}
                />
                <Button variant="primary" size="sm" onClick={handleManualQrSubmit} disabled={!qrManualText.trim()} fullWidth>
                  Отправить
                </Button>
              </div>
            )}
          </div>

          {error && <p className="text-red-600 dark:text-red-400 text-xs break-words">{error}</p>}

          <div className="flex justify-center">
            <Button variant="secondary" onClick={() => { stopQrScanner(); setPhase('CHOOSE'); }}>
              Назад
            </Button>
          </div>
        </div>
      )}

      {/* CAPTURE */}
      {phase === 'CAPTURE' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Сфотографируйте чек или выберите файл
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 dark:text-gray-400
              file:mr-3 file:py-2.5 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-medium
              file:bg-blue-50 file:text-blue-700
              dark:file:bg-blue-900/30 dark:file:text-blue-400
              hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50
              cursor-pointer"
          />

          {previewUrl && (
            <img
              src={previewUrl}
              alt="Превью"
              className="max-h-48 sm:max-h-64 rounded-lg border border-gray-200 dark:border-gray-700 mx-auto"
            />
          )}

          {error && <p className="text-red-600 dark:text-red-400 text-xs">{error}</p>}

          <div className="flex justify-between gap-3">
            <Button variant="secondary" onClick={() => { resetState(); }}>
              Назад
            </Button>
            <Button variant="primary" onClick={handlePhotoScan} disabled={!imageReady}>
              {isOnline ? 'Сканировать' : 'В очередь'}
            </Button>
          </div>
        </div>
      )}

      {/* PROCESSING */}
      {phase === 'PROCESSING' && (
        <div className="py-4">
          <LoadingSpinner message={processingStep || 'Обработка...'} size="sm" />
        </div>
      )}

      {/* REVIEW */}
      {phase === 'REVIEW' && (
        <div className="space-y-3">
          {/* Date & Comment — stacked on mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Дата</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Комментарий</label>
              <input type="text" value={comment} onChange={(e) => setComment(e.target.value)} className={inputClass} placeholder="Комментарий" />
            </div>
          </div>

          {/* Items header */}
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Товары ({items.length})
            </span>
            <button type="button" onClick={addItem} className="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center gap-0.5">
              <PlusIcon className="w-3.5 h-3.5" /> Добавить
            </button>
          </div>

          {/* Items list */}
          <div className="space-y-2 max-h-[50vh] overflow-y-auto -mx-1 px-1">
            {items.map((item) => (
              <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 relative">
                {items.length > 1 && (
                  <button type="button" onClick={() => removeItem(item.id)}
                    className="absolute top-1.5 right-1.5 text-red-500 dark:text-red-400 p-1">
                    <TrashIcon className="h-3.5 w-3.5" />
                  </button>
                )}

                {/* Mobile: all fields stacked, 2 columns for price/qty/total */}
                <div className="space-y-2">
                  <div>
                    <label className={labelClass}>Название</label>
                    <input type="text" value={item.name} onChange={(e) => updateItem(item.id, 'name', e.target.value)} className={inputClass} />
                  </div>

                  <div>
                    <label className={labelClass}>Категория</label>
                    <select value={item.classification} onChange={(e) => updateItem(item.id, 'classification', e.target.value)} className={inputClass}>
                      <option value="">Выберите</option>
                      {expenseCategories.map((cat) => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className={labelClass}>Цена</label>
                      <input type="number" value={item.price} onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                        className={inputClass} min="0" step="0.01" />
                    </div>
                    <div>
                      <label className={labelClass}>Кол-во</label>
                      <input type="number" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        className={inputClass} min="0" step="0.01" />
                    </div>
                    <div>
                      <label className={labelClass}>Сумма</label>
                      <input type="text" value={formatCurrencyWithSeparators(item.total.toString())} readOnly
                        className={`${inputClass} bg-gray-50 dark:bg-gray-600`} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {error && <p className="text-red-600 dark:text-red-400 text-xs">{error}</p>}

          <div className="flex justify-end gap-3 pt-1">
            <Button variant="secondary" onClick={handleClose}>Отмена</Button>
            <Button variant="primary" onClick={handleConfirm}>Подтвердить</Button>
          </div>
        </div>
      )}

      {/* QUEUED */}
      {phase === 'QUEUED' && (
        <div className="text-center py-8 space-y-3">
          <div className="text-4xl">📥</div>
          <h4 className="text-base font-medium text-gray-900 dark:text-white">
            Чек сохранён в очередь
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Будет обработан при подключении к интернету
          </p>
          <Button variant="primary" onClick={handleClose}>Закрыть</Button>
        </div>
      )}
    </Modal>
  );
};

export default ReceiptScannerModal;
