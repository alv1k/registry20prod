// src/store/useStore.ts
import { create } from 'zustand';
import { 
  getAllCorrespondentRecords, 
  addCorrespondentRecord as firebaseAddCorrespondentRecord,
  updateCorrespondentRecord as firebaseUpdateCorrespondentRecord,
  deleteCorrespondentRecord as firebaseDeleteCorrespondentRecord,
  CorrespondentRecord as FirebaseCorrespondentRecord,
  // Transport services
  getAllTransportRecords,
  addTransportRecord as firebaseAddTransportRecord,
  updateTransportRecord as firebaseUpdateTransportRecord,
  deleteTransportRecord as firebaseDeleteTransportRecord,
  TransportRecord as FirebaseTransportRecord,
  // Finance services
  getAllFinanceRecords,
  addFinanceRecord as firebaseAddFinanceRecord,
  updateFinanceRecord as firebaseUpdateFinanceRecord,
  deleteFinanceRecord as firebaseDeleteFinanceRecord,
  FinanceRecord as FirebaseFinanceRecord,
  // Category services
  getAllCategories,
  addCategory as firebaseAddCategory,
  updateCategory as firebaseUpdateCategory,
  deleteCategory as firebaseDeleteCategory,
  Category as FirebaseCategory
} from '../firebase/services';

// Тип для записи корреспондента во внутреннем store
// Поддерживает как локальные ID (number), так и Firebase ID (string)
export interface AppCorrespondentRecord {
  id: number | string; // может быть как number (локальный ID), так и string (Firebase ID)
  date: string; // дата
  incomingNumber: string; // входящий номер
  subject: string; // тема обращения
  outgoingNumber: string; // исходящий номер
  from: string; // от кого
  to: string; // кому
  signedBy: string; // подписан
}

// Тип для записи транспорта во внутреннем store
export interface AppTransportRecord {
  id: number | string; // может быть как number (локальный ID), так и string (Firebase ID)
  shippingDate: string; // дата отгрузки
  departureDate: string; // дата выезда
  arrivalDate: string; // дата прибытия
  cargoName: string; // наименование груза
  driver: string; // водитель
  carNumber: string; // номер автомобиля
  driverLicense: string; // номер водительского удостоверения
  shippingWeight: number; // вес при отправке
  deliveryWeight: number; // вес при отгрузке
}

// Тип для финансовой записи во внутреннем store
export interface AppFinanceRecord {
  id: number | string; // может быть как number (локальный ID), так и string (Firebase ID)
  date: string; // дата
  name: string; // название
  price: number; // цена
  quantity: number; // количество
  total: number; // сумма
  classification: string; // классификация
  comment: string; // комментарий
}

// Тип для категории во внутреннем store
export interface AppCategory {
  id: number | string; // может быть как number (локальный ID), так и string (Firebase ID)
  name: string; // название категории
  description?: string; // описание категории (опционально)
  type: 'expense' | 'income'; // тип: расход или доход
}

interface AppState {
  // Navigation state
  currentPage: string;
  setCurrentPage: (page: string) => void;
  
  // User preferences
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  
  // Data for the different sections
  correspondentData: AppCorrespondentRecord[];
  transportData: AppTransportRecord[];
  financeData: AppFinanceRecord[];
  domesticData: any[];
  
  // Loading states
  isCorrespondentDataLoading: boolean;
  isTransportDataLoading: boolean;
  isFinanceDataLoading: boolean;
  correspondentDataError: string | null;
  transportDataError: string | null;
  financeDataError: string | null;
  
  // Firebase sync actions
  syncCorrespondentData: () => Promise<void>;
  syncTransportData: () => Promise<void>;
  syncFinanceData: () => Promise<void>;
  
  // Actions to update data (with Firebase sync)
  setCorrespondentData: (data: AppCorrespondentRecord[]) => void;
  addCorrespondentRecord: (record: Omit<AppCorrespondentRecord, 'id'>) => Promise<void>;
  updateCorrespondentRecord: (id: number | string, record: Partial<AppCorrespondentRecord>) => Promise<void>;
  deleteCorrespondentRecord: (id: number | string) => Promise<void>;
  
  setTransportData: (data: AppTransportRecord[]) => void;
  addTransportRecord: (record: Omit<AppTransportRecord, 'id'>) => Promise<void>;
  updateTransportRecord: (id: number | string, record: Partial<AppTransportRecord>) => Promise<void>;
  deleteTransportRecord: (id: number | string) => Promise<void>;
  
  setFinanceData: (data: AppFinanceRecord[]) => void;
  addFinanceRecord: (record: Omit<AppFinanceRecord, 'id'>) => Promise<void>;
  updateFinanceRecord: (id: number | string, record: Partial<AppFinanceRecord>) => Promise<void>;
  deleteFinanceRecord: (id: number | string) => Promise<void>;
  
  // Categories data and functions
  categories: AppCategory[];
  isCategoriesLoading: boolean;
  categoriesError: string | null;
  syncCategories: () => Promise<void>;
  addCategory: (category: Omit<AppCategory, 'id'>) => Promise<void>;
  updateCategory: (id: number | string, category: Partial<AppCategory>) => Promise<void>;
  deleteCategory: (id: number | string) => Promise<void>;
  setCategories: (data: AppCategory[]) => void;
  
  setDomesticData: (data: any[]) => void;
}

export const useStore = create<AppState>((set, get) => ({
  // Navigation state
  currentPage: '/',
  setCurrentPage: (page) => set({ currentPage: page }),
  
  // Theme state
  theme: 'light',
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
  
  // Section data
  correspondentData: [],
  transportData: [],
  financeData: [],
  domesticData: [],
  
  // Loading states
  isCorrespondentDataLoading: false,
  correspondentDataError: null,
  
  // Sync data from Firebase
  syncCorrespondentData: async () => {
    try {
      set({ isCorrespondentDataLoading: true, correspondentDataError: null });
      const firebaseRecords = await getAllCorrespondentRecords();
      
      // Convert Firebase records to app format
      const convertedRecords: AppCorrespondentRecord[] = firebaseRecords.map(record => {
        // Explicit type conversion
        const appRecord: AppCorrespondentRecord = {
          id: record.id || Date.now(), // fallback if no id
          date: record.date,
          incomingNumber: record.incomingNumber,
          subject: record.subject,
          outgoingNumber: record.outgoingNumber,
          from: record.from,
          to: record.to,
          signedBy: record.signedBy
        };
        return appRecord;
      });
      
      set({ 
        correspondentData: convertedRecords,
        isCorrespondentDataLoading: false 
      });
    } catch (error) {
      console.error('Error syncing correspondent data:', error);
      set({ 
        correspondentDataError: (error as Error).message || 'Error syncing data',
        isCorrespondentDataLoading: false 
      });
      throw error;
    }
  },
  
  // Actions to update correspondent data
  setCorrespondentData: (data) => set({ correspondentData: data }),
  
  addCorrespondentRecord: async (record) => {
    try {
      // First, add to Firebase
      const firebaseRecord: Omit<FirebaseCorrespondentRecord, 'id'> = {
        date: record.date,
        incomingNumber: record.incomingNumber,
        subject: record.subject,
        outgoingNumber: record.outgoingNumber,
        from: record.from,
        to: record.to,
        signedBy: record.signedBy
      };
      
      const firebaseId = await firebaseAddCorrespondentRecord(firebaseRecord);
      
      // Then add to local state with Firebase ID
      const newRecord: AppCorrespondentRecord = {
        ...record,
        id: firebaseId
      };
      
      set((state) => ({
        correspondentData: [...state.correspondentData, newRecord]
      }));
    } catch (error) {
      console.error('Error adding correspondent record:', error);
      throw error;
    }
  },
  
  updateCorrespondentRecord: async (id, updatedFields) => {
    try {
      // Update in Firebase - need to convert our record type to match Firebase service
      // Create a new object without the id property to avoid type conflicts
      const firebaseData: Partial<Omit<FirebaseCorrespondentRecord, 'id'>> = {
        date: updatedFields.date,
        incomingNumber: updatedFields.incomingNumber,
        subject: updatedFields.subject,
        outgoingNumber: updatedFields.outgoingNumber,
        from: updatedFields.from,
        to: updatedFields.to,
        signedBy: updatedFields.signedBy
      };
      // Remove any undefined values
      Object.keys(firebaseData).forEach(key => {
        // @ts-ignore - we're filtering out undefined values
        if (firebaseData[key] === undefined) delete firebaseData[key];
      });
      
      await firebaseUpdateCorrespondentRecord(id.toString(), firebaseData);
      
      // Then update local state
      set((state) => ({
        correspondentData: state.correspondentData.map(record =>
          record.id === id ? { ...record, ...updatedFields } : record
        )
      }));
    } catch (error) {
      console.error('Error updating correspondent record:', error);
      throw error;
    }
  },
  
  deleteCorrespondentRecord: async (id) => {
    try {
      // Delete from Firebase - convert id to string
      await firebaseDeleteCorrespondentRecord(id.toString());
      
      // Then remove from local state
      set((state) => ({
        correspondentData: state.correspondentData.filter(record => record.id !== id)
      }));
    } catch (error) {
      console.error('Error deleting correspondent record:', error);
      throw error;
    }
  },
  
  // Loading states for transport data
  isTransportDataLoading: false,
  transportDataError: null,
  
  // Transport sync actions
  syncTransportData: async () => {
    try {
      set({ isTransportDataLoading: true, transportDataError: null });
      const firebaseRecords = await getAllTransportRecords();
      
      // Convert Firebase records to app format
      const convertedRecords: AppTransportRecord[] = firebaseRecords.map(record => {
        // Explicit type conversion
        const appRecord: AppTransportRecord = {
          id: record.id || Date.now().toString(), // fallback if no id
          shippingDate: record.shippingDate,
          departureDate: record.departureDate,
          arrivalDate: record.arrivalDate,
          cargoName: record.cargoName,
          driver: record.driver,
          carNumber: record.carNumber,
          driverLicense: record.driverLicense,
          shippingWeight: record.shippingWeight,
          deliveryWeight: record.deliveryWeight
        };
        return appRecord;
      });
      
      set({ 
        transportData: convertedRecords,
        isTransportDataLoading: false 
      });
    } catch (error) {
      console.error('Error syncing transport data:', error);
      set({ 
        transportDataError: (error as Error).message || 'Error syncing data',
        isTransportDataLoading: false 
      });
      throw error;
    }
  },
  
  // Actions to update transport data
  setTransportData: (data) => set({ transportData: data }),
  
  addTransportRecord: async (record) => {
    try {
      // First, add to Firebase
      const firebaseRecord: Omit<FirebaseTransportRecord, 'id'> = {
        shippingDate: record.shippingDate,
        departureDate: record.departureDate,
        arrivalDate: record.arrivalDate,
        cargoName: record.cargoName,
        driver: record.driver,
        carNumber: record.carNumber,
        driverLicense: record.driverLicense,
        shippingWeight: record.shippingWeight,
        deliveryWeight: record.deliveryWeight
      };
      
      const firebaseId = await firebaseAddTransportRecord(firebaseRecord);
      
      // Then add to local state with Firebase ID
      const newRecord: AppTransportRecord = {
        ...record,
        id: firebaseId
      };
      
      set((state) => ({
        transportData: [...state.transportData, newRecord]
      }));
    } catch (error) {
      console.error('Error adding transport record:', error);
      throw error;
    }
  },
  
  updateTransportRecord: async (id, updatedFields) => {
    try {
      // Update in Firebase - need to convert our record type to match Firebase service
      // Create a new object without the id property to avoid type conflicts
      const firebaseData: Partial<Omit<FirebaseTransportRecord, 'id'>> = {
        shippingDate: updatedFields.shippingDate,
        departureDate: updatedFields.departureDate,
        arrivalDate: updatedFields.arrivalDate,
        cargoName: updatedFields.cargoName,
        driver: updatedFields.driver,
        carNumber: updatedFields.carNumber,
        driverLicense: updatedFields.driverLicense,
        shippingWeight: updatedFields.shippingWeight,
        deliveryWeight: updatedFields.deliveryWeight
      };
      // Remove any undefined values
      Object.keys(firebaseData).forEach(key => {
        // @ts-ignore - we're filtering out undefined values
        if (firebaseData[key] === undefined) delete firebaseData[key];
      });
      
      await firebaseUpdateTransportRecord(id.toString(), firebaseData);
      
      // Then update local state
      set((state) => ({
        transportData: state.transportData.map(record =>
          record.id === id ? { ...record, ...updatedFields } : record
        )
      }));
    } catch (error) {
      console.error('Error updating transport record:', error);
      throw error;
    }
  },
  
  deleteTransportRecord: async (id) => {
    try {
      // Delete from Firebase - convert id to string
      await firebaseDeleteTransportRecord(id.toString());
      
      // Then remove from local state
      set((state) => ({
        transportData: state.transportData.filter(record => record.id !== id)
      }));
    } catch (error) {
      console.error('Error deleting transport record:', error);
      throw error;
    }
  },
  
  // Loading states for finance data
  isFinanceDataLoading: false,
  financeDataError: null,
  
  // Finance sync actions
  syncFinanceData: async () => {
    try {
      set({ isFinanceDataLoading: true, financeDataError: null });
      const firebaseRecords = await getAllFinanceRecords();
      
      // Convert Firebase records to app format
      const convertedRecords: AppFinanceRecord[] = firebaseRecords.map(record => {
        // Explicit type conversion
        const appRecord: AppFinanceRecord = {
          id: record.id || Date.now().toString(), // fallback if no id
          date: record.date,
          name: record.name,
          price: record.price,
          quantity: record.quantity,
          total: record.total,
          classification: record.classification,
          comment: record.comment
        };
        return appRecord;
      });
      
      set({ 
        financeData: convertedRecords,
        isFinanceDataLoading: false 
      });
    } catch (error) {
      console.error('Error syncing finance data:', error);
      set({ 
        financeDataError: (error as Error).message || 'Error syncing data',
        isFinanceDataLoading: false 
      });
      throw error;
    }
  },
  
  // Actions to update finance data
  setFinanceData: (data) => set({ financeData: data }),
  
  addFinanceRecord: async (record) => {
    try {
      // First, add to Firebase
      const firebaseRecord: Omit<FirebaseFinanceRecord, 'id'> = {
        date: record.date,
        name: record.name,
        price: record.price,
        quantity: record.quantity,
        total: record.total,
        classification: record.classification,
        comment: record.comment
      };
      
      const firebaseId = await firebaseAddFinanceRecord(firebaseRecord);
      
      // Then add to local state with Firebase ID
      const newRecord: AppFinanceRecord = {
        ...record,
        id: firebaseId
      };
      
      set((state) => ({
        financeData: [...state.financeData, newRecord]
      }));
    } catch (error) {
      console.error('Error adding finance record:', error);
      throw error;
    }
  },
  
  updateFinanceRecord: async (id, updatedFields) => {
    try {
      // Update in Firebase - need to convert our record type to match Firebase service
      // Create a new object without the id property to avoid type conflicts
      const firebaseData: Partial<Omit<FirebaseFinanceRecord, 'id'>> = {
        date: updatedFields.date,
        name: updatedFields.name,
        price: updatedFields.price,
        quantity: updatedFields.quantity,
        total: updatedFields.total,
        classification: updatedFields.classification,
        comment: updatedFields.comment
      };
      // Remove any undefined values
      Object.keys(firebaseData).forEach(key => {
        // @ts-ignore - we're filtering out undefined values
        if (firebaseData[key] === undefined) delete firebaseData[key];
      });
      
      await firebaseUpdateFinanceRecord(id.toString(), firebaseData);
      
      // Then update local state
      set((state) => ({
        financeData: state.financeData.map(record =>
          record.id === id ? { ...record, ...updatedFields } : record
        )
      }));
    } catch (error) {
      console.error('Error updating finance record:', error);
      throw error;
    }
  },
  
  deleteFinanceRecord: async (id) => {
    try {
      // Delete from Firebase - convert id to string
      await firebaseDeleteFinanceRecord(id.toString());
      
      // Then remove from local state
      set((state) => ({
        financeData: state.financeData.filter(record => record.id !== id)
      }));
    } catch (error) {
      console.error('Error deleting finance record:', error);
      throw error;
    }
  },
  
  // Loading states for categories
  categories: [],
  isCategoriesLoading: false,
  categoriesError: null,
  
  // Categories sync actions
  syncCategories: async () => {
    try {
      set({ isCategoriesLoading: true, categoriesError: null });
      const firebaseCategories = await getAllCategories();
      
      // Convert Firebase categories to app format
      const convertedCategories: AppCategory[] = firebaseCategories.map(category => {
        // Explicit type conversion
        const appCategory: AppCategory = {
          id: category.id || Date.now().toString(), // fallback if no id
          name: category.name,
          description: category.description,
          type: category.type
        };
        return appCategory;
      });
      
      set({ 
        categories: convertedCategories,
        isCategoriesLoading: false 
      });
    } catch (error) {
      console.error('Error syncing categories:', error);
      set({ 
        categoriesError: (error as Error).message || 'Error syncing categories',
        isCategoriesLoading: false 
      });
      throw error;
    }
  },
  
  // Actions to update categories
  setCategories: (data) => set({ categories: data }),
  
  addCategory: async (category) => {
    try {
      // First, add to Firebase
      const firebaseCategory: Omit<FirebaseCategory, 'id'> = {
        name: category.name,
        description: category.description,
        type: category.type
      };
      
      const firebaseId = await firebaseAddCategory(firebaseCategory);
      
      // Then add to local state with Firebase ID
      const newCategory: AppCategory = {
        ...category,
        id: firebaseId
      };
      
      set((state) => ({
        categories: [...state.categories, newCategory]
      }));
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  },
  
  updateCategory: async (id, updatedFields) => {
    try {
      // Update in Firebase - need to convert our record type to match Firebase service
      // Create a new object without the id property to avoid type conflicts
      const firebaseData: Partial<Omit<FirebaseCategory, 'id'>> = {
        name: updatedFields.name,
        description: updatedFields.description,
        type: updatedFields.type
      };
      // Remove any undefined values
      Object.keys(firebaseData).forEach(key => {
        // @ts-ignore - we're filtering out undefined values
        if (firebaseData[key] === undefined) delete firebaseData[key];
      });
      
      await firebaseUpdateCategory(id.toString(), firebaseData);
      
      // Then update local state
      set((state) => ({
        categories: state.categories.map(category =>
          category.id === id ? { ...category, ...updatedFields } : category
        )
      }));
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },
  
  deleteCategory: async (id) => {
    try {
      // Delete from Firebase - convert id to string
      await firebaseDeleteCategory(id.toString());
      
      // Then remove from local state
      set((state) => ({
        categories: state.categories.filter(category => category.id !== id)
      }));
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  },
  
  setDomesticData: (data) => set({ domesticData: data }),
}));