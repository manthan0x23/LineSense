
import type { MetroLine, MetroStation } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useRouteStore } from "@/store/useRouteStore";
import { useSimulationStore } from "@/store/useSimulationStore";
import { AdvancedMarker } from "@vis.gl/react-google-maps";
import { useMemo } from "react";
import { FaCircle } from "react-icons/fa6";

export const IntermediateStations = () => {
  const { route } = useRouteStore();
  const { crossedStationIds } = useSimulationStore();



  const intermediateStations: MetroStation[] = useMemo(() => {
    return (
      route.Line?.stations.filter((s) => route.intermediateStations.includes(s.id)) ||
      []
    );
  }, [route.intermediateStations, route.Line, route.lineId]);

  return (
    <>
      {intermediateStations &&
        intermediateStations.map((station) => (
          <AdvancedMarker
            key={station.id}
            position={{
              lat: station.latitude,
              lng: station.longitude,
            }}
          >
            <FaCircle
              className={cn(
                crossedStationIds.includes(station.id)
                  ? "text-green-500"
                  : "text-gray-500/80"
              )}
              size={12}
            />
          </AdvancedMarker>
        ))}
    </>
  );
};
