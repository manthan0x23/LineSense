import { create } from "zustand";

type State = {
  line: number;
  speed: number;
  isPaused: boolean;
  isStarted: boolean;
  isSimulated: boolean;
  doCallibrate: boolean;
  loading: boolean;
};

type Actions = {
  setLine: (id: number) => void;
  setSpeed: (val: number) => void;
  setSimulated: () => void;
  setStart: () => void;
  togglePause: () => void;
  reset: () => void;
  setCalibrate: () => void;
  toggleLoad: () => void;
};

export const useMapStore = create<State & Actions>((set) => ({
  line: 0,
  speed: 1,
  isPaused: false,
  doCallibrate: false,
  loading: false,
  isStarted: false,
  isSimulated: false,
  setSpeed: (val: number) => {
    set({ speed: val });
  },
  setLine: (val: number) => {
    set({ line: val });
  },
  setCalibrate: () => set((s) => ({ doCallibrate: !s.doCallibrate })),
  setSimulated: () => set((s) => ({ isSimulated: !s.isSimulated })),
  togglePause: () => set((s) => ({ isPaused: !s.isPaused })),
  toggleLoad: () => set((s) => ({ loading: !s.loading })),
  setStart: () => set((s) => ({ isStarted: !s.isStarted })),
  reset: () =>
    set({
      line: 0,
      speed: 1,
      isPaused: false,
      isStarted: false,
      isSimulated: false,
      doCallibrate: false,
      loading: false,
    }),
}));
