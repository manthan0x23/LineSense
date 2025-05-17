import { useEffect, useRef, useState } from "react";
import { useCoordinateStore } from "@/store/useCoordinate";
import { useSimulationStore } from "@/store/useSimulationStore";
import { FiAlertTriangle } from "react-icons/fi";
import { CgDanger } from "react-icons/cg";
import {
  Alert as AlertUI,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import type { Alert } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CiCircleAlert } from "react-icons/ci";
import { MdAddCircleOutline } from "react-icons/md";

const DEBOUNCE_MS = 6000;

export const AlertsStack = () => {
  const { lat, lng } = useCoordinateStore();
  const { speed, multiplier, currentPolylineIdx, polyline } =
    useSimulationStore();

  const [alerts, setAlerts] = useState<Alert[]>([]);

  const lastFired = useRef<Record<Alert["type"], number>>({
    info: 0,
    warning: 0,
    danger: 0,
    none: 0,
  });

  const firedCustomAlertIdxs = useRef<Set<number>>(new Set());

  const audioRefs = useRef<Record<Alert["type"], HTMLAudioElement | null>>({
    info: null,
    warning: null,
    danger: null,
    none: null,
  });

  useEffect(() => {
    audioRefs.current.info = new Audio("/sounds/info.wav");
    audioRefs.current.warning = new Audio("/sounds/warning.wav");
    audioRefs.current.danger = new Audio("/sounds/danger.wav");
    audioRefs.current.none = new Audio("/sounds/notification.wav");
  }, []);

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

    if (
      currentPoint.isAlert &&
      currentPoint.alert &&
      !firedCustomAlertIdxs.current.has(currentPolylineIdx)
    ) {
      newAlerts.push(currentPoint.alert);
      firedCustomAlertIdxs.current.add(currentPolylineIdx);
    }

    const lookahead = 5;
    const angleThreshold = 20;
    const distanceThreshold = 500;

    const calcHeading = (i: number) => {
      const p1 = polyline[i];
      const p2 = polyline[i + 1];
      return google.maps.geometry.spherical.computeHeading(
        new google.maps.LatLng(p1.latitude, p1.longitude),
        new google.maps.LatLng(p2.latitude, p2.longitude)
      );
    };

    if (currentPolylineIdx + 1 <= maxIdx) {
      const maxLook = Math.min(lookahead, maxIdx - currentPolylineIdx - 1);
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
        speed: true,
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
        speed: true,
      });
      lastFired.current.warning = now;
    }

    if (newAlerts.length) {
      setAlerts((prev) => [...newAlerts, ...prev]);

      const firstAlert = newAlerts[0];
      const audioToPlay = audioRefs.current[firstAlert.type];

      if (audioToPlay) {
        audioToPlay.currentTime = 0;
        audioToPlay.play().catch(() => {});
      }
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
  const styleMap = {
    info: {
      bg: "bg-blue-400/30",
      border: "border-blue-400",
      Icon: CiCircleAlert,
    },
    warning: {
      bg: "bg-yellow-400/30",
      border: "border-yellow-400",
      Icon: FiAlertTriangle,
    },
    danger: {
      bg: "bg-red-400/30",
      border: "border-red-400",
      Icon: CgDanger,
    },
    none: {
      bg: "bg-gray-400/30",
      border: "border-gray-400",
      Icon: MdAddCircleOutline,
    },
  };

  const { bg, border, Icon } = styleMap[type];

  return (
    <AlertUI className={cn("w-full border-2", bg, border)}>
      <Icon className={`h-4 w-4 ${border.replace("border", "text")}`} />
      <AlertTitle className="capitalize">{type}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </AlertUI>
  );
};
