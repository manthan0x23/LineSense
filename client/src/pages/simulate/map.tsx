import { useEffect, useMemo, useRef } from "react";
import {
  AdvancedMarker,
  APIProvider,
  Map as GoogleMap,
} from "@vis.gl/react-google-maps";
import type {  MetroStation, Point } from "@/lib/types";
import { useRouteStore } from "@/store/useRouteStore";
import { PolylineBetweenStations } from "@/components/utils/Polyline";
import { useSimulationStore } from "@/store/useSimulationStore";
import { SimulateBlob } from "@/components/utils/AnimateBlob";
import { IntermediateStations } from "@/components/utils/intermediate-stations-ui";

const SimulateMap = () => {
  const { route } = useRouteStore((state) => state);
  const { setPolyline, speed, setSpeed, multiplier, status, reset } =
    useSimulationStore((state) => state);

  const accelerationInterval = useRef<NodeJS.Timeout | null>(null);
  const fluctuationInterval = useRef<NodeJS.Timeout | null>(null);



  const startStation: MetroStation | null = useMemo(() => {
    return route.Line?.stations.find((s) => s.id === route.startStationId) || null;
  }, [route.startStationId, route.Line]);

  const endStation: MetroStation | null = useMemo(() => {
    return route.Line?.stations.find((s) => s.id === route.endStationId) || null;
  }, [route.endStationId, route.Line]);

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

  useEffect(() => {
    setPolyline(polyLinePath);
  }, [polyLinePath, reset]);

  useEffect(() => {
    if (status === "running") {
      let currentSpeed = 0;
      const targetSpeed = 70;
      const maxSpeed = 85;

      accelerationInterval.current = setInterval(() => {
        currentSpeed += 5;
        if (currentSpeed >= targetSpeed) {
          currentSpeed = targetSpeed;
          clearInterval(accelerationInterval.current!);

          fluctuationInterval.current = setInterval(() => {
            const randomSpeed = Math.floor(
              Math.random() * (maxSpeed - 60) + 60
            );
            setSpeed(randomSpeed);
          }, 2000);
        }
        setSpeed(currentSpeed);
      }, 500);
    }

    return () => {
      if (accelerationInterval.current)
        clearInterval(accelerationInterval.current);
      if (fluctuationInterval.current)
        clearInterval(fluctuationInterval.current);
    };
  }, [status, setSpeed]);

  if (!route.Line || !startStation || !endStation) return null;

  const start = { lat: startStation.latitude, lng: startStation.longitude };
  const end = { lat: endStation.latitude, lng: endStation.longitude };

  return (
    <APIProvider
      apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
      libraries={["geometry"]}
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
        <IntermediateStations />
        {route.Line && (
          <>
            <PolylineBetweenStations
              polyline_={polyLinePath}
              color={route.Line.color}
            />
            <SimulateBlob
              line={polyLinePath}
              start={startStation.id}
              end={endStation.id}
              speed={(speed * multiplier) / 10}
            />
          </>
        )}
      </GoogleMap>
    </APIProvider>
  );
};

export default SimulateMap;
