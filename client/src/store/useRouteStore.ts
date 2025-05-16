import { application } from "@/lib/utils";
import Cookies from "js-cookie";
import { create } from "zustand";

export interface Route {
  lineId: number | null;
  startStationId: number | null;
  endStationId: number | null;
  intermediateStations: number[];
  type: RouteType | null;
}

export type RouteType = "simulate" | "calibrate";

interface RouteStore {
  route: Route;
  setRoute: (newRoute: Route) => void;
  resetRoute: () => void;
}

export const useRouteStore = create<RouteStore>((set) => ({
  route: {
    lineId: null,
    startStationId: null,
    endStationId: null,
    intermediateStations: [],
    type: null,
  },
  setRoute: (newRoute) => set({ route: newRoute }),
  resetRoute: () => {
    Cookies.remove(application.routeConfigLiteral);
    return set({
      route: {
        lineId: null,
        startStationId: null,
        endStationId: null,
        intermediateStations: [],
        type: null,
      },
    });
  },
}));
