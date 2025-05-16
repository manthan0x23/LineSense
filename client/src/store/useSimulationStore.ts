import type { Point } from "@/lib/data/type";
import { create } from "zustand";

export type SimulationStatus = "idle" | "running" | "paused";

interface SimulationState {
  speed: number;
  multiplier: number;
  status: SimulationStatus;
  polyline: Point[];
  currentStationIndex: number;
  crossedStationIds: number[];
  currentPolylineIdx: number;

  setSpeed: (speed: number) => void;
  setMultiplier: (multiplier: number) => void;
  setStatus: (status: SimulationStatus) => void;
  setPolyline: (polyline: Point[]) => void;
  setCurrentStationIndex: (index: number) => void;
  setCrossedStationIds: (ids: number[]) => void;
  setCurrentPolylineIdx: (index: number) => void;
  reset: () => void;
}

export const useSimulationStore = create<SimulationState>((set) => ({
  speed: 0,
  multiplier: 10,
  status: "idle",
  polyline: [],
  currentStationIndex: 0,
  crossedStationIds: [],
  currentPolylineIdx: 0,

  setSpeed: (speed) => set({ speed: speed }),
  setMultiplier: (multi) => set({ multiplier: multi }),
  setStatus: (status) => set({ status }),
  setPolyline: (polyline) => set({ polyline }),
  setCurrentStationIndex: (index) => set({ currentStationIndex: index }),
  setCrossedStationIds: (ids) => set({ crossedStationIds: ids }),
  setCurrentPolylineIdx: (index) => set({ currentPolylineIdx: index }),

  reset: () =>
    set({
      speed: 0,
      multiplier: 10,
      status: "idle",
      polyline: [],
      currentStationIndex: 0,
      crossedStationIds: [],
      currentPolylineIdx: 0,
    }),
}));
