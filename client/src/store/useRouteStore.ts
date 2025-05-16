import type { MetroLine } from "@/lib/types";
import { application } from "@/lib/utils";
import Cookies from "js-cookie";
import { create } from "zustand";

export interface Route {
  lineId: number | null;
  Line: MetroLine | null;
  startStationId: number | null;
  endStationId: number | null;
  intermediateStations: number[];
  type: RouteType | null;
}

export type RouteType = "simulate" | "calibrate";

interface RouteStore {
  route: Route;
  setRoute: (newRoute: Route) => void;
  setLineData: (line: MetroLine) => void;
  resetRoute: () => void;
}

export const useRouteStore = create<RouteStore>((set) => ({
  route: {
    Line: null,
    lineId: null,
    startStationId: null,
    endStationId: null,
    intermediateStations: [],
    type: null,
  },
  setRoute: (newRoute) => set({ route: { ...newRoute, Line: null } }),
  setLineData: (line: MetroLine) => {
    set((s) => ({ route: { ...s.route, Line: line } }));
  },
  resetRoute: () => {
    Cookies.remove(application.routeConfigLiteral);
    return set({
      route: {
        Line: null,
        lineId: null,
        startStationId: null,
        endStationId: null,
        intermediateStations: [],
        type: null,
      },
    });
  },
}));
