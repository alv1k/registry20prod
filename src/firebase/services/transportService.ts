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
import { db } from '../firestore';

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
    const docRef = await addDoc(collection(db, COLLECTION_NAME), record);
    return docRef.id;
  } catch (error) {
    console.error('Error adding transport record:', error);
    throw error;
  }
};

// Обновить запись транспорта
export const updateTransportRecord = async (id: string, record: Partial<TransportRecord>): Promise<void> => {
  try {
    const recordRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(recordRef, record);
  } catch (error) {
    console.error('Error updating transport record:', error);
    throw error;
  }
};

// Удалить запись транспорта
export const deleteTransportRecord = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error('Error deleting transport record:', error);
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