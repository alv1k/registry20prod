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
import { getFunctions, httpsCallable } from 'firebase/functions';
import { db } from '../firestore';
import app from '../config';
import { sanitizeCorrespondentRecord } from '../../utils/sanitization';

// Initialize Firebase Functions
const functions = getFunctions(app);

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
    // Санитизация данных перед сохранением
    const sanitizedRecord = sanitizeCorrespondentRecord(record);
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), sanitizedRecord);
    return docRef.id;
  } catch (error: any) {
    console.error('Error adding correspondent record:', error);
    // Check if it's an authentication error
    if (error.code && (error.code.includes('unauthenticated') || error.code.includes('permission'))) {
      throw new Error('У вас нет прав для выполнения этого действия. Обратитесь к администратору.');
    }
    throw error;
  }
};

// Обновить запись корреспондента
export const updateCorrespondentRecord = async (id: string, record: Partial<CorrespondentRecord>): Promise<void> => {
  try {
    // Санитизация данных перед обновлением
    const sanitizedRecord: Partial<CorrespondentRecord> = {};
    
    // Санитизируем только те поля, которые передаются для обновления
    if (record.date !== undefined) {
      sanitizedRecord.date = sanitizeCorrespondentRecord({ date: record.date }).date;
    }
    if (record.incomingNumber !== undefined) {
      sanitizedRecord.incomingNumber = sanitizeCorrespondentRecord({ incomingNumber: record.incomingNumber }).incomingNumber;
    }
    if (record.subject !== undefined) {
      sanitizedRecord.subject = sanitizeCorrespondentRecord({ subject: record.subject }).subject;
    }
    if (record.outgoingNumber !== undefined) {
      sanitizedRecord.outgoingNumber = sanitizeCorrespondentRecord({ outgoingNumber: record.outgoingNumber }).outgoingNumber;
    }
    if (record.from !== undefined) {
      sanitizedRecord.from = sanitizeCorrespondentRecord({ from: record.from }).from;
    }
    if (record.to !== undefined) {
      sanitizedRecord.to = sanitizeCorrespondentRecord({ to: record.to }).to;
    }
    if (record.signedBy !== undefined) {
      sanitizedRecord.signedBy = sanitizeCorrespondentRecord({ signedBy: record.signedBy }).signedBy;
    }
    
    const recordRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(recordRef, sanitizedRecord);
  } catch (error: any) {
    console.error('Error updating correspondent record:', error);
    // Check if it's an authentication error
    if (error.code && (error.code.includes('unauthenticated') || error.code.includes('permission'))) {
      throw new Error('У вас нет прав для выполнения этого действия. Обратитесь к администратору.');
    }
    throw error;
  }
};

// Удалить запись корреспондента
export const deleteCorrespondentRecord = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error: any) {
    console.error('Error deleting correspondent record:', error);
    // Check if it's an authentication error
    if (error.code && (error.code.includes('unauthenticated') || error.code.includes('permission'))) {
      throw new Error('У вас нет прав для выполнения этого действия. Обратитесь к администратору.');
    }
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