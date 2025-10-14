// src/firebase/services/financeService.ts
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
import { isValidFinanceRecord } from '../../utils/validation';

// Тип для финансовой записи
export interface FinanceRecord {
  id?: string; // id будет добавлен позже при получении из Firestore
  date: string; // дата
  name: string; // название
  price: number; // цена
  quantity: number; // количество
  total: number; // сумма
  classification: string; // классификация
  comment: string; // комментарий
}

// Имя коллекции в Firestore
const COLLECTION_NAME = 'finance';

// Получить все финансовые записи
export const getAllFinanceRecords = async (): Promise<FinanceRecord[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    const records: FinanceRecord[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      records.push({
        id: doc.id,
        date: data.date || '',
        name: data.name || '',
        price: data.price || 0,
        quantity: data.quantity || 0,
        total: data.total || 0,
        classification: data.classification || '',
        comment: data.comment || ''
      });
    });
    
    return records;
  } catch (error) {
    console.error('Error getting finance records:', error);
    throw error;
  }
};

// Добавить новую финансовую запись
export const addFinanceRecord = async (record: Omit<FinanceRecord, 'id'>): Promise<string> => {
  try {
    // Валидация данных перед сохранением
    const validation = isValidFinanceRecord(record);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), record);
    return docRef.id;
  } catch (error: any) {
    console.error('Error adding finance record:', error);
    // Check if it's an authentication error
    if (error.code && (error.code.includes('unauthenticated') || error.code.includes('permission'))) {
      throw new Error('У вас нет прав для выполнения этого действия. Обратитесь к администратору.');
    }
    throw error;
  }
};

// Обновить финансовую запись
export const updateFinanceRecord = async (id: string, record: Partial<FinanceRecord>): Promise<void> => {
  try {
    // Валидация данных перед обновлением
    if (record.date !== undefined || record.name !== undefined || record.price !== undefined || 
        record.quantity !== undefined || record.total !== undefined || 
        record.classification !== undefined || record.comment !== undefined) {
      // Create a temporary object to validate
      const tempRecord = {
        date: record.date !== undefined ? record.date : '',
        name: record.name !== undefined ? record.name : '',
        price: record.price !== undefined ? record.price : 0,
        quantity: record.quantity !== undefined ? record.quantity : 0,
        total: record.total !== undefined ? record.total : 0,
        classification: record.classification !== undefined ? record.classification : '',
        comment: record.comment !== undefined ? record.comment : ''
      };
      
      const validation = isValidFinanceRecord(tempRecord);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }
    }
    
    const recordRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(recordRef, record);
  } catch (error: any) {
    console.error('Error updating finance record:', error);
    // Check if it's an authentication error
    if (error.code && (error.code.includes('unauthenticated') || error.code.includes('permission'))) {
      throw new Error('У вас нет прав для выполнения этого действия. Обратитесь к администратору.');
    }
    throw error;
  }
};

// Удалить финансовую запись
export const deleteFinanceRecord = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error: any) {
    console.error('Error deleting finance record:', error);
    // Check if it's an authentication error
    if (error.code && (error.code.includes('unauthenticated') || error.code.includes('permission'))) {
      throw new Error('У вас нет прав для выполнения этого действия. Обратитесь к администратору.');
    }
    throw error;
  }
};

// Найти записи по классификации
export const findRecordsByClassification = async (classification: string): Promise<FinanceRecord[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('classification', '==', classification)
    );
    const querySnapshot = await getDocs(q);
    const records: FinanceRecord[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      records.push({
        id: doc.id,
        date: data.date || '',
        name: data.name || '',
        price: data.price || 0,
        quantity: data.quantity || 0,
        total: data.total || 0,
        classification: data.classification || '',
        comment: data.comment || ''
      });
    });
    
    return records;
  } catch (error) {
    console.error('Error finding finance records by classification:', error);
    throw error;
  }
};

// export const getFinanceCategories = async (): Promise<void> => {
//   try {
//     const q = query(
//       collection(db, COLLECTION_NAME),
      // orderby('categories', '==', )
//     )
//   }

// }