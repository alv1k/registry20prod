// src/firebase/services/periodService.ts
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
import { sanitizePeriodEvent } from '../../utils/sanitization';

// Initialize Firebase Functions
const functions = getFunctions(app);

// Тип для события периода
export interface PeriodEvent {
  id?: string; // id будет добавлен позже при получении из Firestore
  title: string;
  date: string;
  description?: string;
  category?: string;
}

// Имя коллекции в Firestore
const COLLECTION_NAME = 'periodEvents';

// Получить все события периода
export const getAllPeriodEvents = async (): Promise<PeriodEvent[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    const events: PeriodEvent[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      events.push({
        id: doc.id,
        title: data.title || '',
        date: data.date || '',
        description: data.description || '',
        category: data.category || ''
      });
    });

    return events;
  } catch (error) {
    console.error('Error getting period events:', error);
    throw error;
  }
};

// Добавить новое событие периода
export const addPeriodEvent = async (event: Omit<PeriodEvent, 'id'>): Promise<string> => {
  try {
    // Санитизация данных перед сохранением
    const sanitizedEvent = sanitizePeriodEvent(event);

    const docRef = await addDoc(collection(db, COLLECTION_NAME), sanitizedEvent);
    return docRef.id;
  } catch (error: any) {
    console.error('Error adding period event:', error);
    // Check if it's an authentication error
    if (error.code && (error.code.includes('unauthenticated') || error.code.includes('permission'))) {
      throw new Error('У вас нет прав для выполнения этого действия. Обратитесь к администратору.');
    }
    throw error;
  }
};

// Обновить событие периода
export const updatePeriodEvent = async (id: string, event: Partial<PeriodEvent>): Promise<void> => {
  try {
    // Санитизация данных перед обновлением
    const sanitizedEvent: Partial<PeriodEvent> = {};

    // Санитизируем только те поля, которые передаются для обновления
    if (event.title !== undefined) {
      sanitizedEvent.title = sanitizePeriodEvent({ title: event.title }).title;
    }
    if (event.date !== undefined) {
      sanitizedEvent.date = sanitizePeriodEvent({ date: event.date }).date;
    }
    if (event.description !== undefined) {
      sanitizedEvent.description = sanitizePeriodEvent({ description: event.description }).description;
    }
    if (event.category !== undefined) {
      sanitizedEvent.category = sanitizePeriodEvent({ category: event.category }).category;
    }

    const eventRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(eventRef, sanitizedEvent);
  } catch (error: any) {
    console.error('Error updating period event:', error);
    // Check if it's an authentication error
    if (error.code && (error.code.includes('unauthenticated') || error.code.includes('permission'))) {
      throw new Error('У вас нет прав для выполнения этого действия. Обратитесь к администратору.');
    }
    throw error;
  }
};

// Удалить событие периода
export const deletePeriodEvent = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error: any) {
    console.error('Error deleting period event:', error);
    // Check if it's an authentication error
    if (error.code && (error.code.includes('unauthenticated') || error.code.includes('permission'))) {
      throw new Error('У вас нет прав для выполнения этого действия. Обратитесь к администратору.');
    }
    throw error;
  }
};

// Найти событие по дате
export const findPeriodEventsByDate = async (date: string): Promise<PeriodEvent[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('date', '==', date)
    );
    const querySnapshot = await getDocs(q);
    const events: PeriodEvent[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      events.push({
        id: doc.id,
        title: data.title || '',
        date: data.date || '',
        description: data.description || '',
        category: data.category || ''
      });
    });

    return events;
  } catch (error) {
    console.error('Error finding period events:', error);
    throw error;
  }
};