import { useEffect, useRef } from "react";
import { useSimulationStore } from "@/store/useSimulationStore";
import { useMap } from "@vis.gl/react-google-maps";
import type { Point } from "@/lib/data/type";
import { useCoordinateStore } from "@/store/useCoordinate";

export const SimulateBlob = ({
  line,
  speed,
  end,
  start,
}: {
  start: number;
  end: number;
  line: Point[];
  speed: number;
}) => {
  const map = useMap();
  const { status, setCrossedStationIds, setCurrentPolylineIdx, setSpeed } =
    useSimulationStore();

  const { setPosition } = useCoordinateStore();

  const markerRef = useRef<google.maps.Marker | null>(null);
  const animationRef = useRef<number | null>(null);

  const lastTimeRef = useRef<number | null>(null);
  const distanceTraveledRef = useRef(0);
  const currentSpeedRef = useRef(speed);

  const pathRef = useRef<google.maps.LatLngLiteral[]>([]);
  const segmentDistancesRef = useRef<number[]>([]);
  const totalDistanceRef = useRef(0);

  const crossedStationIdsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    currentSpeedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    if (!map) return;

    const path: google.maps.LatLngLiteral[] = line.map((point) => ({
      lat: point.latitude,
      lng: point.longitude,
    }));

    if (path.length < 2) return;

    pathRef.current = path;
    segmentDistancesRef.current = [];
    totalDistanceRef.current = 0;
    distanceTraveledRef.current = 0;
    lastTimeRef.current = null;

    if (markerRef.current) markerRef.current.setMap(null);
    const marker = new google.maps.Marker({
      position: path[0],
      map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 6,
        fillColor: "#007AFF",
        fillOpacity: 1,
        strokeWeight: 0,
      },
    });
    markerRef.current = marker;

    for (let i = 0; i < path.length - 1; i++) {
      const dist = google.maps.geometry.spherical.computeDistanceBetween(
        path[i],
        path[i + 1]
      );
      segmentDistancesRef.current.push(dist);
      totalDistanceRef.current += dist;
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (markerRef.current) markerRef.current.setMap(null);
    };
  }, [map, start, end, line]);

  useEffect(() => {
    if (!markerRef.current || pathRef.current.length === 0) return;

    const path = pathRef.current;
    const segmentDistances = segmentDistancesRef.current;
    const totalDistance = totalDistanceRef.current;

    if (status === "idle") {
      distanceTraveledRef.current = 0;
      lastTimeRef.current = null;

      crossedStationIdsRef.current.clear();
      setCrossedStationIds([]);

      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      markerRef.current.setPosition(path[0]);
      return;
    }

    if (status === "paused") {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }

    const animate = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const delta = time - lastTimeRef.current;
      lastTimeRef.current = time;

      const speed = currentSpeedRef.current;
      const distanceThisFrame = (delta / 1000) * speed;
      distanceTraveledRef.current += distanceThisFrame;

      const distanceTraveled = distanceTraveledRef.current;
      let distanceSoFar = 0;
      let segmentIndex = 0;

      while (
        segmentIndex < segmentDistances.length &&
        distanceSoFar + segmentDistances[segmentIndex] < distanceTraveled
      ) {
        distanceSoFar += segmentDistances[segmentIndex];
        segmentIndex++;
      }

      if (segmentIndex >= path.length - 1) {
        markerRef.current!.setPosition(path[path.length - 1]);
        setCurrentPolylineIdx(path.length - 1);

        
        
        return;
      }

      const segmentStart = path[segmentIndex];
      const segmentEnd = path[segmentIndex + 1];
      const segmentDistance = segmentDistances[segmentIndex];
      const segmentFraction =
        (distanceTraveled - distanceSoFar) / segmentDistance;

      const interpolated = google.maps.geometry.spherical.interpolate(
        segmentStart,
        segmentEnd,
        segmentFraction
      );

      markerRef.current!.setPosition(interpolated);
      setPosition(interpolated.lat(), interpolated.lng());
      setCurrentPolylineIdx(segmentIndex);

      const currentPoint = line[segmentIndex];
      if (
        currentPoint.isStation &&
        !crossedStationIdsRef.current.has(currentPoint.stationId!)
      ) {
        crossedStationIdsRef.current.add(currentPoint.stationId!);
        setCrossedStationIds([...crossedStationIdsRef.current]);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [
    status,
    setCrossedStationIds,
    setCurrentPolylineIdx,
    setPosition,
    setSpeed,
  ]);

  return null;
};
