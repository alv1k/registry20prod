import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../firestore';
import { AppGroceryItem } from '../../store/useStore';

export interface FirebaseGroceryEntry {
  id?: string;
  items: {
    id: string;
    name: string;
    category: string;
    quantity: number;
    price: number;
    unit: string;
    purchased: boolean;
    createdAt: string;
  }[];
  dateAdded: string;
  purchased: boolean;
  comment?: string;
}

const GROCERY_ENTRIES_COLLECTION = 'groceryEntries';

export const getAllGroceryEntries = async (): Promise<FirebaseGroceryEntry[]> => {
  try {
    const q = query(collection(db, GROCERY_ENTRIES_COLLECTION), orderBy('dateAdded', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FirebaseGroceryEntry[];
  } catch (error) {
    console.error('Error getting grocery entries:', error);
    throw error;
  }
};

export const addGroceryEntry = async (groceryEntry: Omit<FirebaseGroceryEntry, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, GROCERY_ENTRIES_COLLECTION), {
      ...groceryEntry,
      dateAdded: groceryEntry.dateAdded || new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding grocery entry:', error);
    throw error;
  }
};

export const updateGroceryEntry = async (id: string, groceryEntry: Partial<FirebaseGroceryEntry>): Promise<void> => {
  try {
    const docRef = doc(db, GROCERY_ENTRIES_COLLECTION, id);
    await updateDoc(docRef, { ...groceryEntry });
  } catch (error) {
    console.error('Error updating grocery entry:', error);
    throw error;
  }
};

export const deleteGroceryEntry = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, GROCERY_ENTRIES_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting grocery entry:', error);
    throw error;
  }
};