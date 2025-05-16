import { useMemo } from "react";
import {
  AdvancedMarker,
  APIProvider,
  Map as GoogleMap,
  Pin,
} from "@vis.gl/react-google-maps";
import { metroLines } from "@/lib/data/metro-lines";
import type { MetroLine, MetroStation, Point } from "@/lib/data/type";
import { useRouteStore } from "@/store/useRouteStore";
import { SimulateBlob } from "@/components/utils/AnimateBlob";
import { PolylineBetweenStations } from "@/components/utils/Polyline";
import CalibrateBlob from "@/components/utils/CalibrateBlob";
import { LocationGuard } from "./location-guard";

const CalibrateMap = () => {
  const { route } = useRouteStore((state) => state);

  const line: MetroLine | null = useMemo(() => {
    return metroLines.find((line) => line.id === route.lineId) || null;
  }, [route.lineId]);

  const startStation: MetroStation | null = useMemo(() => {
    return line?.stations.find((s) => s.id === route.startStationId) || null;
  }, [route.startStationId, line]);

  const endStation: MetroStation | null = useMemo(() => {
    return line?.stations.find((s) => s.id === route.endStationId) || null;
  }, [route.endStationId, line]);

  const intermediateStations: MetroStation[] = useMemo(() => {
    return (
      line?.stations.filter((s) => route.intermediateStations.includes(s.id)) ||
      []
    );
  }, [route.intermediateStations, line]);

  const polyLinePath: Point[] = useMemo(() => {
    let points: Point[] = [];

    if (!line?.polyline || !startStation || !endStation) return [];

    const sit = line.polyline.findIndex(
      (p) => p.isStation && p.stationId == startStation.id
    );
    const eit = line.polyline.findIndex(
      (p) => p.isStation && p.stationId == endStation.id
    );

    if (sit >= eit) {
      points = line.polyline.slice(eit, sit + 1).reverse();
    } else {
      points = line.polyline.slice(sit, eit + 1);
    }

    return points;
  }, [line, startStation, endStation]);

  if (!line || !startStation || !endStation) return null;

  const start = { lat: startStation.latitude, lng: startStation.longitude };
  const end = { lat: endStation.latitude, lng: endStation.longitude };

  return (
    <APIProvider
      libraries={["geometry"]}
      apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
    >
      <GoogleMap
        mapId={import.meta.env.VITE_GOOGLE_MAP_ID}
        className="h-full w-full"
        defaultCenter={start}
        defaultZoom={20}
        gestureHandling="greedy"
      >
        <AdvancedMarker position={start} />
        <AdvancedMarker position={end} />
        {intermediateStations &&
          intermediateStations.map((station) => (
            <AdvancedMarker
              key={station.id}
              position={{
                lat: station.latitude,
                lng: station.longitude,
              }}
            >
              <Pin
                background={"#0f9d58"}
                borderColor={"#006425"}
                glyphColor={"#60d98f"}
              />
            </AdvancedMarker>
          ))}
        {line && (
          <>
            <PolylineBetweenStations
              polyline_={polyLinePath}
              color={line.color}
            />
            <LocationGuard line={polyLinePath} maxDistance={30000}>
              <CalibrateBlob line={polyLinePath} />
            </LocationGuard>
          </>
        )}
      </GoogleMap>
    </APIProvider>
  );
};

export default CalibrateMap;
