import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMemo } from "react";
import { useSimulationStore } from "@/store/useSimulationStore";
import { useRouteStore } from "@/store/useRouteStore";
import type { MetroLine, MetroStation } from "@/lib/data/type";
import { metroLines } from "@/lib/data/metro-lines";

export const StationInfoCard = () => {
  const { route } = useRouteStore();
  const { currentPolylineIdx, polyline } = useSimulationStore();

  const line: MetroLine | null = useMemo(() => {
    return metroLines.find((ml) => ml.id == route.lineId) || null;
  }, [route.lineId]);

  const startEnd = useMemo(() => {
    const start = line?.stations.find((st) => st.id == route.startStationId);
    const end = line?.stations.find((st) => st.id == route.endStationId);

    return { start, end };
  }, [line, route.startStationId, route.endStationId]);

  const intermediateStations: MetroStation[] = useMemo(() => {
    return (
      line?.stations.filter((s) => route.intermediateStations.includes(s.id)) ||
      []
    );
  }, [route.intermediateStations, line, route.lineId]);

  const SorroundStations = useMemo(() => {
    if (!polyline.length) return { prev: null, next: null };

    let next: MetroStation | null = null;
    let prev: MetroStation | null = null;

    const idx = Math.max(currentPolylineIdx, 0);

    // Prev: station <= current
    for (let i = idx; i >= 0; i--) {
      const point = polyline[i];
      if (
        point?.isStation &&
        intermediateStations.find((ist) => ist.id === point.stationId)
      ) {
        prev =
          intermediateStations.find((ist) => ist.id === point.stationId) ||
          null;
        break;
      }
    }

    // Next: station > current
    for (let i = idx + 1; i < polyline.length; i++) {
      const point = polyline[i];
      if (
        point?.isStation &&
        intermediateStations.find((ist) => ist.id === point.stationId)
      ) {
        next =
          intermediateStations.find((ist) => ist.id === point.stationId) ||
          null;
        break;
      }
    }

    return { prev, next };
  }, [currentPolylineIdx, polyline, intermediateStations]);

  return (
    <Card>
      <CardContent className="flex items-center justify-between">
        <div className="flex flex-col items-start justify-center gap-3">
          <span className="text-muted-foreground text-sm">Previous:</span>{" "}
          <Badge variant="outline">
            {SorroundStations.prev?.name || startEnd.start?.name}
          </Badge>
        </div>
        <div className="flex flex-col items-start justify-center gap-3">
          <span className=" text-sm font-medium text-blue-600">Next:</span>{" "}
          <Badge variant="outline">
            {SorroundStations.next?.name ?? startEnd.end?.name}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
