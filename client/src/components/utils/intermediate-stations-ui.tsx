import { metroLines } from "@/lib/data/metro-lines";
import type { MetroLine, MetroStation } from "@/lib/data/type";
import { cn } from "@/lib/utils";
import { useRouteStore } from "@/store/useRouteStore";
import { useSimulationStore } from "@/store/useSimulationStore";
import { AdvancedMarker } from "@vis.gl/react-google-maps";
import { useMemo } from "react";
import { FaCircle } from "react-icons/fa6";

export const IntermediateStations = () => {
  const { route } = useRouteStore();
  const { crossedStationIds } = useSimulationStore();

  const line: MetroLine | null = useMemo(() => {
    return metroLines.find((ml) => ml.id == route.lineId) || null;
  }, [route.lineId]);

  const intermediateStations: MetroStation[] = useMemo(() => {
    return (
      line?.stations.filter((s) => route.intermediateStations.includes(s.id)) ||
      []
    );
  }, [route.intermediateStations, line, route.lineId]);

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
