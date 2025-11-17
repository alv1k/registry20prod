// src/store/useStore.ts
import { create } from 'zustand';
import {
  getAllCorrespondentRecords,
  addCorrespondentRecord as firebaseAddCorrespondentRecord,
  updateCorrespondentRecord as firebaseUpdateCorrespondentRecord,
  deleteCorrespondentRecord as firebaseDeleteCorrespondentRecord,
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
} from '../firebase/services';

// Общие интерфейсы
export interface BaseEntity {
  id: number | string;
}

export interface AppCorrespondentRecord extends BaseEntity {
  date: string;
  incomingNumber: string;
  subject: string;
  outgoingNumber: string;
  from: string;
  to: string;
  signedBy: string;
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

// Интерфейс общего состояния
interface AppState {
  // Navigation state
  currentPage: string;
 setCurrentPage: (page: string) => void;

  // User preferences
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Data for the different sections
  correspondentData: AppCorrespondentRecord[];
  vehicleData: AppVehicleRecord[];
  maintenanceData: AppMaintenanceRecord[];
  financeData: AppFinanceRecord[];
  householdData: AppHouseholdRecord[];
  periodData: AppPeriodEvent[];

  // Loading states
  isCorrespondentDataLoading: boolean;
  isVehicleDataLoading: boolean;
  isMaintenanceDataLoading: boolean;
  isFinanceDataLoading: boolean;
  isHouseholdDataLoading: boolean;
  isPeriodDataLoading: boolean;
  correspondentDataError: string | null;
  vehicleDataError: string | null;
  maintenanceDataError: string | null;
  financeDataError: string | null;
  householdDataError: string | null;
  periodDataError: string | null;

  // Firebase sync actions
  syncCorrespondentData: () => Promise<void>;
  syncVehicleData: () => Promise<void>;
  syncMaintenanceData: () => Promise<void>;
  syncFinanceData: () => Promise<void>;
  syncHouseholdData: () => Promise<void>;
  syncPeriodData: () => Promise<void>;

  // Actions to update data (with Firebase sync)
  setCorrespondentData: (data: AppCorrespondentRecord[]) => void;
  addCorrespondentRecord: (record: Omit<AppCorrespondentRecord, 'id'>) => Promise<void>;
  updateCorrespondentRecord: (id: number | string, record: Partial<AppCorrespondentRecord>) => Promise<void>;
  deleteCorrespondentRecord: (id: number | string) => Promise<void>;

  // Vehicle data and functions
  setVehicleData: (data: AppVehicleRecord[]) => void;
  addVehicleRecord: (record: Omit<AppVehicleRecord, 'id'>) => Promise<void>;
  updateVehicleRecord: (id: number | string, record: Partial<AppVehicleRecord>) => Promise<void>;
  deleteVehicleRecord: (id: number | string) => Promise<void>;

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
    setCorrespondentData: (data: AppCorrespondentRecord[]) => set({ correspondentData: data }),
    setVehicleData: (data: AppVehicleRecord[]) => set({ vehicleData: data }),
    setMaintenanceData: (data: AppMaintenanceRecord[]) => set({ maintenanceData: data }),
    setFinanceData: (data: AppFinanceRecord[]) => set({ financeData: data }),
    setHouseholdData: (data: AppHouseholdRecord[]) => set({ householdData: data }),
    setPeriodData: (data: AppPeriodEvent[]) => set({ periodData: data }),
    setCategories: (data: AppCategory[]) => set({ categories: data }),
  };
  
  // Initial state
  const initialState = {
    // Section data
    correspondentData: [],
    vehicleData: [],
    maintenanceData: [],
    financeData: [],
    householdData: [],
    periodData: [],

    // Loading states
    isCorrespondentDataLoading: false,
    isVehicleDataLoading: false,
    isMaintenanceDataLoading: false,
    isFinanceDataLoading: false,
    isHouseholdDataLoading: false,
    isPeriodDataLoading: false,
    correspondentDataError: null,
    vehicleDataError: null,
    maintenanceDataError: null,
    financeDataError: null,
    householdDataError: null,
    periodDataError: null,

    // Categories state
    categories: [],
    isCategoriesLoading: false,
    categoriesError: null,
  };
  
  // Entity handlers
  const correspondentHandlers = createEntityHandlers(
    {
      getAll: getAllCorrespondentRecords,
      addFirebase: firebaseAddCorrespondentRecord,
      updateFirebase: firebaseUpdateCorrespondentRecord,
      deleteFirebase: firebaseDeleteCorrespondentRecord,
      convertToApp: (firebaseRecord) => ({
        id: firebaseRecord.id || Date.now().toString(),
        date: firebaseRecord.date,
        incomingNumber: firebaseRecord.incomingNumber,
        subject: firebaseRecord.subject,
        outgoingNumber: firebaseRecord.outgoingNumber,
        from: firebaseRecord.from,
        to: firebaseRecord.to,
        signedBy: firebaseRecord.signedBy
      }),
      convertToFirebase: (appRecord) => ({
        date: appRecord.date,
        incomingNumber: appRecord.incomingNumber,
        subject: appRecord.subject,
        outgoingNumber: appRecord.outgoingNumber,
        from: appRecord.from,
        to: appRecord.to,
        signedBy: appRecord.signedBy
      }),
      convertToUpdate: (partial) => ({
        date: partial.date,
        incomingNumber: partial.incomingNumber,
        subject: partial.subject,
        outgoingNumber: partial.outgoingNumber,
        from: partial.from,
        to: partial.to,
        signedBy: partial.signedBy
      })
    },
    (loading) => set({ isCorrespondentDataLoading: loading }),
    (error) => set({ correspondentDataError: error }),
    (data) => set({ correspondentData: data }),
    () => get().correspondentData
  );
  
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
        comment: firebaseRecord.comment,
        frequency: firebaseRecord.frequency,
        mileage: firebaseRecord.mileage
      }),
      convertToFirebase: (appRecord) => ({
        vehicleId: appRecord.vehicleId,
        date: appRecord.date,
        workType: appRecord.workType,
        cost: appRecord.cost,
        comment: appRecord.comment,
        frequency: appRecord.frequency,
        mileage: appRecord.mileage
      }),
      convertToUpdate: (partial) => ({
        vehicleId: partial.vehicleId,
        date: partial.date,
        workType: partial.workType,
        cost: partial.cost,
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
    syncCorrespondentData: correspondentHandlers.sync,
    syncVehicleData: vehicleHandlers.sync,
    syncMaintenanceData: maintenanceHandlers.sync,
    syncFinanceData: financeHandlers.sync,
    syncHouseholdData: householdHandlers.sync,
    syncPeriodData: periodHandlers.sync,
    syncCategories: categoryHandlers.sync,

    // Add functions
    addCorrespondentRecord: correspondentHandlers.add,
    addVehicleRecord: vehicleHandlers.add,
    addMaintenanceRecord: maintenanceHandlers.add,
    addFinanceRecord: financeHandlers.add,
    addHouseholdRecord: householdHandlers.add,
    addPeriodEvent: periodHandlers.add,
    addCategory: categoryHandlers.add,

    // Update functions
    updateCorrespondentRecord: correspondentHandlers.update,
    updateVehicleRecord: vehicleHandlers.update,
    updateMaintenanceRecord: maintenanceHandlers.update,
    updateFinanceRecord: financeHandlers.update,
    updateHouseholdRecord: householdHandlers.update,
    updatePeriodEvent: periodHandlers.update,
    updateCategory: categoryHandlers.update,

    // Delete functions
    deleteCorrespondentRecord: correspondentHandlers.delete,
    deleteVehicleRecord: vehicleHandlers.delete,
    deleteMaintenanceRecord: maintenanceHandlers.delete,
    deleteFinanceRecord: financeHandlers.delete,
    deleteHouseholdRecord: householdHandlers.delete,
    deletePeriodEvent: periodHandlers.delete,
    deleteCategory: categoryHandlers.delete,
  };
});