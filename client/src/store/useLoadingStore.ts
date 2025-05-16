import { create } from "zustand";

interface StoreAction {
    loading: boolean,
    setLoading: () => void;
    reset: () => void;
}

export const useLoadingStore = create<StoreAction>((set) => ({
    loading: false,
    setLoading: () => set(s => ({ loading: !s.loading })),
    reset: () => set({ loading: false }),
}));
