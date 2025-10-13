// src/firebase/services/categoryService.ts
import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query,
  where
} from 'firebase/firestore';
import { db } from '../firestore';

// Тип для категории
export interface Category {
  id?: string; // id будет добавлен позже при получении из Firestore
  name: string; // название категории
  description?: string; // описание категории (опционально)
  type: 'expense' | 'income'; // тип: расход или доход
}

// Имя коллекции в Firestore
const COLLECTION_NAME = 'finance_categories';

// Получить все категории
export const getAllCategories = async (): Promise<Category[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME));
    const querySnapshot = await getDocs(q);
    const categories: Category[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      categories.push({
        id: doc.id,
        name: data.name || '',
        description: data.description || '',
        type: data.type || 'expense'
      });
    });
    console.log(categories,'categories');
    
    return categories;
  } catch (error) {
    console.error('Error getting categories:', error);
    throw error;
  }
};

// Добавить новую категорию
export const addCategory = async (category: Omit<Category, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), category);
    return docRef.id;
  } catch (error) {
    console.error('Error adding category:', error);
    throw error;
  }
};

// Обновить категорию
export const updateCategory = async (id: string, category: Partial<Category>): Promise<void> => {
  try {
    const categoryRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(categoryRef, category);
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

// Удалить категорию
export const deleteCategory = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

// Найти категории по типу
export const getCategoriesByType = async (type: 'expense' | 'income'): Promise<Category[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('type', '==', type)
    );
    const querySnapshot = await getDocs(q);
    const categories: Category[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      categories.push({
        id: doc.id,
        name: data.name || '',
        description: data.description || '',
        type: data.type || 'expense'
      });
    });
    
    return categories;
  } catch (error) {
    console.error('Error getting categories by type:', error);
    throw error;
  }
};