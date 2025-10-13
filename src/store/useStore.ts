// src/store/useStore.ts
import { create } from 'zustand';
import { 
  getAllCorrespondentRecords, 
  addCorrespondentRecord as firebaseAddCorrespondentRecord,
  updateCorrespondentRecord as firebaseUpdateCorrespondentRecord,
  deleteCorrespondentRecord as firebaseDeleteCorrespondentRecord,
  CorrespondentRecord as FirebaseCorrespondentRecord
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

interface AppState {
  // Navigation state
  currentPage: string;
  setCurrentPage: (page: string) => void;
  
  // User preferences
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  
  // Data for the different sections
  correspondentData: AppCorrespondentRecord[];
  transportData: any[];
  financeData: any[];
  domesticData: any[];
  
  // Loading states
  isCorrespondentDataLoading: boolean;
  correspondentDataError: string | null;
  
  // Firebase sync actions
  syncCorrespondentData: () => Promise<void>;
  
  // Actions to update data (with Firebase sync)
  setCorrespondentData: (data: AppCorrespondentRecord[]) => void;
  addCorrespondentRecord: (record: Omit<AppCorrespondentRecord, 'id'>) => Promise<void>;
  updateCorrespondentRecord: (id: number | string, record: Partial<AppCorrespondentRecord>) => Promise<void>;
  deleteCorrespondentRecord: (id: number | string) => Promise<void>;
  
  setTransportData: (data: any[]) => void;
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
  
  setTransportData: (data) => set({ transportData: data }),
  setFinanceData: (data) => set({ financeData: data }),
  setDomesticData: (data) => set({ domesticData: data }),
}));