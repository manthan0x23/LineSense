import type { Point } from "@/lib/data/type";
import { useMap } from "@vis.gl/react-google-maps";
import { useEffect, useRef } from "react";

export const PolylineBetweenStations = ({
  polyline_,
  color,
}: {
  polyline_: Point[];
  color: string;
}) => {
  const map = useMap();
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map) return;

    const path = polyline_.map((point) => ({
      lat: point.latitude,
      lng: point.longitude,
    }));

    const polyline = new google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: color,
      strokeOpacity: 0.8,
      strokeWeight: 4,
    });

    polyline.setMap(map);
    polylineRef.current = polyline;

    return () => {
      polyline.setMap(null);
    };
  }, [map, polyline_]);

  return null;
};
