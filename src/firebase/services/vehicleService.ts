// src/firebase/services/vehicleService.ts
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
import { sanitizeVehicleRecord } from '../../utils/sanitization';

// Initialize Firebase Functions
const functions = getFunctions(app);

// Тип для записи автомобиля
export interface VehicleRecord {
  id?: string; // id будет добавлен позже при получении из Firestore
  name: string; // название
  manufacturer: string; // производитель
  model: string; // марка
  engineVolume?: string; // объем двигателя
  engineNumber?: string; // номер двигателя
  vin?: string; // номер VIN/кузова
  stsData?: string; // данные СТС
  ptsData?: string; // данные ПТС
}

// Имя коллекции в Firestore
const COLLECTION_NAME = 'vehicles';

// Получить все записи автомобилей
export const getAllVehicleRecords = async (): Promise<VehicleRecord[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('name', 'asc'));
    const querySnapshot = await getDocs(q);
    const records: VehicleRecord[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      records.push({
        id: doc.id,
        name: data.name || '',
        manufacturer: data.manufacturer || '',
        model: data.model || '',
        engineVolume: data.engineVolume || '',
        engineNumber: data.engineNumber || '',
        vin: data.vin || '',
        stsData: data.stsData || '',
        ptsData: data.ptsData || ''
      });
    });
    
    return records;
  } catch (error) {
    console.error('Error getting vehicle records:', error);
    throw error;
  }
};

// Добавить новую запись автомобиля
export const addVehicleRecord = async (record: Omit<VehicleRecord, 'id'>): Promise<string> => {
  try {
    // Санитизация данных перед сохранением
    const sanitizedRecord = sanitizeVehicleRecord(record);
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), sanitizedRecord);
    return docRef.id;
  } catch (error: any) {
    console.error('Error adding vehicle record:', error);
    // Check if it's an authentication error
    if (error.code && (error.code.includes('unauthenticated') || error.code.includes('permission'))) {
      throw new Error('У вас нет прав для выполнения этого действия. Обратитесь к администратору.');
    }
    throw error;
  }
};

// Обновить запись автомобиля
export const updateVehicleRecord = async (id: string, record: Partial<VehicleRecord>): Promise<void> => {
  try {
    // Санитизация данных перед обновлением
    const sanitizedRecord: Partial<VehicleRecord> = {};
    
    // Санитизируем только те поля, которые передаются для обновления
    if (record.name !== undefined) {
      sanitizedRecord.name = sanitizeVehicleRecord({ name: record.name }).name;
    }
    if (record.manufacturer !== undefined) {
      sanitizedRecord.manufacturer = sanitizeVehicleRecord({ manufacturer: record.manufacturer }).manufacturer;
    }
    if (record.model !== undefined) {
      sanitizedRecord.model = sanitizeVehicleRecord({ model: record.model }).model;
    }
    if (record.engineVolume !== undefined) {
      sanitizedRecord.engineVolume = sanitizeVehicleRecord({ engineVolume: record.engineVolume }).engineVolume;
    }
    if (record.engineNumber !== undefined) {
      sanitizedRecord.engineNumber = sanitizeVehicleRecord({ engineNumber: record.engineNumber }).engineNumber;
    }
    if (record.vin !== undefined) {
      sanitizedRecord.vin = sanitizeVehicleRecord({ vin: record.vin }).vin;
    }
    if (record.stsData !== undefined) {
      sanitizedRecord.stsData = sanitizeVehicleRecord({ stsData: record.stsData }).stsData;
    }
    if (record.ptsData !== undefined) {
      sanitizedRecord.ptsData = sanitizeVehicleRecord({ ptsData: record.ptsData }).ptsData;
    }
    
    const recordRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(recordRef, sanitizedRecord);
  } catch (error: any) {
    console.error('Error updating vehicle record:', error);
    // Check if it's an authentication error
    if (error.code && (error.code.includes('unauthenticated') || error.code.includes('permission'))) {
      throw new Error('У вас нет прав для выполнения этого действия. Обратитесь к администратору.');
    }
    throw error;
  }
};

// Удалить запись автомобиля
export const deleteVehicleRecord = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error: any) {
    console.error('Error deleting vehicle record:', error);
    // Check if it's an authentication error
    if (error.code && (error.code.includes('unauthenticated') || error.code.includes('permission'))) {
      throw new Error('У вас нет прав для выполнения этого действия. Обратитесь к администратору.');
    }
    throw error;
  }
};

// Найти запись по VIN
export const findVehicleByVin = async (vin: string): Promise<VehicleRecord[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('vin', '==', vin)
    );
    const querySnapshot = await getDocs(q);
    const records: VehicleRecord[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      records.push({
        id: doc.id,
        name: data.name || '',
        manufacturer: data.manufacturer || '',
        model: data.model || '',
        engineVolume: data.engineVolume || '',
        engineNumber: data.engineNumber || '',
        vin: data.vin || '',
        stsData: data.stsData || '',
        ptsData: data.ptsData || ''
      });
    });
    
    return records;
  } catch (error) {
    console.error('Error finding vehicle record:', error);
    throw error;
  }
};