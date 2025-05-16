import { useEffect, useRef, useState } from "react";
import { useCoordinateStore } from "@/store/useCoordinate";
import { useRouteStore } from "@/store/useRouteStore";
import { useSimulationStore } from "@/store/useSimulationStore";
import { FiAlertTriangle } from "react-icons/fi";
import { CgDanger } from "react-icons/cg";
import {
  Alert as AlertUI,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import type { Alert } from "@/lib/data/type";
import { cn } from "@/lib/utils";
import { CiCircleAlert } from "react-icons/ci";

const DEBOUNCE_MS = 6000; // 6 seconds

export const AlertsStack = () => {
  const { lat, lng } = useCoordinateStore();
  const { speed, multiplier, currentPolylineIdx, polyline } =
    useSimulationStore();
  const { route } = useRouteStore();

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const lastFired = useRef<Record<Alert["type"], number>>({
    info: 0,
    warning: 0,
    danger: 0,
  });

  useEffect(() => {
    if (
      lat == null ||
      lng == null ||
      typeof google === "undefined" ||
      !google.maps?.geometry?.spherical ||
      currentPolylineIdx == null ||
      !polyline?.length
    ) {
      return;
    }

    const now = Date.now();
    const newAlerts: Alert[] = [];
    const maxIdx = polyline.length - 1;
    const currentPoint = polyline[currentPolylineIdx];

    const lookahead = 5;
    const angleThreshold = 30;
    const distanceThreshold = 500;

    if (currentPolylineIdx + 1 <= maxIdx) {
      const maxLook = Math.min(lookahead, maxIdx - currentPolylineIdx - 1);

      const calcHeading = (i: number) => {
        const p1 = polyline[i];
        const p2 = polyline[i + 1];
        return google.maps.geometry.spherical.computeHeading(
          new google.maps.LatLng(p1.latitude, p1.longitude),
          new google.maps.LatLng(p2.latitude, p2.longitude)
        );
      };

      const h0 = calcHeading(currentPolylineIdx);

      for (let j = 1; j <= maxLook; j++) {
        const hj = calcHeading(currentPolylineIdx + j);
        let delta = hj - h0;
        delta = ((delta + 180 + 360) % 360) - 180;

        if (Math.abs(delta) >= angleThreshold) {
          const turnPoint = polyline[currentPolylineIdx + j];
          const dist = google.maps.geometry.spherical.computeDistanceBetween(
            new google.maps.LatLng(lat, lng),
            new google.maps.LatLng(turnPoint.latitude, turnPoint.longitude)
          );
          if (
            dist < distanceThreshold &&
            now - lastFired.current.info > DEBOUNCE_MS
          ) {
            newAlerts.push({
              type: "info",
              message: `Curve ahead: ${Math.abs(delta).toFixed(
                0
              )}° turn in ~${Math.floor(dist)} m.`,
            });
            lastFired.current.info = now;
          }
          break;
        }
      }
    }

    const nextStation = polyline
      .slice(currentPolylineIdx + 1)
      .find((p) => p.isStation);
    if (nextStation) {
      const dist = google.maps.geometry.spherical.computeDistanceBetween(
        new google.maps.LatLng(lat, lng),
        new google.maps.LatLng(nextStation.latitude, nextStation.longitude)
      );
      if (dist < 500 && now - lastFired.current.info > DEBOUNCE_MS) {
        newAlerts.push({
          type: "info",
          message: "Approaching next station.",
        });
        lastFired.current.info = now;
      }
    }

    const maxSpeed = currentPoint.speed.max;
    const effectiveSpeed = (speed * multiplier) / 10;

    if (
      effectiveSpeed > maxSpeed + 20 &&
      now - lastFired.current.danger > DEBOUNCE_MS
    ) {
      newAlerts.push({
        type: "danger",
        message: `Danger! Exceeding safe speed by ${Math.floor(
          effectiveSpeed - maxSpeed
        )} km/h.`,
      });
      lastFired.current.danger = now;
    } else if (
      effectiveSpeed > maxSpeed &&
      now - lastFired.current.warning > DEBOUNCE_MS
    ) {
      newAlerts.push({
        type: "warning",
        message: `Reduce speed: currently ${Math.floor(
          effectiveSpeed
        )} km/h, max allowed ${maxSpeed} km/h.`,
      });
      lastFired.current.warning = now;
    }

    if (newAlerts.length) {
      setAlerts((prev) => [...newAlerts, ...prev]);
    }
  }, [lat, lng, currentPolylineIdx, speed, multiplier, polyline]);

  return (
    <div className="h-auto w-full flex flex-col gap-3">
      {alerts.map((a, idx) => (
        <AlertCard message={a.message} type={a.type} key={idx} />
      ))}
    </div>
  );
};

const AlertCard = ({
  type,
  message,
}: {
  type: Alert["type"];
  message: string;
}) => {
  if (type === "warning") {
    return (
      <AlertUI
        className={cn("w-full bg-yellow-400/30 border-2 border-yellow-400")}
      >
        <FiAlertTriangle className="h-4 w-4 text-yellow-400" />
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </AlertUI>
    );
  } else if (type === "info") {
    return (
      <AlertUI className={cn("w-full bg-blue-400/30 border-2 border-blue-400")}>
        <CiCircleAlert className="h-4 w-4 text-blue-400" />
        <AlertTitle>Info</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </AlertUI>
    );
  } else {
    return (
      <AlertUI className={cn("w-full bg-red-400/30 border-2 border-red-400")}>
        <CgDanger className="h-4 w-4 text-red-600" />
        <AlertTitle>Danger</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </AlertUI>
    );
  }
};
