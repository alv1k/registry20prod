import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../firestore';

export interface FirebaseGroceryItem {
  id?: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
  unit: string;
  purchased: boolean;
  createdAt: string;
}

const GROCERY_COLLECTION = 'groceryItems';

export const getAllGroceryItems = async (): Promise<FirebaseGroceryItem[]> => {
  try {
    const q = query(collection(db, GROCERY_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FirebaseGroceryItem[];
  } catch (error) {
    console.error('Error getting grocery items:', error);
    throw error;
  }
};

export const addGroceryItem = async (groceryItem: Omit<FirebaseGroceryItem, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, GROCERY_COLLECTION), {
      ...groceryItem,
      createdAt: groceryItem.createdAt || new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding grocery item:', error);
    throw error;
  }
};

export const updateGroceryItem = async (id: string, groceryItem: Partial<FirebaseGroceryItem>): Promise<void> => {
  try {
    const docRef = doc(db, GROCERY_COLLECTION, id);
    await updateDoc(docRef, { ...groceryItem });
  } catch (error) {
    console.error('Error updating grocery item:', error);
    throw error;
  }
};

export const deleteGroceryItem = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, GROCERY_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting grocery item:', error);
    throw error;
  }
};