import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";
import { Loader2 } from "lucide-react";
import type { Point } from "@/lib/data/type";
import { application } from "@/lib/utils";

interface LatLngLiteral {
  lat: number;
  lng: number;
}

// Compute distance between two lat/lng points using Google's geometry library
const getDistanceMeters = (
  a: google.maps.LatLngLiteral,
  b: google.maps.LatLngLiteral
): number => {
  return google.maps.geometry.spherical.computeDistanceBetween(
    new google.maps.LatLng(a),
    new google.maps.LatLng(b)
  );
};

// Compute the shortest distance from point p to segment AB
const distanceToSegment = (
  p: google.maps.LatLngLiteral,
  a: google.maps.LatLngLiteral,
  b: google.maps.LatLngLiteral
): number => {
  // Approximate small-area distances by projecting longitude by cos(meanLat)
  const meanLat = ((a.lat + b.lat) / 2) * (Math.PI / 180);
  const factor = Math.cos(meanLat);
  const x1 = a.lng * factor;
  const y1 = a.lat;
  const x2 = b.lng * factor;
  const y2 = b.lat;
  const x0 = p.lng * factor;
  const y0 = p.lat;

  const dx = x2 - x1;
  const dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  const t = len2 > 0 ? ((x0 - x1) * dx + (y0 - y1) * dy) / len2 : 0;
  const tClamped = Math.max(0, Math.min(1, t));

  const xProj = x1 + dx * tClamped;
  const yProj = y1 + dy * tClamped;

  // Convert projection back to lat/lng
  const proj: google.maps.LatLngLiteral = {
    lat: yProj,
    lng: xProj / factor,
  };

  return getDistanceMeters(p, proj);
};

// Find minimum distance from point to polyline defined by path
const findClosestDistanceToPath = (
  pos: google.maps.LatLngLiteral,
  path: google.maps.LatLngLiteral[]
): number => {
  let minDist = Infinity;
  for (let i = 0; i < path.length - 1; i++) {
    const dist = distanceToSegment(pos, path[i], path[i + 1]);
    if (dist < minDist) {
      minDist = dist;
    }
  }
  return minDist;
};

interface LocationGuardProps {
  children: React.ReactNode;
  line: Point[];
  maxDistance: number;
}

export const LocationGuard = ({
  children,
  line,
  maxDistance,
}: LocationGuardProps) => {
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [showDialog, setShowDialog] = useState<boolean>(false);

  const path: google.maps.LatLngLiteral[] = line.map((pt) => ({
    lat: pt.latitude,
    lng: pt.longitude,
  }));

  useEffect(() => {
    const checkPosition = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const userPos: google.maps.LatLngLiteral = {
            lat: latitude,
            lng: longitude,
          };

          const distance = findClosestDistanceToPath(userPos, path);

          if (distance > maxDistance) {
            setShowDialog(true);
          }

          setIsChecking(false);
        },
        (err) => {
          console.error("Geolocation error:", err);
          setShowDialog(true);
          setIsChecking(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
        }
      );
    };

    checkPosition();
  }, [path, maxDistance]);

  const handleExit = () => {
    Cookies.remove(application.routeConfigLiteral);
    window.location.assign("/");
  };

  if (isChecking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-sm text-gray-700">
          Checking your location...
        </span>
      </div>
    );
  }

  return (
    <>
      {children}
      <Dialog open={showDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Location Not Supported</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground">
            Your current location is too far from the simulation path. Please
            ensure you're near the route to continue.
          </div>
          <DialogFooter>
            <Button onClick={handleExit}>Okay</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
