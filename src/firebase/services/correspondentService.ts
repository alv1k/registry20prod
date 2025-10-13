// src/firebase/services/correspondentService.ts
import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  where,
  DocumentData
} from 'firebase/firestore';
import { db } from '../firestore';

// Тип для записи корреспондента
export interface CorrespondentRecord {
  id?: string; // id будет добавлен позже при получении из Firestore
  date: string;
  incomingNumber: string;
  subject: string;
  outgoingNumber: string;
  from: string;
  to: string;
  signedBy: string;
}

// Имя коллекции в Firestore
const COLLECTION_NAME = 'correspondent';

// Получить все записи корреспондента
export const getAllCorrespondentRecords = async (): Promise<CorrespondentRecord[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    const records: CorrespondentRecord[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      records.push({
        id: doc.id,
        date: data.date || '',
        incomingNumber: data.incomingNumber || '',
        subject: data.subject || '',
        outgoingNumber: data.outgoingNumber || '',
        from: data.from || '',
        to: data.to || '',
        signedBy: data.signedBy || ''
      });
    });
    
    return records;
  } catch (error) {
    console.error('Error getting correspondent records:', error);
    throw error;
  }
};

// Добавить новую запись корреспондента
export const addCorrespondentRecord = async (record: Omit<CorrespondentRecord, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), record);
    return docRef.id;
  } catch (error) {
    console.error('Error adding correspondent record:', error);
    throw error;
  }
};

// Обновить запись корреспондента
export const updateCorrespondentRecord = async (id: string, record: Partial<CorrespondentRecord>): Promise<void> => {
  try {
    const recordRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(recordRef, record);
  } catch (error) {
    console.error('Error updating correspondent record:', error);
    throw error;
  }
};

// Удалить запись корреспондента
export const deleteCorrespondentRecord = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error('Error deleting correspondent record:', error);
    throw error;
  }
};

// Найти запись по входящему номеру
export const findRecordByIncomingNumber = async (incomingNumber: string): Promise<CorrespondentRecord[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('incomingNumber', '==', incomingNumber)
    );
    const querySnapshot = await getDocs(q);
    const records: CorrespondentRecord[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      records.push({
        id: doc.id,
        date: data.date || '',
        incomingNumber: data.incomingNumber || '',
        subject: data.subject || '',
        outgoingNumber: data.outgoingNumber || '',
        from: data.from || '',
        to: data.to || '',
        signedBy: data.signedBy || ''
      });
    });
    
    return records;
  } catch (error) {
    console.error('Error finding correspondent record:', error);
    throw error;
  }
};