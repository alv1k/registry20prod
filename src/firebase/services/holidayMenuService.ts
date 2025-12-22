// src/firebase/services/holidayMenuService.ts
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy
} from 'firebase/firestore';
import app from '../config';
import { getFirestore } from 'firebase/firestore';
import { AppHolidayMenu as HolidayMenu } from '../../store/useStore';

const db = getFirestore(app);

const HOLIDAY_MENU_COLLECTION = 'holidayMenus';

export const getAllHolidayMenus = async (): Promise<HolidayMenu[]> => {
  try {
    const q = query(collection(db, HOLIDAY_MENU_COLLECTION), orderBy('dateAdded', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        holidayName: data.holidayName,
        holidayDate: data.holidayDate,
        recipeIds: data.recipeIds || [],
        dateAdded: data.dateAdded
      };
    });
  } catch (error) {
    console.error('Error getting holiday menus:', error);
    throw error;
  }
};

export const addHolidayMenu = async (holidayMenu: Omit<HolidayMenu, 'id' | 'dateAdded'>): Promise<string> => {
  try {
    const newHolidayMenu = {
      ...holidayMenu,
      dateAdded: new Date().toISOString().split('T')[0]
    };
    const docRef = await addDoc(collection(db, HOLIDAY_MENU_COLLECTION), newHolidayMenu);
    return docRef.id;
  } catch (error) {
    console.error('Error adding holiday menu:', error);
    throw error;
  }
};

export const updateHolidayMenu = async (id: string, holidayMenu: Partial<HolidayMenu>): Promise<void> => {
  try {
    const holidayMenuRef = doc(db, HOLIDAY_MENU_COLLECTION, id);
    await updateDoc(holidayMenuRef, holidayMenu);
  } catch (error) {
    console.error('Error updating holiday menu:', error);
    throw error;
  }
};

export const deleteHolidayMenu = async (id: string): Promise<void> => {
  try {
    const holidayMenuRef = doc(db, HOLIDAY_MENU_COLLECTION, id);
    await deleteDoc(holidayMenuRef);
  } catch (error) {
    console.error('Error deleting holiday menu:', error);
    throw error;
  }
};