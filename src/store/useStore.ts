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
  TransportRecord as FirebaseTransportRecord
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
  financeData: any[];
  domesticData: any[];
  
  // Loading states
  isCorrespondentDataLoading: boolean;
  isTransportDataLoading: boolean;
  correspondentDataError: string | null;
  transportDataError: string | null;
  
  // Firebase sync actions
  syncCorrespondentData: () => Promise<void>;
  syncTransportData: () => Promise<void>;
  
  // Actions to update data (with Firebase sync)
  setCorrespondentData: (data: AppCorrespondentRecord[]) => void;
  addCorrespondentRecord: (record: Omit<AppCorrespondentRecord, 'id'>) => Promise<void>;
  updateCorrespondentRecord: (id: number | string, record: Partial<AppCorrespondentRecord>) => Promise<void>;
  deleteCorrespondentRecord: (id: number | string) => Promise<void>;
  
  setTransportData: (data: AppTransportRecord[]) => void;
  addTransportRecord: (record: Omit<AppTransportRecord, 'id'>) => Promise<void>;
  updateTransportRecord: (id: number | string, record: Partial<AppTransportRecord>) => Promise<void>;
  deleteTransportRecord: (id: number | string) => Promise<void>;
  
  setFinanceData: (data: any[]) => void;
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
  
  setFinanceData: (data) => set({ financeData: data }),
  setDomesticData: (data) => set({ domesticData: data }),
}));