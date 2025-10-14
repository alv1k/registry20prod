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
import { getFunctions, httpsCallable } from 'firebase/functions';
import { db } from '../firestore';
import app from '../config';
import { isValidCategory } from '../../utils/validation';
import { sanitizeCategoryRecord } from '../../utils/sanitization';

// Initialize Firebase Functions
const functions = getFunctions(app);

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
    
    // Санитизация данных перед сохранением
    const sanitizedCategory = sanitizeCategoryRecord(category);
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), sanitizedCategory);
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
    
    // Санитизация данных перед обновлением
    const sanitizedCategory: Partial<Category> = {};
    
    // Санитизируем только те поля, которые передаются для обновления
    if (category.name !== undefined) {
      sanitizedCategory.name = sanitizeCategoryRecord({ name: category.name }).name;
    }
    if (category.description !== undefined) {
      sanitizedCategory.description = sanitizeCategoryRecord({ description: category.description }).description;
    }
    if (category.type !== undefined) {
      sanitizedCategory.type = sanitizeCategoryRecord({ type: category.type }).type;
    }
    
    const categoryRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(categoryRef, sanitizedCategory);
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