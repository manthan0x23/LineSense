import type { Point } from "@/lib/types";
import { useMap } from "@vis.gl/react-google-maps";
import { useEffect } from "react";

type InteractiveAlertPolylineProps = {
    polyline_: Point[];
    color: string;
    onClick?: (lat: number, lng: number) => void;
};

const InteractiveAlertPolyline = ({
    polyline_,
    color,
    onClick,
}: InteractiveAlertPolylineProps) => {
    const map = useMap();

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

        // Add click listener
        if (onClick) {
            polyline.addListener("click", (e: google.maps.MapMouseEvent) => {
                if (e.latLng) {
                    onClick(e.latLng.lat(), e.latLng.lng());
                }
            });
        }

        return () => {
            polyline.setMap(null);
        };
    }, [map, polyline_, color, onClick]);

    return null;
};

export default InteractiveAlertPolyline;
