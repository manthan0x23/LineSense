import { useEffect, useRef } from "react";
import { useMap } from "@vis.gl/react-google-maps";
import { useCoordinateStore } from "@/store/useCoordinate";
import { useSimulationStore } from "@/store/useSimulationStore";
import type { Point } from "@/lib/types";


const getDistanceMeters = (
  a: google.maps.LatLngLiteral,
  b: google.maps.LatLngLiteral
): number => {
  return google.maps.geometry.spherical.computeDistanceBetween(a, b);
};

const findNearestPolylineIndex = (
  pos: google.maps.LatLngLiteral,
  path: google.maps.LatLngLiteral[]
): number => {
  let closestIdx = 0;
  let minDist = Infinity;

  path.forEach((pt, i) => {
    const dist = getDistanceMeters(pos, pt);
    if (dist < minDist) {
      minDist = dist;
      closestIdx = i;
    }
  });

  return closestIdx;
};

const stationProximityThreshold = 50; // meters

export const CalibrateBlob = ({ line }: { line: Point[] }) => {
  const map = useMap();
  const { setPosition } = useCoordinateStore();

  const { setCurrentPolylineIdx, setCrossedStationIds, setSpeed } =
    useSimulationStore();

  const markerRef = useRef<google.maps.Marker | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const crossedStationsRef = useRef<Set<number>>(new Set());
  const lastPositionRef = useRef<{
    time: number;
    coords: google.maps.LatLngLiteral;
  } | null>(null);

  const path = line.map((pt) => ({
    lat: pt.latitude,
    lng: pt.longitude,
  }));

  useEffect(() => {
    if (!map || path.length === 0) return;

    // Create marker
    if (markerRef.current) markerRef.current.setMap(null);

    markerRef.current = new google.maps.Marker({
      position: path[0],
      map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 6,
        fillColor: "#00C851",
        fillOpacity: 1,
        strokeWeight: 0,
      },
    });

    // Watch GPS
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const currentTime = pos.timestamp;
        const currentCoords = { lat: latitude, lng: longitude };

        // Update marker and map
        markerRef.current?.setPosition(currentCoords);
        map.setCenter(currentCoords);

        // Update global coordinates
        setPosition(latitude, longitude);

        // Calculate real speed (in m/s), fallback if gpsSpeed not reliable
        if (lastPositionRef.current) {
          const deltaTime = (currentTime - lastPositionRef.current.time) / 1000;
          const deltaDistance = getDistanceMeters(
            currentCoords,
            lastPositionRef.current.coords
          );

          if (deltaTime > 0) {
            const calculatedSpeed = deltaDistance / deltaTime;
            setSpeed(calculatedSpeed); // Optional: you can convert to km/h
          }
        }

        lastPositionRef.current = {
          time: currentTime,
          coords: currentCoords,
        };

        // Update polyline index
        const nearestIdx = findNearestPolylineIndex(currentCoords, path);
        setCurrentPolylineIdx(nearestIdx);

        // Update crossed stations
        const nearbyStation = line[nearestIdx];
        if (
          nearbyStation.isStation &&
          !crossedStationsRef.current.has(nearbyStation.stationId!)
        ) {
          const stationCoords = {
            lat: nearbyStation.latitude,
            lng: nearbyStation.longitude,
          };
          const dist = getDistanceMeters(currentCoords, stationCoords);
          if (dist < stationProximityThreshold) {
            crossedStationsRef.current.add(nearbyStation.stationId!);
            setCrossedStationIds([...crossedStationsRef.current]);
          }
        }
      },
      (error) => {
        console.error("GPS Error", error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 10000,
      }
    );

    // Cleanup
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (markerRef.current) markerRef.current.setMap(null);
    };
  }, [map, line]);

  return null;
};

export default CalibrateBlob;
