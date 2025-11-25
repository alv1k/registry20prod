// src/firebase/services/recipeService.ts
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../firestore';
import { sanitizeRecipeRecord } from '../../utils/sanitization';

// Тип для записи рецепта
export interface RecipeRecord {
  id?: string; // id будет добавлен позже при получении из Firestore
  title: string; // название рецепта
  category: string; // категория (первое, второе, напитки и т.д.)
  ingredients: string; // ингредиенты
  instructions: string; // инструкции/способ приготовления
  cookingTime?: number; // время приготовления в минутах
  servings?: number; // количество порций/штук
  tags?: string[]; // теги
  date?: string; // дата добавления
}

// Возможные категории рецептов
export const RECIPE_CATEGORIES = [
  'первое',
  'второе',
  'напитки',
  'сладости',
  'молочка',
  'хлеб'
];

// Имя коллекции в Firestore
const COLLECTION_NAME = 'recipes';

// Получить все записи рецептов
export const getAllRecipeRecords = async (): Promise<RecipeRecord[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('title', 'asc'));
    const querySnapshot = await getDocs(q);
    const records: RecipeRecord[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      records.push({
        id: doc.id,
        title: data.title || '',
        category: data.category || '',
        ingredients: data.ingredients || '',
        instructions: data.instructions || '',
        cookingTime: typeof data.cookingTime === 'number' ? data.cookingTime : undefined,
        servings: typeof data.servings === 'number' ? data.servings : undefined,
        tags: Array.isArray(data.tags) ? data.tags : [],
        date: data.date || new Date().toISOString().split('T')[0]
      });
    });

    return records;
  } catch (error) {
    console.error('Error getting recipe records:', error);
    throw error;
  }
};

// Добавить новую запись рецепта
export const addRecipeRecord = async (record: Omit<RecipeRecord, 'id'>): Promise<string> => {
  try {
    // Санитизация данных перед сохранением
    const sanitizedRecord = sanitizeRecipeRecord(record);

    const docRef = await addDoc(collection(db, COLLECTION_NAME), sanitizedRecord);
    return docRef.id;
  } catch (error: any) {
    console.error('Error adding recipe record:', error);
    // Check if it's an authentication error
    if (error.code && (error.code.includes('unauthenticated') || error.code.includes('permission'))) {
      throw new Error('У вас нет прав для выполнения этого действия. Обратитесь к администратору.');
    }
    throw error;
  }
};

// Обновить запись рецепта
export const updateRecipeRecord = async (id: string, record: Partial<RecipeRecord>): Promise<void> => {
  try {
    // Санитизация данных перед обновлением
    const sanitizedRecord: Partial<RecipeRecord> = {};

    // Санитизируем только те поля, которые передаются для обновления
    if (record.title !== undefined) {
      sanitizedRecord.title = sanitizeRecipeRecord({ title: record.title }).title;
    }
    if (record.category !== undefined) {
      sanitizedRecord.category = sanitizeRecipeRecord({ category: record.category }).category;
    }
    if (record.ingredients !== undefined) {
      sanitizedRecord.ingredients = sanitizeRecipeRecord({ ingredients: record.ingredients }).ingredients;
    }
    if (record.instructions !== undefined) {
      sanitizedRecord.instructions = sanitizeRecipeRecord({ instructions: record.instructions }).instructions;
    }
    if (record.cookingTime !== undefined) {
      sanitizedRecord.cookingTime = sanitizeRecipeRecord({ cookingTime: record.cookingTime }).cookingTime;
    }
    if (record.servings !== undefined) {
      sanitizedRecord.servings = sanitizeRecipeRecord({ servings: record.servings }).servings;
    }
    if (record.tags !== undefined) {
      sanitizedRecord.tags = sanitizeRecipeRecord({ tags: record.tags }).tags;
    }
    if (record.date !== undefined) {
      sanitizedRecord.date = sanitizeRecipeRecord({ date: record.date }).date;
    }

    const recordRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(recordRef, sanitizedRecord);
  } catch (error: any) {
    console.error('Error updating recipe record:', error);
    // Check if it's an authentication error
    if (error.code && (error.code.includes('unauthenticated') || error.code.includes('permission'))) {
      throw new Error('У вас нет прав для выполнения этого действия. Обратитесь к администратору.');
    }
    throw error;
  }
};

// Удалить запись рецепта
export const deleteRecipeRecord = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error: any) {
    console.error('Error deleting recipe record:', error);
    // Check if it's an authentication error
    if (error.code && (error.code.includes('unauthenticated') || error.code.includes('permission'))) {
      throw new Error('У вас нет прав для выполнения этого действия. Обратитесь к администратору.');
    }
    throw error;
  }
};