// src/store/useStore.ts
import { create } from 'zustand';
import {
  // Finance services
  getAllFinanceRecords,
  addFinanceRecord as firebaseAddFinanceRecord,
  updateFinanceRecord as firebaseUpdateFinanceRecord,
  deleteFinanceRecord as firebaseDeleteFinanceRecord,
  // Category services
  getAllCategories,
  addCategory as firebaseAddCategory,
  updateCategory as firebaseUpdateCategory,
  deleteCategory as firebaseDeleteCategory,
  // Vehicle services
  getAllVehicleRecords,
  addVehicleRecord as firebaseAddVehicleRecord,
  updateVehicleRecord as firebaseUpdateVehicleRecord,
  deleteVehicleRecord as firebaseDeleteVehicleRecord,
  // Maintenance services
  getAllMaintenanceRecords,
  addMaintenanceRecord as firebaseAddMaintenanceRecord,
  updateMaintenanceRecord as firebaseUpdateMaintenanceRecord,
  deleteMaintenanceRecord as firebaseDeleteMaintenanceRecord,
  // Household services
  getAllHouseholdRecords,
  addHouseholdRecord as firebaseAddHouseholdRecord,
  updateHouseholdRecord as firebaseUpdateHouseholdRecord,
  deleteHouseholdRecord as firebaseDeleteHouseholdRecord,
  // Period services
  getAllPeriodEvents,
  addPeriodEvent as firebaseAddPeriodEvent,
  updatePeriodEvent as firebaseUpdatePeriodEvent,
  deletePeriodEvent as firebaseDeletePeriodEvent,
  // Recipe services
  getAllRecipeRecords,
  addRecipeRecord as firebaseAddRecipeRecord,
  updateRecipeRecord as firebaseUpdateRecipeRecord,
  deleteRecipeRecord as firebaseDeleteRecipeRecord,
} from '../firebase/services';

// Общие интерфейсы
export interface BaseEntity {
  id: number | string;
}


export interface AppFinanceRecord extends BaseEntity {
  date: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
  classification: string;
  comment: string;
}

export interface AppCategory extends BaseEntity {
 name: string;
 description?: string;
 type: 'expense' | 'income';
}

export interface AppVehicleRecord extends BaseEntity {
  name: string;
  manufacturer: string;
  model: string;
  engineVolume?: string;
  engineNumber?: string;
  vin?: string;
  stsData?: string;
  ptsData?: string;
}

export interface AppMaintenanceRecord extends BaseEntity {
  vehicleId: string;
  vehicleName?: string;
  date: string;
  workType: string;
  cost: number;
  quantity?: number;
  comment: string;
  frequency: string;
  mileage?: number;
}

export interface AppHouseholdRecord extends BaseEntity {
  date: string;
  description: string;
  area: string;
  completed?: boolean;
}

export interface AppPeriodEvent extends BaseEntity {
  date: string;
  description?: string;
  category?: string;
}

export interface AppRecipeRecord extends BaseEntity {
  title: string;
  category: string;
  ingredients: string;
  instructions: string;
  cookingTime?: number;
  servings?: number;
  tags?: string[];
  date?: string;
}

// Интерфейс общего состояния
interface AppState {
  // Navigation state
  currentPage: string;
 setCurrentPage: (page: string) => void;

  // User preferences
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Data for the different sections
  vehicleData: AppVehicleRecord[];
  maintenanceData: AppMaintenanceRecord[];
  financeData: AppFinanceRecord[];
  householdData: AppHouseholdRecord[];
  periodData: AppPeriodEvent[];
  recipeData: AppRecipeRecord[];

  // Loading states
  isVehicleDataLoading: boolean;
  isMaintenanceDataLoading: boolean;
  isFinanceDataLoading: boolean;
  isHouseholdDataLoading: boolean;
  isPeriodDataLoading: boolean;
  isRecipeDataLoading: boolean;
  vehicleDataError: string | null;
  maintenanceDataError: string | null;
  financeDataError: string | null;
  householdDataError: string | null;
  periodDataError: string | null;
  recipeDataError: string | null;

  // Firebase sync actions
  syncVehicleData: () => Promise<void>;
  syncMaintenanceData: () => Promise<void>;
  syncFinanceData: () => Promise<void>;
  syncHouseholdData: () => Promise<void>;
  syncPeriodData: () => Promise<void>;
  syncRecipeData: () => Promise<void>;

  // Vehicle data and functions
  setVehicleData: (data: AppVehicleRecord[]) => void;
  addVehicleRecord: (record: Omit<AppVehicleRecord, 'id'>) => Promise<void>;
  updateVehicleRecord: (id: number | string, record: Partial<AppVehicleRecord>) => Promise<void>;
  deleteVehicleRecord: (id: number | string) => Promise<void>;

  // Recipe data and functions
  setRecipeData: (data: AppRecipeRecord[]) => void;
  addRecipeRecord: (record: Omit<AppRecipeRecord, 'id'>) => Promise<void>;
  updateRecipeRecord: (id: number | string, record: Partial<AppRecipeRecord>) => Promise<void>;
  deleteRecipeRecord: (id: number | string) => Promise<void>;

  // Maintenance data and functions
  setMaintenanceData: (data: AppMaintenanceRecord[]) => void;
  addMaintenanceRecord: (record: Omit<AppMaintenanceRecord, 'id'>) => Promise<void>;
  updateMaintenanceRecord: (id: number | string, record: Partial<AppMaintenanceRecord>) => Promise<void>;
  deleteMaintenanceRecord: (id: number | string) => Promise<void>;

  // Finance data and functions
  setFinanceData: (data: AppFinanceRecord[]) => void;
  addFinanceRecord: (record: Omit<AppFinanceRecord, 'id'>) => Promise<void>;
  updateFinanceRecord: (id: number | string, record: Partial<AppFinanceRecord>) => Promise<void>;
  deleteFinanceRecord: (id: number | string) => Promise<void>;

  // Household data and functions
  setHouseholdData: (data: AppHouseholdRecord[]) => void;
  addHouseholdRecord: (record: Omit<AppHouseholdRecord, 'id'>) => Promise<void>;
  updateHouseholdRecord: (id: number | string, record: Partial<AppHouseholdRecord>) => Promise<void>;
  deleteHouseholdRecord: (id: number | string) => Promise<void>;

  // Period data and functions
  setPeriodData: (data: AppPeriodEvent[]) => void;
  addPeriodEvent: (record: Omit<AppPeriodEvent, 'id'>) => Promise<void>;
  updatePeriodEvent: (id: number | string, record: Partial<AppPeriodEvent>) => Promise<void>;
  deletePeriodEvent: (id: number | string) => Promise<void>;

  // Categories data and functions
 categories: AppCategory[];
  isCategoriesLoading: boolean;
  categoriesError: string | null;
  syncCategories: () => Promise<void>;
  addCategory: (category: Omit<AppCategory, 'id'>) => Promise<void>;
  updateCategory: (id: number | string, category: Partial<AppCategory>) => Promise<void>;
  deleteCategory: (id: number | string) => Promise<void>;
  setCategories: (data: AppCategory[]) => void;
}

// Общий CRUD слой для сущностей
type EntityServices<F, T> = {
  getAll: () => Promise<F[]>;
  addFirebase: (record: any) => Promise<string>;
  updateFirebase: (id: string, record: any) => Promise<void>;
  deleteFirebase: (id: string) => Promise<void>;
  convertToApp: (firebaseRecord: F) => T;
  convertToFirebase: (appRecord: Omit<T, 'id'>) => any;
  convertToUpdate: (partial: Partial<T>) => any;
};

type EntityHandlers<T extends BaseEntity> = {
  sync: () => Promise<void>;
  add: (record: Omit<T, 'id'>) => Promise<void>;
  update: (id: number | string, record: Partial<T>) => Promise<void>;
  delete: (id: number | string) => Promise<void>;
};

function createEntityHandlers<F, T extends BaseEntity>(
  services: EntityServices<F, T>,
  setLoading: (loading: boolean) => void,
  setError: (error: string | null) => void,
  setData: (data: T[]) => void,
  getData: () => T[]
): EntityHandlers<T> {
  return {
    sync: async () => {
      try {
        setLoading(true);
        setError(null);
        const firebaseRecords = await services.getAll();
        const convertedRecords: T[] = firebaseRecords.map(services.convertToApp);
        setData(convertedRecords);
        setLoading(false);
      } catch (error) {
        console.error('Error syncing data:', error);
        setError((error as Error).message || 'Error syncing data');
        setLoading(false);
        throw error;
      }
    },

    add: async (record: Omit<T, 'id'>) => {
      try {
        const firebaseRecord = services.convertToFirebase(record);
        const firebaseId = await services.addFirebase(firebaseRecord);
        
        const newRecord = {
          ...record,
          id: firebaseId
        } as T;
        
        setData([newRecord, ...getData()]);
      } catch (error) {
        console.error('Error adding record:', error);
        throw error;
      }
    },

    update: async (id: number | string, updatedFields: Partial<T>) => {
      try {
        const firebaseData = services.convertToUpdate(updatedFields);
        await services.updateFirebase(id.toString(), firebaseData);
        
        setData(getData().map(record =>
          record.id === id ? { ...record, ...updatedFields } : record
        ));
      } catch (error) {
        console.error('Error updating record:', error);
        throw error;
      }
    },

    delete: async (id: number | string) => {
      try {
        await services.deleteFirebase(id.toString());
        setData(getData().filter(record => record.id !== id));
      } catch (error) {
        console.error('Error deleting record:', error);
        throw error;
      }
    }
  };
}

export const useStore = create<AppState>((set, get) => {
  // Navigation state
  const navigationState = {
    currentPage: '/',
    setCurrentPage: (page: string) => set({ currentPage: page }),
  };
  
  // Theme state
  const themeState = {
    theme: 'light' as const,
    toggleTheme: () => set((state: AppState) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
  };
  
  // Common state setters
  const stateSetters = {
    setVehicleData: (data: AppVehicleRecord[]) => set({ vehicleData: data }),
    setMaintenanceData: (data: AppMaintenanceRecord[]) => set({ maintenanceData: data }),
    setFinanceData: (data: AppFinanceRecord[]) => set({ financeData: data }),
    setHouseholdData: (data: AppHouseholdRecord[]) => set({ householdData: data }),
    setPeriodData: (data: AppPeriodEvent[]) => set({ periodData: data }),
    setRecipeData: (data: AppRecipeRecord[]) => set({ recipeData: data }),
    setCategories: (data: AppCategory[]) => set({ categories: data }),
  };
  
  // Initial state
  const initialState = {
    // Section data
    vehicleData: [],
    maintenanceData: [],
    financeData: [],
    householdData: [],
    periodData: [],
    recipeData: [],

    // Loading states
    isVehicleDataLoading: false,
    isMaintenanceDataLoading: false,
    isFinanceDataLoading: false,
    isHouseholdDataLoading: false,
    isPeriodDataLoading: false,
    isRecipeDataLoading: false,
    vehicleDataError: null,
    maintenanceDataError: null,
    financeDataError: null,
    householdDataError: null,
    periodDataError: null,
    recipeDataError: null,

    // Categories state
    categories: [],
    isCategoriesLoading: false,
    categoriesError: null,
  };
  
  
  const vehicleHandlers = createEntityHandlers(
    {
      getAll: getAllVehicleRecords,
      addFirebase: firebaseAddVehicleRecord,
      updateFirebase: firebaseUpdateVehicleRecord,
      deleteFirebase: firebaseDeleteVehicleRecord,
      convertToApp: (firebaseRecord) => ({
        id: firebaseRecord.id || Date.now().toString(),
        name: firebaseRecord.name,
        manufacturer: firebaseRecord.manufacturer,
        model: firebaseRecord.model,
        engineVolume: firebaseRecord.engineVolume,
        engineNumber: firebaseRecord.engineNumber,
        vin: firebaseRecord.vin,
        stsData: firebaseRecord.stsData,
        ptsData: firebaseRecord.ptsData
      }),
      convertToFirebase: (appRecord) => ({
        name: appRecord.name,
        manufacturer: appRecord.manufacturer,
        model: appRecord.model,
        engineVolume: appRecord.engineVolume,
        engineNumber: appRecord.engineNumber,
        vin: appRecord.vin,
        stsData: appRecord.stsData,
        ptsData: appRecord.ptsData
      }),
      convertToUpdate: (partial) => ({
        name: partial.name,
        manufacturer: partial.manufacturer,
        model: partial.model,
        engineVolume: partial.engineVolume,
        engineNumber: partial.engineNumber,
        vin: partial.vin,
        stsData: partial.stsData,
        ptsData: partial.ptsData
      })
    },
    (loading) => set({ isVehicleDataLoading: loading }),
    (error) => set({ vehicleDataError: error }),
    (data) => set({ vehicleData: data }),
    () => get().vehicleData
  );
  
  const maintenanceHandlers = createEntityHandlers(
    {
      getAll: getAllMaintenanceRecords,
      addFirebase: firebaseAddMaintenanceRecord,
      updateFirebase: firebaseUpdateMaintenanceRecord,
      deleteFirebase: firebaseDeleteMaintenanceRecord,
      convertToApp: (firebaseRecord) => ({
        id: firebaseRecord.id || Date.now().toString(),
        vehicleId: firebaseRecord.vehicleId,
        date: firebaseRecord.date,
        workType: firebaseRecord.workType,
        cost: firebaseRecord.cost,
        quantity: firebaseRecord.quantity,
        comment: firebaseRecord.comment,
        frequency: firebaseRecord.frequency,
        mileage: firebaseRecord.mileage
      }),
      convertToFirebase: (appRecord) => ({
        vehicleId: appRecord.vehicleId,
        date: appRecord.date,
        workType: appRecord.workType,
        cost: appRecord.cost,
        quantity: appRecord.quantity,
        comment: appRecord.comment,
        frequency: appRecord.frequency,
        mileage: appRecord.mileage
      }),
      convertToUpdate: (partial) => ({
        vehicleId: partial.vehicleId,
        date: partial.date,
        workType: partial.workType,
        cost: partial.cost,
        quantity: partial.quantity,
        comment: partial.comment,
        frequency: partial.frequency,
        mileage: partial.mileage
      })
    },
    (loading) => set({ isMaintenanceDataLoading: loading }),
    (error) => set({ maintenanceDataError: error }),
    (data) => set({ maintenanceData: data }),
    () => get().maintenanceData
  );
  
  const financeHandlers = createEntityHandlers(
    {
      getAll: getAllFinanceRecords,
      addFirebase: firebaseAddFinanceRecord,
      updateFirebase: firebaseUpdateFinanceRecord,
      deleteFirebase: firebaseDeleteFinanceRecord,
      convertToApp: (firebaseRecord) => ({
        id: firebaseRecord.id || Date.now().toString(),
        date: firebaseRecord.date,
        name: firebaseRecord.name,
        price: firebaseRecord.price,
        quantity: firebaseRecord.quantity,
        total: firebaseRecord.total,
        classification: firebaseRecord.classification,
        comment: firebaseRecord.comment
      }),
      convertToFirebase: (appRecord) => ({
        date: appRecord.date,
        name: appRecord.name,
        price: appRecord.price,
        quantity: appRecord.quantity,
        total: appRecord.total,
        classification: appRecord.classification,
        comment: appRecord.comment
      }),
      convertToUpdate: (partial) => ({
        date: partial.date,
        name: partial.name,
        price: partial.price,
        quantity: partial.quantity,
        total: partial.total,
        classification: partial.classification,
        comment: partial.comment
      })
    },
    (loading) => set({ isFinanceDataLoading: loading }),
    (error) => set({ financeDataError: error }),
    (data) => set({ financeData: data }),
    () => get().financeData
 );
  
  const householdHandlers = createEntityHandlers(
    {
      getAll: getAllHouseholdRecords,
      addFirebase: firebaseAddHouseholdRecord,
      updateFirebase: firebaseUpdateHouseholdRecord,
      deleteFirebase: firebaseDeleteHouseholdRecord,
      convertToApp: (firebaseRecord) => ({
        id: firebaseRecord.id || Date.now().toString(),
        date: firebaseRecord.date,
        description: firebaseRecord.description,
        area: firebaseRecord.area,
        completed: firebaseRecord.completed || false
      }),
      convertToFirebase: (appRecord) => ({
        date: appRecord.date,
        description: appRecord.description,
        area: appRecord.area,
        completed: appRecord.completed || false
      }),
      convertToUpdate: (partial) => ({
        date: partial.date,
        description: partial.description,
        area: partial.area,
        completed: partial.completed
      })
    },
    (loading) => set({ isHouseholdDataLoading: loading }),
    (error) => set({ householdDataError: error }),
    (data) => set({ householdData: data }),
    () => get().householdData
 );

  const periodHandlers = createEntityHandlers(
    {
      getAll: getAllPeriodEvents,
      addFirebase: firebaseAddPeriodEvent,
      updateFirebase: firebaseUpdatePeriodEvent,
      deleteFirebase: firebaseDeletePeriodEvent,
      convertToApp: (firebaseRecord) => ({
        id: firebaseRecord.id || Date.now().toString(),
        date: firebaseRecord.date,
        description: firebaseRecord.description,
        category: firebaseRecord.category
      }),
      convertToFirebase: (appRecord) => ({
        date: appRecord.date,
        description: appRecord.description,
        category: appRecord.category
      }),
      convertToUpdate: (partial) => ({
        date: partial.date,
        description: partial.description,
        category: partial.category
      })
    },
    (loading) => set({ isPeriodDataLoading: loading }),
    (error) => set({ periodDataError: error }),
    (data) => set({ periodData: data }),
    () => get().periodData
 );

  const recipeHandlers = createEntityHandlers(
    {
      getAll: getAllRecipeRecords,
      addFirebase: firebaseAddRecipeRecord,
      updateFirebase: firebaseUpdateRecipeRecord,
      deleteFirebase: firebaseDeleteRecipeRecord,
      convertToApp: (firebaseRecord) => ({
        id: firebaseRecord.id || Date.now().toString(),
        title: firebaseRecord.title,
        category: firebaseRecord.category,
        ingredients: firebaseRecord.ingredients,
        instructions: firebaseRecord.instructions,
        cookingTime: firebaseRecord.cookingTime,
        servings: firebaseRecord.servings,
        tags: firebaseRecord.tags,
        date: firebaseRecord.date
      }),
      convertToFirebase: (appRecord) => ({
        title: appRecord.title,
        category: appRecord.category,
        ingredients: appRecord.ingredients,
        instructions: appRecord.instructions,
        cookingTime: appRecord.cookingTime,
        servings: appRecord.servings,
        tags: appRecord.tags,
        date: appRecord.date
      }),
      convertToUpdate: (partial) => ({
        title: partial.title,
        category: partial.category,
        ingredients: partial.ingredients,
        instructions: partial.instructions,
        cookingTime: partial.cookingTime,
        servings: partial.servings,
        tags: partial.tags,
        date: partial.date
      })
    },
    (loading) => set({ isRecipeDataLoading: loading }),
    (error) => set({ recipeDataError: error }),
    (data) => set({ recipeData: data }),
    () => get().recipeData
  );

  const categoryHandlers = createEntityHandlers(
    {
      getAll: getAllCategories,
      addFirebase: firebaseAddCategory,
      updateFirebase: firebaseUpdateCategory,
      deleteFirebase: firebaseDeleteCategory,
      convertToApp: (firebaseCategory) => ({
        id: firebaseCategory.id || Date.now().toString(),
        name: firebaseCategory.name,
        description: firebaseCategory.description,
        type: firebaseCategory.type
      }),
      convertToFirebase: (appCategory) => ({
        name: appCategory.name,
        description: appCategory.description,
        type: appCategory.type
      }),
      convertToUpdate: (partial) => ({
        name: partial.name,
        description: partial.description,
        type: partial.type
      })
    },
    (loading) => set({ isCategoriesLoading: loading }),
    (error) => set({ categoriesError: error }),
    (data) => set({ categories: data }),
    () => get().categories
  );

  return {
    ...navigationState,
    ...themeState,
    ...initialState,
    ...stateSetters,

    // Sync functions
    syncVehicleData: vehicleHandlers.sync,
    syncMaintenanceData: maintenanceHandlers.sync,
    syncFinanceData: financeHandlers.sync,
    syncHouseholdData: householdHandlers.sync,
    syncPeriodData: periodHandlers.sync,
    syncRecipeData: recipeHandlers.sync,
    syncCategories: categoryHandlers.sync,

    // Add functions
    addVehicleRecord: vehicleHandlers.add,
    addMaintenanceRecord: maintenanceHandlers.add,
    addFinanceRecord: financeHandlers.add,
    addHouseholdRecord: householdHandlers.add,
    addPeriodEvent: periodHandlers.add,
    addRecipeRecord: recipeHandlers.add,
    addCategory: categoryHandlers.add,

    // Update functions
    updateVehicleRecord: vehicleHandlers.update,
    updateMaintenanceRecord: maintenanceHandlers.update,
    updateFinanceRecord: financeHandlers.update,
    updateHouseholdRecord: householdHandlers.update,
    updatePeriodEvent: periodHandlers.update,
    updateRecipeRecord: recipeHandlers.update,
    updateCategory: categoryHandlers.update,

    // Delete functions
    deleteVehicleRecord: vehicleHandlers.delete,
    deleteMaintenanceRecord: maintenanceHandlers.delete,
    deleteFinanceRecord: financeHandlers.delete,
    deleteHouseholdRecord: householdHandlers.delete,
    deletePeriodEvent: periodHandlers.delete,
    deleteRecipeRecord: recipeHandlers.delete,
    deleteCategory: categoryHandlers.delete,
  };
});