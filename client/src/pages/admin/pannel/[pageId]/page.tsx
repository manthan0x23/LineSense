import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
import { addPoint } from "@/lib/server-calls/admin/add-point";
import { deletePoint } from "@/lib/server-calls/admin/delete-point"; // import your deletePoint call here
import type { Alert } from "@/lib/types";
import { FaCircle } from "react-icons/fa6";

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
}

const typeToColor = {
    "info": "#00b9ff",
    "warning": "#ffe800",
    "danger": "#ff0000"
}

const RouteLineAdmin = () => {
    const Line = useGetLineData();
    const [alertPoints, setAlertPoints] = useState<AlertPoint[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [formData, setFormData] = useState<AlertPoint>({
        latitude: 0,
        longitude: 0,
        message: "",
        speed: { min: 0, max: 0 },
        type: "info",
    });

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedPoint, setSelectedPoint] = useState<AlertPoint | null>(null);

    // Load alert points from Line.polyline on mount or Line change
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
        // Convert latLng to Cartesian coordinates (x, y, z)
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
        return Math.sqrt(
            (a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2
        );
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
            alert("Please click near the polyline to add an alert point.");
            return;
        }

        setFormData({
            latitude: lat,
            longitude: lng,
            message: "",
            speed: { min: 0, max: 0 },
            type: "info",
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
        } else {
            alert("Failed to add alert point.");
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
        } else {
            alert("Failed to delete alert point.");
        }
    };

    return (
        <div className="h-[100vh] w-[100vw] flex justify-center items-center">
            <div className="w-full h-full p-4 overflow-hidden rounded-lg">
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
                                    if (!point.isFixed && point.isAlert) {
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
                                                        type: point.alert?.type ?? "info",
                                                    });
                                                    setDeleteDialogOpen(true);
                                                }}
                                            >
                                                <div className="cursor-pointer">
                                                    <FaCircle
                                                        className=" border-2 rounded-full border-white"
                                                        style={{
                                                            color: point.alert?.type === "info" ? typeToColor.info : point.alert?.type === "warning" ? typeToColor.warning : typeToColor.danger
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

            {/* Delete Alert Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-lg">Delete Alert Point</DialogTitle>
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
                                <Input disabled value={selectedPoint.message} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Min Speed</Label>
                                    <Input disabled value={selectedPoint.speed.min} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Max Speed</Label>
                                    <Input disabled value={selectedPoint.speed.max} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Alert Type</Label>
                                <Input disabled value={selectedPoint.type} />
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    variant="secondary"
                                    onClick={() => setDeleteDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button variant="destructive" onClick={handleDeleteSelectedPoint}>
                                    Delete
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default RouteLineAdmin;
