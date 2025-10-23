import { PlannedBudgetRecord } from '../models/PlannedBudget';
import { db } from '../firestore';
import { collection, addDoc, updateDoc, deleteDoc, getDocs, doc, query, where, orderBy } from 'firebase/firestore';
import { sanitizeInput } from '../../utils/sanitization';

const COLLECTION_NAME = 'planned_budget';

export const addPlannedBudgetRecord = async (record: Omit<PlannedBudgetRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    // Prepare the record by sanitizing and removing undefined values
    const sanitizedRecord: Partial<Omit<PlannedBudgetRecord, 'id' | 'createdAt' | 'updatedAt'>> = {
      ...record,
      classification: sanitizeInput(record.classification),
      comment: record.comment ? sanitizeInput(record.comment) : record.comment, // Preserve undefined if it was undefined
    };

    // Remove undefined values to avoid Firebase errors
    Object.keys(sanitizedRecord).forEach(key => {
      // @ts-ignore - We're filtering out undefined values
      if (sanitizedRecord[key] === undefined) delete sanitizedRecord[key];
    });

    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...sanitizedRecord,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return docRef.id;
  } catch (error) {
    console.error('Error adding planned budget record:', error);
    throw error;
  }
};

export const updatePlannedBudgetRecord = async (id: string, record: Partial<Omit<PlannedBudgetRecord, 'id' | 'createdAt' | 'updatedAt'>>) => {
  try {
    // Prepare the record by sanitizing and removing undefined values
    const sanitizedRecord: Partial<Omit<PlannedBudgetRecord, 'id' | 'createdAt' | 'updatedAt'>> = { ...record };
    if (record.classification) sanitizedRecord.classification = sanitizeInput(record.classification);
    if (record.comment !== undefined) sanitizedRecord.comment = sanitizeInput(record.comment || '');

    // Remove undefined values to avoid Firebase errors
    Object.keys(sanitizedRecord).forEach(key => {
      // @ts-ignore - We're filtering out undefined values
      if (sanitizedRecord[key] === undefined) delete sanitizedRecord[key];
    });

    await updateDoc(doc(db, COLLECTION_NAME, id), {
      ...sanitizedRecord,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating planned budget record:', error);
    throw error;
  }
};

export const deletePlannedBudgetRecord = async (id: string) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error('Error deleting planned budget record:', error);
    throw error;
  }
};

export const getAllPlannedBudgetRecords = async (): Promise<PlannedBudgetRecord[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('plannedDate', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const records: PlannedBudgetRecord[] = [];
    querySnapshot.forEach((doc) => {
      records.push({
        id: doc.id,
        ...doc.data()
      } as PlannedBudgetRecord);
    });
    
    return records;
  } catch (error) {
    console.error('Error getting planned budget records:', error);
    throw error;
  }
};

export const getPlannedBudgetRecordsByClassification = async (classification: string): Promise<PlannedBudgetRecord[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME), 
      where('classification', '==', classification),
      orderBy('plannedDate', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const records: PlannedBudgetRecord[] = [];
    querySnapshot.forEach((doc) => {
      records.push({
        id: doc.id,
        ...doc.data()
      } as PlannedBudgetRecord);
    });
    
    return records;
  } catch (error) {
    console.error('Error getting planned budget records by classification:', error);
    throw error;
  }
};

export const getPlannedBudgetRecordsByStatus = async (status: 'planned' | 'completed' | 'cancelled' | 'overdue'): Promise<PlannedBudgetRecord[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME), 
      where('status', '==', status),
      orderBy('plannedDate', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const records: PlannedBudgetRecord[] = [];
    querySnapshot.forEach((doc) => {
      records.push({
        id: doc.id,
        ...doc.data()
      } as PlannedBudgetRecord);
    });
    
    return records;
  } catch (error) {
    console.error('Error getting planned budget records by status:', error);
    throw error;
  }
};