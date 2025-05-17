import { useMemo } from "react";
import {
  AdvancedMarker,
  APIProvider,
  Map as GoogleMap,
  Pin,
} from "@vis.gl/react-google-maps";
import type {  MetroStation, Point } from "@/lib/types";
import { useRouteStore } from "@/store/useRouteStore";
import { PolylineBetweenStations } from "@/components/utils/Polyline";
import CalibrateBlob from "@/components/utils/CalibrateBlob";
import { LocationGuard } from "./location-guard";

const CalibrateMap = () => {
  const { route } = useRouteStore((state) => state);


  const startStation: MetroStation | null = useMemo(() => {
    return route.Line?.stations.find((s) => s.id === route.startStationId) || null;
  }, [route.startStationId, route.Line]);

  const endStation: MetroStation | null = useMemo(() => {
    return route.Line?.stations.find((s) => s.id === route.endStationId) || null;
  }, [route.endStationId, route.Line]);

  const intermediateStations: MetroStation[] = useMemo(() => {
    return (
      route.Line?.stations.filter((s) => route.intermediateStations.includes(s.id)) ||
      []
    );
  }, [route.intermediateStations, route.Line]);

  const polyLinePath: Point[] = useMemo(() => {
    let points: Point[] = [];

    if (!route.Line?.polyline || !startStation || !endStation) return [];

    const sit = route.Line.polyline.findIndex(
      (p) => p.isStation && p.stationId == startStation.id
    );
    const eit = route.Line.polyline.findIndex(
      (p) => p.isStation && p.stationId == endStation.id
    );

    if (sit >= eit) {
      points = route.Line.polyline.slice(eit, sit + 1).reverse();
    } else {
      points = route.Line.polyline.slice(sit, eit + 1);
    }

    return points;
  }, [route.Line, startStation, endStation]);

  if (!route.Line || !startStation || !endStation) return null;
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
        {route.Line && (
          <>
            <PolylineBetweenStations
              polyline_={polyLinePath}
              color={route.Line.color}
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
