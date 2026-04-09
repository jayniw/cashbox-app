import { create } from 'zustand';

interface AdminStore {
  refreshKey: number;
  error: string | null;
  setError: (error: string | null) => void;
  bumpRefreshKey: () => void;
}

export const useAdminStore = create<AdminStore>((set) => ({
  refreshKey: 0,
  error: null,
  setError: (error) => set({ error }),
  bumpRefreshKey: () => set((state) => ({ refreshKey: state.refreshKey + 1 })),
}));
