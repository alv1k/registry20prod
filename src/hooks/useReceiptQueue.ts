import { useState, useEffect, useRef, useCallback } from 'react';
import useOnlineStatus from './useOnlineStatus';
import {
  getQueuedReceipts,
  removeFromQueue,
  updateQueueEntry,
  getQueueCount,
} from '../utils/receiptQueue';
import { scanReceiptFromImage, ScanResult } from '../firebase/services/receiptService';

const MAX_RETRIES = 3;

export interface ProcessedResult {
  queueId: number;
  result: ScanResult;
}

const useReceiptQueue = () => {
  const isOnline = useOnlineStatus();
  const [pendingCount, setPendingCount] = useState(0);
  const [processedResults, setProcessedResults] = useState<ProcessedResult[]>([]);
  const wasOfflineRef = useRef(!navigator.onLine);
  const processingRef = useRef(false);

  const refreshCount = useCallback(async () => {
    try {
      const count = await getQueueCount();
      setPendingCount(count);
    } catch {
      // ignore
    }
  }, []);

  const processQueue = useCallback(async () => {
    if (processingRef.current) return;
    processingRef.current = true;

    try {
      const entries = await getQueuedReceipts();
      const pending = entries.filter(
        (e) => e.status === 'pending' || (e.status === 'failed' && e.retryCount < MAX_RETRIES)
      );

      for (const entry of pending) {
        if (!navigator.onLine) break;
        const id = entry.id!;

        try {
          await updateQueueEntry(id, { status: 'processing' });
          const result = await scanReceiptFromImage(entry.imageBase64, entry.mimeType);

          setProcessedResults((prev) => [...prev, { queueId: id, result }]);
          await removeFromQueue(id);
        } catch (error: any) {
          await updateQueueEntry(id, {
            status: 'failed',
            retryCount: entry.retryCount + 1,
            lastError: error?.message || 'Unknown error',
          });
        }
      }
    } finally {
      processingRef.current = false;
      await refreshCount();
    }
  }, [refreshCount]);

  // Detect offline→online transition
  useEffect(() => {
    if (isOnline && wasOfflineRef.current) {
      processQueue();
    }
    wasOfflineRef.current = !isOnline;
  }, [isOnline, processQueue]);

  // Initial count
  useEffect(() => {
    refreshCount();
  }, [refreshCount]);

  const clearProcessedResult = useCallback((queueId: number) => {
    setProcessedResults((prev) => prev.filter((r) => r.queueId !== queueId));
  }, []);

  return {
    pendingCount,
    processedResults,
    clearProcessedResult,
    refreshCount,
  };
};

export default useReceiptQueue;
