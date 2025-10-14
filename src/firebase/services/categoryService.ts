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
import { isValidCategory } from '../../utils/validation';

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
    
    return categories;
  } catch (error) {
    console.error('Error getting categories:', error);
    throw error;
  }
};

// Добавить новую категорию
export const addCategory = async (category: Omit<Category, 'id'>): Promise<string> => {
  try {
    // Валидация данных перед сохранением
    const validation = isValidCategory(category);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), category);
    return docRef.id;
  } catch (error: any) {
    console.error('Error adding category:', error);
    // Check if it's an authentication error
    if (error.code && (error.code.includes('unauthenticated') || error.code.includes('permission'))) {
      throw new Error('У вас нет прав для выполнения этого действия. Обратитесь к администратору.');
    }
    throw error;
  }
};

// Обновить категорию
export const updateCategory = async (id: string, category: Partial<Category>): Promise<void> => {
  try {
    // Валидация данных перед обновлением
    if (category.name !== undefined || category.description !== undefined || category.type !== undefined) {
      // Create a temporary object to validate
      const tempCategory = {
        name: category.name !== undefined ? category.name : '',
        description: category.description !== undefined ? category.description : '',
        type: category.type !== undefined ? category.type : 'expense'
      };
      
      const validation = isValidCategory(tempCategory);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }
    }
    
    const categoryRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(categoryRef, category);
  } catch (error: any) {
    console.error('Error updating category:', error);
    // Check if it's an authentication error
    if (error.code && (error.code.includes('unauthenticated') || error.code.includes('permission'))) {
      throw new Error('У вас нет прав для выполнения этого действия. Обратитесь к администратору.');
    }
    throw error;
  }
};

// Удалить категорию
export const deleteCategory = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error: any) {
    console.error('Error deleting category:', error);
    // Check if it's an authentication error
    if (error.code && (error.code.includes('unauthenticated') || error.code.includes('permission'))) {
      throw new Error('У вас нет прав для выполнения этого действия. Обратитесь к администратору.');
    }
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