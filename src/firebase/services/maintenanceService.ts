// src/firebase/services/maintenanceService.ts
import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy
} from 'firebase/firestore';
import { db } from '../firestore';
import { sanitizeMaintenanceRecord } from '../../utils/sanitization';

// Тип для записи технического обслуживания
export interface MaintenanceRecord {
  id?: string; // id будет добавлен позже при получении из Firestore
  vehicleId: string; // ID автомобиля
  vehicleName?: string; // название автомобиля (для удобства отображения)
  date: string; // дата обслуживания
  workType: string; // вид работ
  cost: number; // стоимость за единицу
  quantity?: number; // количество
  comment: string; // комментарий
  frequency: string; // частота
  mileage?: number; // пробег (опционально)
}

// Имя коллекции в Firestore
const COLLECTION_NAME = 'maintenance';

// Получить все записи технического обслуживания
export const getAllMaintenanceRecords = async (): Promise<MaintenanceRecord[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    const records: MaintenanceRecord[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      records.push({
        id: doc.id,
        vehicleId: data.vehicleId || '',
        date: data.date || '',
        workType: data.workType || '',
        cost: typeof data.cost === 'number' ? data.cost : 0,
        quantity: typeof data.quantity === 'number' ? data.quantity : undefined,
        comment: data.comment || '',
        frequency: data.frequency || '',
        mileage: typeof data.mileage === 'number' ? data.mileage : undefined
      });
    });
    
    return records;
  } catch (error) {
    console.error('Error getting maintenance records:', error);
    throw error;
  }
};

// Добавить новую запись технического обслуживания
export const addMaintenanceRecord = async (record: Omit<MaintenanceRecord, 'id'>): Promise<string> => {
  try {
    // Санитизация данных перед сохранением
    const sanitizedRecord = sanitizeMaintenanceRecord(record);
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), sanitizedRecord);
    return docRef.id;
  } catch (error: any) {
    console.error('Error adding maintenance record:', error);
    // Check if it's an authentication error
    if (error.code && (error.code.includes('unauthenticated') || error.code.includes('permission'))) {
      throw new Error('У вас нет прав для выполнения этого действия. Обратитесь к администратору.');
    }
    throw error;
  }
};

// Обновить запись технического обслуживания
export const updateMaintenanceRecord = async (id: string, record: Partial<MaintenanceRecord>): Promise<void> => {
  try {
    // Санитизация данных перед обновлением
    const sanitizedRecord: Partial<MaintenanceRecord> = {};
    
    // Санитизируем только те поля, которые передаются для обновления
    if (record.vehicleId !== undefined) {
      sanitizedRecord.vehicleId = sanitizeMaintenanceRecord({ vehicleId: record.vehicleId }).vehicleId;
    }
    if (record.date !== undefined) {
      sanitizedRecord.date = sanitizeMaintenanceRecord({ date: record.date }).date;
    }
    if (record.workType !== undefined) {
      sanitizedRecord.workType = sanitizeMaintenanceRecord({ workType: record.workType }).workType;
    }
    if (record.cost !== undefined) {
      sanitizedRecord.cost = sanitizeMaintenanceRecord({ cost: record.cost }).cost;
    }
    if (record.comment !== undefined) {
      sanitizedRecord.comment = sanitizeMaintenanceRecord({ comment: record.comment }).comment;
    }
    if (record.frequency !== undefined) {
      sanitizedRecord.frequency = sanitizeMaintenanceRecord({ frequency: record.frequency }).frequency;
    }
    if (record.quantity !== undefined) {
      sanitizedRecord.quantity = sanitizeMaintenanceRecord({ quantity: record.quantity }).quantity;
    }
    if (record.mileage !== undefined) {
      sanitizedRecord.mileage = sanitizeMaintenanceRecord({ mileage: record.mileage }).mileage;
    }
    
    const recordRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(recordRef, sanitizedRecord);
  } catch (error: any) {
    console.error('Error updating maintenance record:', error);
    // Check if it's an authentication error
    if (error.code && (error.code.includes('unauthenticated') || error.code.includes('permission'))) {
      throw new Error('У вас нет прав для выполнения этого действия. Обратитесь к администратору.');
    }
    throw error;
  }
};

// Удалить запись технического обслуживания
export const deleteMaintenanceRecord = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error: any) {
    console.error('Error deleting maintenance record:', error);
    // Check if it's an authentication error
    if (error.code && (error.code.includes('unauthenticated') || error.code.includes('permission'))) {
      throw new Error('У вас нет прав для выполнения этого действия. Обратитесь к администратору.');
    }
    throw error;
  }
};