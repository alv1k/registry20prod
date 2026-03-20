// src/firebase/services/householdService.ts
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

// Тип для бытовой записи
export interface HouseholdRecord {
  id?: string; // id будет добавлен позже при получении из Firestore
  date: string; // дата
  description: string; // описание
  area: string; // область
  completed?: boolean; // выполнено/не выполнено (опционально)
}

// Имя коллекции в Firestore
const COLLECTION_NAME = 'household';

// Получить все бытовые записи
export const getAllHouseholdRecords = async (): Promise<HouseholdRecord[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    const records: HouseholdRecord[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      records.push({
        id: doc.id,
        date: data.date || '',
        description: data.description || '',
        area: data.area || '',
        completed: data.completed || false
      });
    });
    
    return records;
  } catch (error) {
    console.error('Error getting household records:', error);
    throw error;
  }
};

// Добавить новую бытовую запись
export const addHouseholdRecord = async (record: Omit<HouseholdRecord, 'id'>): Promise<string> => {
  try {
    // TEMP: Skip server validation for now and proceed directly to Firestore
    const docRef = await addDoc(collection(db, COLLECTION_NAME), record);
    return docRef.id;
  } catch (error: any) {
    console.error('Error adding household record:', error);
    // Check if it's an authentication error
    if (error.code && (error.code.includes('unauthenticated') || error.code.includes('permission'))) {
      throw new Error('У вас нет прав для выполнения этого действия. Обратитесь к администратору.');
    }
    throw error;
  }
};

// Обновить бытовую запись
export const updateHouseholdRecord = async (id: string, record: Partial<HouseholdRecord>): Promise<void> => {
  try {
    const recordRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(recordRef, record);
  } catch (error: any) {
    console.error('Error updating household record:', error);
    // Check if it's an authentication error
    if (error.code && (error.code.includes('unauthenticated') || error.code.includes('permission'))) {
      throw new Error('У вас нет прав для выполнения этого действия. Обратитесь к администратору.');
    }
    throw error;
  }
};

// Удалить бытовую запись
export const deleteHouseholdRecord = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error: any) {
    console.error('Error deleting household record:', error);
    // Check if it's an authentication error
    if (error.code && (error.code.includes('unauthenticated') || error.code.includes('permission'))) {
      throw new Error('У вас нет прав для выполнения этого действия. Обратитесь к администратору.');
    }
    throw error;
  }
};