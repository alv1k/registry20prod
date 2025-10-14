// src/firebase/services/transportService.ts
import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  where
} from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { db } from '../firestore';
import app from '../config';
import { sanitizeTransportRecord } from '../../utils/sanitization';

// Initialize Firebase Functions
const functions = getFunctions(app);

// Тип для записи транспорта
export interface TransportRecord {
  id?: string; // id будет добавлен позже при получении из Firestore
  shippingDate: string; // дата отгрузки
  departureDate: string; // дата выезда
  arrivalDate: string; // дата прибытия
  cargoName: string; // наименование груза
  driver: string; // водитель
  carNumber: string; // номер автомобиля
  driverLicense: string; // номер водительского удостоверения
  shippingWeight: number; // вес при отправке
  deliveryWeight: number; // вес при отгрузке
}

// Имя коллекции в Firestore
const COLLECTION_NAME = 'transport';

// Получить все записи транспорта
export const getAllTransportRecords = async (): Promise<TransportRecord[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('shippingDate', 'desc'));
    const querySnapshot = await getDocs(q);
    const records: TransportRecord[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      records.push({
        id: doc.id,
        shippingDate: data.shippingDate || '',
        departureDate: data.departureDate || '',
        arrivalDate: data.arrivalDate || '',
        cargoName: data.cargoName || '',
        driver: data.driver || '',
        carNumber: data.carNumber || '',
        driverLicense: data.driverLicense || '',
        shippingWeight: data.shippingWeight || 0,
        deliveryWeight: data.deliveryWeight || 0
      });
    });
    
    return records;
  } catch (error) {
    console.error('Error getting transport records:', error);
    throw error;
  }
};

// Добавить новую запись транспорта
export const addTransportRecord = async (record: Omit<TransportRecord, 'id'>): Promise<string> => {
  try {
    // Санитизация данных перед сохранением
    const sanitizedRecord = sanitizeTransportRecord(record);
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), sanitizedRecord);
    return docRef.id;
  } catch (error: any) {
    console.error('Error adding transport record:', error);
    // Check if it's an authentication error
    if (error.code && (error.code.includes('unauthenticated') || error.code.includes('permission'))) {
      throw new Error('У вас нет прав для выполнения этого действия. Обратитесь к администратору.');
    }
    throw error;
  }
};

// Обновить запись транспорта
export const updateTransportRecord = async (id: string, record: Partial<TransportRecord>): Promise<void> => {
  try {
    // Санитизация данных перед обновлением
    const sanitizedRecord: Partial<TransportRecord> = {};
    
    // Санитизируем только те поля, которые передаются для обновления
    if (record.shippingDate !== undefined) {
      sanitizedRecord.shippingDate = sanitizeTransportRecord({ shippingDate: record.shippingDate }).shippingDate;
    }
    if (record.departureDate !== undefined) {
      sanitizedRecord.departureDate = sanitizeTransportRecord({ departureDate: record.departureDate }).departureDate;
    }
    if (record.arrivalDate !== undefined) {
      sanitizedRecord.arrivalDate = sanitizeTransportRecord({ arrivalDate: record.arrivalDate }).arrivalDate;
    }
    if (record.cargoName !== undefined) {
      sanitizedRecord.cargoName = sanitizeTransportRecord({ cargoName: record.cargoName }).cargoName;
    }
    if (record.driver !== undefined) {
      sanitizedRecord.driver = sanitizeTransportRecord({ driver: record.driver }).driver;
    }
    if (record.carNumber !== undefined) {
      sanitizedRecord.carNumber = sanitizeTransportRecord({ carNumber: record.carNumber }).carNumber;
    }
    if (record.driverLicense !== undefined) {
      sanitizedRecord.driverLicense = sanitizeTransportRecord({ driverLicense: record.driverLicense }).driverLicense;
    }
    if (record.shippingWeight !== undefined) {
      sanitizedRecord.shippingWeight = sanitizeTransportRecord({ shippingWeight: record.shippingWeight }).shippingWeight;
    }
    if (record.deliveryWeight !== undefined) {
      sanitizedRecord.deliveryWeight = sanitizeTransportRecord({ deliveryWeight: record.deliveryWeight }).deliveryWeight;
    }
    
    const recordRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(recordRef, sanitizedRecord);
  } catch (error: any) {
    console.error('Error updating transport record:', error);
    // Check if it's an authentication error
    if (error.code && (error.code.includes('unauthenticated') || error.code.includes('permission'))) {
      throw new Error('У вас нет прав для выполнения этого действия. Обратитесь к администратору.');
    }
    throw error;
  }
};

// Удалить запись транспорта
export const deleteTransportRecord = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error: any) {
    console.error('Error deleting transport record:', error);
    // Check if it's an authentication error
    if (error.code && (error.code.includes('unauthenticated') || error.code.includes('permission'))) {
      throw new Error('У вас нет прав для выполнения этого действия. Обратитесь к администратору.');
    }
    throw error;
  }
};

// Найти запись по водителю
export const findRecordByDriver = async (driver: string): Promise<TransportRecord[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('driver', '==', driver)
    );
    const querySnapshot = await getDocs(q);
    const records: TransportRecord[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      records.push({
        id: doc.id,
        shippingDate: data.shippingDate || '',
        departureDate: data.departureDate || '',
        arrivalDate: data.arrivalDate || '',
        cargoName: data.cargoName || '',
        driver: data.driver || '',
        carNumber: data.carNumber || '',
        driverLicense: data.driverLicense || '',
        shippingWeight: data.shippingWeight || 0,
        deliveryWeight: data.deliveryWeight || 0
      });
    });
    
    return records;
  } catch (error) {
    console.error('Error finding transport record:', error);
    throw error;
  }
};