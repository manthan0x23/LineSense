import { create } from "zustand";

interface StoreAction {
  lat: number;
  lng: number;
  setPosition(lat: number, lng: number): void;
  reset: () => void;
}

export const useCoordinateStore = create<StoreAction>((set) => ({
  lat: 28.6815,
  lng: 77.2228,
  setPosition: (lat: number, lng: number) => set({ lat, lng }),
  reset: () => set({ lat: 28.6815, lng: 77.2228 }),
}));
