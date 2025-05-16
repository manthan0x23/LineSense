import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouteStore } from "@/store/useRouteStore";
import { TbTrain } from "react-icons/tb";
import { LiaArrowsAltHSolid } from "react-icons/lia";
import { useMemo } from "react";
import { FaArrowRight } from "react-icons/fa6";
import type { MetroStation } from "@/lib/types";

const DisplayInfo = () => {
  const { route, resetRoute, } = useRouteStore((state) => state);


  const startStation: MetroStation | null = useMemo(() => {
    return route.Line?.stations.find((s) => s.id === route.startStationId) || null;
  }, [route.startStationId, route.Line]);

  const endStation: MetroStation | null = useMemo(() => {
    return route.Line?.stations.find((s) => s.id === route.endStationId) || null;
  }, [route.endStationId, route.Line]);

  if (!route.Line || !startStation || !endStation) return null;

  const handleCancel = () => {
    resetRoute();
    window.location.assign("/");
  };

  return (
    <Card className="h-[10%] w-full relative px-4 py-1 overflow-hidden shadow-lg">
      <div className="w-full h-full flex items-center justify-between">
        <div className="w-auto h-full flex justify-start items-center gap-3">
          <TbTrain size={34} className="text-muted-foreground" />
          <div className="h-full flex flex-col items-start justify-center gap-1">
            <p className="text-md font-medium">{route.Line.name}</p>
            <p className="flex justify-start items-center gap-3 text-sm">
              <span className="font-normal">{route.Line.start.name}</span>
              <LiaArrowsAltHSolid style={{ color: route.Line.color }} />
              <span className="font-normal">{route.Line.end.name}</span>
            </p>
          </div>
        </div>

        <div className="w-auto h-full flex justify-start items-center gap-3">
          <div className="h-full flex flex-col items-start justify-center gap-1">
            <span className="text-md font-medium flex gap-2 items-center justify-start">
              <p>Journey</p>
              <Badge
                onClick={handleCancel}
                variant="outline"
                className="cursor-pointer"
              >
                Reset
              </Badge>
              <Badge>{route.type}</Badge>
            </span>
            <span className="flex justify-start items-center gap-3 text-sm">
              <span className="font-normal">{startStation.name}</span>
              <FaArrowRight style={{ color: route.Line.color }} />
              <span className="font-normal">{endStation.name}</span>
            </span>
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 w-full h-1"
        style={{ backgroundColor: route.Line.color }}
      />
    </Card>
  );
};

export default DisplayInfo;
