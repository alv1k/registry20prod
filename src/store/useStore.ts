import { create } from 'zustand';

interface CorrespondentRecord {
  id: number;
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
  correspondentData: CorrespondentRecord[];
  transportData: any[];
  financeData: any[];
  domesticData: any[];
  
  // Actions to update data
  setCorrespondentData: (data: CorrespondentRecord[]) => void;
  addCorrespondentRecord: (record: Omit<CorrespondentRecord, 'id'>) => void;
  updateCorrespondentRecord: (id: number, record: Partial<CorrespondentRecord>) => void;
  deleteCorrespondentRecord: (id: number) => void;
  
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
  
  // Actions to update correspondent data
  setCorrespondentData: (data) => set({ correspondentData: data }),
  
  addCorrespondentRecord: (record) => {
    const newRecord: CorrespondentRecord = {
      ...record,
      id: Date.now(), // Simple ID generation
    };
    set((state) => ({
      correspondentData: [...state.correspondentData, newRecord]
    }));
  },
  
  updateCorrespondentRecord: (id, updatedFields) => {
    set((state) => ({
      correspondentData: state.correspondentData.map(record =>
        record.id === id ? { ...record, ...updatedFields } : record
      )
    }));
  },
  
  deleteCorrespondentRecord: (id) => {
    set((state) => ({
      correspondentData: state.correspondentData.filter(record => record.id !== id)
    }));
  },
  
  setTransportData: (data) => set({ transportData: data }),
  setFinanceData: (data) => set({ financeData: data }),
  setDomesticData: (data) => set({ domesticData: data }),
}));