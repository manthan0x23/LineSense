import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useGetLineData from "@/lib/hooks/admin/useGetLineData";
import {
  AdvancedMarker,
  APIProvider,
  Map as GoogleMap,
} from "@vis.gl/react-google-maps";
import InteractiveAlertPolyline from "./polyline";
import type { MapMouseEvent } from "@vis.gl/react-google-maps";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addPoint } from "@/lib/server-calls/admin/add-point"; // import your deletePoint call here
import type { Alert, Point } from "@/lib/types";
import { FaCircle } from "react-icons/fa6";
import { CiEdit } from "react-icons/ci";
import { toast } from "sonner";
import { deletePoint } from "@/lib/server-calls/admin/delete-point";
import { updatePoint } from "@/lib/server-calls/admin/update-point";

type AlertType = Alert["type"];

interface AlertPoint {
  latitude: number;
  longitude: number;
  message: string;
  speed: {
    min: number;
    max: number;
  };
  type: AlertType;
  isFixed: boolean;
  isAlert: boolean;
}

const typeToColor = {
  info: "#00b9ff",
  warning: "#ffe800",
  danger: "#ff0000",
};

const getPolylineCenter = (points: Point[]): google.maps.LatLngLiteral => {
  const lats = points.map((p) => p.latitude);
  const lngs = points.map((p) => p.longitude);

  const avgLat = lats.reduce((a, b) => a + b, 0) / lats.length;
  const avgLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;

  return { lat: avgLat, lng: avgLng };
};

const RouteLineAdmin = () => {
  const Line = useGetLineData();
  const [_alertPoints, setAlertPoints] = useState<AlertPoint[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<AlertPoint>({
    latitude: 0,
    longitude: 0,
    message: "",
    speed: { min: 0, max: 0 },
    type: "info",
    isFixed: false,
    isAlert: false,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<AlertPoint | null>(null);

  const reloadWindow = () => {
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  console.log(formData);

  useEffect(() => {
    if (!deleteDialogOpen) {
      setIsEditing(false);
    }
  }, [deleteDialogOpen]);

  useEffect(() => {
    if (Line?.polyline) {
      const alerts = Line.polyline
        .filter((point) => point.isAlert && !point.isFixed)
        .map((point) => ({
          latitude: point.latitude,
          longitude: point.longitude,
          message: point.alert?.message ?? "",
          speed: { min: point.speed.min ?? 0, max: point.speed.max ?? 0 },
          type: point.alert?.type ?? "info",
          isFixed: point.isFixed,
          isAlert: point.isAlert,
        }));
      setAlertPoints(alerts);
    }
  }, [Line]);

  if (!Line) return null;

  const start = { lat: Line.start.latitude, lng: Line.start.longitude };
  const end = { lat: Line.end.latitude, lng: Line.end.longitude };

  function distanceFromPointToSegment(
    p: google.maps.LatLng,
    v: google.maps.LatLng,
    w: google.maps.LatLng
  ): number {
    const latLngToPoint = (latlng: google.maps.LatLng) => {
      const R = 6371000; // Earth radius in meters
      const lat = (latlng.lat() * Math.PI) / 180;
      const lng = (latlng.lng() * Math.PI) / 180;
      return {
        x: R * Math.cos(lat) * Math.cos(lng),
        y: R * Math.cos(lat) * Math.sin(lng),
        z: R * Math.sin(lat),
      };
    };

    const pPoint = latLngToPoint(p);
    const vPoint = latLngToPoint(v);
    const wPoint = latLngToPoint(w);

    const l2 =
      (wPoint.x - vPoint.x) ** 2 +
      (wPoint.y - vPoint.y) ** 2 +
      (wPoint.z - vPoint.z) ** 2;
    if (l2 === 0) {
      // v == w case
      return distanceBetweenPoints(pPoint, vPoint);
    }

    let t =
      ((pPoint.x - vPoint.x) * (wPoint.x - vPoint.x) +
        (pPoint.y - vPoint.y) * (wPoint.y - vPoint.y) +
        (pPoint.z - vPoint.z) * (wPoint.z - vPoint.z)) /
      l2;

    t = Math.max(0, Math.min(1, t));

    const projection = {
      x: vPoint.x + t * (wPoint.x - vPoint.x),
      y: vPoint.y + t * (wPoint.y - vPoint.y),
      z: vPoint.z + t * (wPoint.z - vPoint.z),
    };

    return distanceBetweenPoints(pPoint, projection);
  }

  function distanceBetweenPoints(
    a: { x: number; y: number; z: number },
    b: { x: number; y: number; z: number }
  ): number {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2);
  }

  const isPointNearPolyline = (
    point: { lat: number; lng: number },
    polyline: { latitude: number; longitude: number }[],
    thresholdMeters: number
  ) => {
    if (!window.google || !window.google.maps) return false;

    const p = new window.google.maps.LatLng(point.lat, point.lng);

    for (let i = 0; i < polyline.length - 1; i++) {
      const v = new window.google.maps.LatLng(
        polyline[i].latitude,
        polyline[i].longitude
      );
      const w = new window.google.maps.LatLng(
        polyline[i + 1].latitude,
        polyline[i + 1].longitude
      );

      const dist = distanceFromPointToSegment(p, v, w);
      if (dist <= thresholdMeters) return true;
    }

    return false;
  };

  const handleMapClick = (event: MapMouseEvent) => {
    const { latLng } = event.detail;
    if (!latLng) return;

    const lat = latLng.lat;
    const lng = latLng.lng;

    // Check if clicked point is near the polyline
    const nearPolyline = isPointNearPolyline({ lat, lng }, Line.polyline!, 10); // 10 meters threshold

    if (!nearPolyline) {
      toast.error("Please click near the polyline to add an alert point.", {
        richColors: true,
      });
      return;
    }

    setFormData({
      latitude: lat,
      longitude: lng,
      message: "",
      speed: { min: 0, max: 0 },
      type: "info",
      isFixed: false,
      isAlert: true,
    });
    setDialogOpen(true);
  };

  const handleAddAlert = async () => {
    const success = await addPoint({
      ...formData,
      lineId: Line.id!,
      type: formData.type,
    });

    if (success) {
      setAlertPoints((prev) => [...prev, formData]);
      setDialogOpen(false);
      toast.success("Point alert successfully created", { richColors: true });
      reloadWindow();
    } else {
      toast.error("Failed to add alert point.", { richColors: true });
    }
  };

  const handleUpdateAlertPoint = async () => {
    if (!selectedPoint || !Line) return;

    const success = await updatePoint({
      latitude: selectedPoint.latitude,
      longitude: selectedPoint.longitude,
      lineId: Line.id!,
      message: selectedPoint.message,
      type: selectedPoint.type,
      speed: {
        min: selectedPoint.speed.min,
        max: selectedPoint.speed.max,
      },
    });

    if (success) {
      setAlertPoints((prev) =>
        prev.map((point) => {
          const isSame =
            point.latitude === selectedPoint.latitude &&
            point.longitude === selectedPoint.longitude;

          return isSame
            ? {
                ...point,
                message: formData.message,
                type: formData.type,
                speed: { ...formData.speed },
              }
            : point;
        })
      );

      toast.success("Alert point successfully updated", { richColors: true });
      setDeleteDialogOpen(false);
      setSelectedPoint(null);
      reloadWindow();
    } else {
      toast.error("Failed to update alert point.", { richColors: true });
    }
  };

  const handleDeleteSelectedPoint = async () => {
    if (!selectedPoint || !Line) return;

    const success = await deletePoint({
      latitude: selectedPoint.latitude,
      longitude: selectedPoint.longitude,
      lineId: Line.id!,
    });

    if (success) {
      setAlertPoints((prev) =>
        prev.filter(
          (p) =>
            !(
              p.latitude === selectedPoint.latitude &&
              p.longitude === selectedPoint.longitude
            )
        )
      );
      setDeleteDialogOpen(false);
      setSelectedPoint(null);
      toast.success("Point alert successfully deleted", { richColors: true });
      reloadWindow();
    } else {
      toast.error("Failed to delete alert point.", { richColors: true });
    }
  };

  if (!Line.polyline) return null;

  return (
    <div className="h-[100vh] w-[100vw] flex justify-center items-center relative">
      <div className="w-full h-full p-4 overflow-hidden rounded-lg">
        <APIProvider
          apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
          libraries={["geometry"]}
        >
          <GoogleMap
            mapId={import.meta.env.VITE_GOOGLE_MAP_ID}
            className="h-full w-full"
            defaultCenter={getPolylineCenter(Line.polyline)}
            defaultZoom={13}
            gestureHandling="greedy"
            onClick={handleMapClick}
          >
            <AdvancedMarker position={start} />
            <AdvancedMarker position={end} />

            {Line.polyline && (
              <>
                <InteractiveAlertPolyline
                  polyline_={Line.polyline}
                  color={Line.color}
                />
                {Line.polyline.map((point) => {
                  {
                    return (
                      <AdvancedMarker
                        key={`${point.latitude}-${point.longitude}`}
                        position={{ lat: point.latitude, lng: point.longitude }}
                        onClick={() => {
                          setSelectedPoint({
                            latitude: point.latitude,
                            longitude: point.longitude,
                            message: point.alert?.message ?? "",
                            speed: {
                              min: point.speed.min ?? 0,
                              max: point.speed.max ?? 0,
                            },
                            type: !point.isAlert ? "none" : point.alert?.type!,
                            isFixed: point.isFixed,
                            isAlert: point.isAlert,
                          });
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <div className="cursor-pointer">
                          <FaCircle
                            className=" border-2 rounded-full border-white"
                            style={{
                              color: !point.isAlert
                                ? "#808080"
                                : point.alert?.type === "info"
                                ? typeToColor.info
                                : point.alert?.type === "warning"
                                ? typeToColor.warning
                                : typeToColor.danger,
                            }}
                            size={20}
                          />
                        </div>
                      </AdvancedMarker>
                    );
                  }
                  return null;
                })}
              </>
            )}
          </GoogleMap>
        </APIProvider>
      </div>

      {/* Add Alert Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">Add Alert Point</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Latitude</Label>
                <Input
                  type="number"
                  value={formData.latitude}
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Longitude</Label>
                <Input
                  type="number"
                  value={formData.longitude}
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Alert Message</Label>
              <Input
                placeholder="Enter alert message"
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Min Speed (km/h)</Label>
                <Input
                  type="number"
                  min={0}
                  value={formData.speed.min}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      speed: { ...formData.speed, min: Number(e.target.value) },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Max Speed (km/h)</Label>
                <Input
                  type="number"
                  min={0}
                  value={formData.speed.max}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      speed: { ...formData.speed, max: Number(e.target.value) },
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Alert Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value as AlertType })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select alert type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="danger">Danger</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleAddAlert}>Add Alert</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg flex items-center justify-between">
              Point
              {
                <Button
                  variant={isEditing ? "default" : "outline"}
                  size="icon"
                  className="cursor-pointer"
                  onClick={() => setIsEditing((v) => !v)}
                >
                  <CiEdit />
                </Button>
              }
            </DialogTitle>
          </DialogHeader>

          {selectedPoint && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Latitude</Label>
                  <Input disabled value={selectedPoint.latitude} />
                </div>
                <div className="space-y-2">
                  <Label>Longitude</Label>
                  <Input disabled value={selectedPoint.longitude} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Message</Label>
                <Input
                  disabled={!isEditing}
                  value={selectedPoint.message}
                  onChange={(e) =>
                    setSelectedPoint({
                      ...selectedPoint,
                      message: e.target.value,
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Min Speed</Label>
                  <Input
                    disabled={!isEditing}
                    value={selectedPoint.speed.min}
                    type="number"
                    onChange={(e) =>
                      setSelectedPoint({
                        ...selectedPoint,
                        speed: {
                          ...selectedPoint.speed,
                          min: Number(e.target.value),
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Speed</Label>
                  <Input
                    disabled={!isEditing}
                    value={selectedPoint.speed.max}
                    type="number"
                    onChange={(e) =>
                      setSelectedPoint({
                        ...selectedPoint,
                        speed: {
                          ...selectedPoint.speed,
                          max: Number(e.target.value),
                        },
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Alert Type</Label>
                <Select
                  value={selectedPoint.type}
                  disabled={!isEditing}
                  onValueChange={(value) =>
                    setSelectedPoint({
                      ...selectedPoint,
                      type: value as AlertType,
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      <div className="rounded-full w-3 h-3 bg-gray-500" />
                      None
                    </SelectItem>
                    <SelectItem value="info">
                      <div className="rounded-full w-3 h-3 bg-blue-500" />
                      Info
                    </SelectItem>
                    <SelectItem value="warning">
                      <div className="rounded-full w-3 h-3 bg-yellow-500" />
                      Warning
                    </SelectItem>
                    <SelectItem value="danger">
                      <div className="rounded-full w-3 h-3 bg-red-500" />
                      Danger
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setDeleteDialogOpen(false);
                    setIsEditing(false);
                  }}
                >
                  Close
                </Button>

                {isEditing ? (
                  <Button onClick={handleUpdateAlertPoint}>Update</Button>
                ) : (
                  <Button
                    variant="destructive"
                    onClick={handleDeleteSelectedPoint}
                    disabled={selectedPoint.isFixed}
                  >
                    Delete
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RouteLineAdmin;
