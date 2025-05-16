"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { Label } from "@/components/ui/label";
import { CiCompass1 } from "react-icons/ci";
import { LiaArrowsAltHSolid } from "react-icons/lia";
import Cookies from "js-cookie";
import { application } from "@/lib/utils";
import { useNavigate } from "react-router";
import type { Route, RouteType } from "@/store/useRouteStore";
import { metroLines } from "@/lib/data/metro-lines";
import { TbTrain } from "react-icons/tb";

const Page = () => {
  const navigate = useNavigate();
  const [selectedLineId, setSelectedLineId] = useState<number | null>(null);
  const [startStationId, setStartStationId] = useState<number | null>(null);
  const [endStationId, setEndStationId] = useState<number | null>(null);
  const [intermediateStations, setIntermediateStations] = useState<number[]>(
    []
  );

  const selectedLine = metroLines.find((line) => line.id === selectedLineId);
  const stations = selectedLine?.stations || [];

  const handleLineChange = (val: string) => {
    const id = Number(val);
    setSelectedLineId(id);
    setStartStationId(null);
    setEndStationId(null);
    setIntermediateStations([]);
  };

  let stationOptions: { label: string; value: string }[] = [];
  const startId = startStationId ? Number(startStationId) : null;
  const endId = endStationId ? Number(endStationId) : null;

  if (startId !== null && endId !== null) {
    const [minId, maxId] =
      startId < endId ? [startId, endId] : [endId, startId];

    stationOptions = stations
      .filter((station) => {
        const id = station.id;
        return id > minId && id < maxId;
      })
      .map((station) => ({
        label: station.name,
        value: String(station.id),
      }));
  }

  const storeDataAsCookie = (type: RouteType): void => {
    const data: Route = {
      type,
      lineId: selectedLineId,
      startStationId,
      endStationId,
      intermediateStations,
    };

    Cookies.set(application.routeConfigLiteral, JSON.stringify(data), {
      expires: 1,
    });
  };

  const handleCalibrate = (): void => {
    storeDataAsCookie("calibrate");
    navigate("/calibrate");
  };

  const handlerSimulate = (): void => {
    storeDataAsCookie("simulate");
    navigate("/simulate");
  };

  return (
    <div className="h-full w-full flex items-center justify-center p-6">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle className="flex gap-3 justify-start items-center text-xl">
            <TbTrain className="text-muted-foreground" size={24} />
            <span>Configure Metro Route</span>
          </CardTitle>
          <CardDescription>
            Select line and stations to simulate or calibrate a route.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Metro Line</Label>
            <Select onValueChange={handleLineChange}>
              <SelectTrigger autoFocus className="w-3/4">
                <SelectValue placeholder="Select a line" />
              </SelectTrigger>
              <SelectContent>
                {metroLines.map((line) => {
                  console.log(line);

                  return (
                    <SelectItem key={line.id} value={String(line.id)}>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-4 w-2 rounded"
                          style={{ backgroundColor: line.color }}
                        />
                        <span className="font-medium">{line.start.name}</span>
                        <LiaArrowsAltHSolid />
                        <span className="font-medium">{line.end.name}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {selectedLine && (
            <>
              <div className="space-y-2">
                <Label>Start Station</Label>
                <Select
                  onValueChange={(val) => setStartStationId(Number(val))}
                  value={String(startStationId) || ""}
                >
                  <SelectTrigger className="w-3/4">
                    <SelectValue placeholder="Select start station" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-auto">
                    {stations.map((station) => (
                      <SelectItem key={station.id} value={String(station.id)}>
                        {station.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* End Station */}
              <div className="space-y-2">
                <Label>End Station</Label>
                <Select
                  onValueChange={(val) => setEndStationId(Number(val))}
                  value={String(endStationId) || ""}
                >
                  <SelectTrigger className="w-3/4">
                    <SelectValue placeholder="Select end station" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-auto">
                    {stations.map((station) => (
                      <SelectItem key={station.id} value={String(station.id)}>
                        {station.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Intermediate Stations</Label>
                <MultiSelect
                  options={stationOptions}
                  onValueChange={(vals) =>
                    setIntermediateStations(vals.map((val) => Number(val)))
                  }
                  value={intermediateStations.map((val) => String(val))}
                  placeholder="Select intermediate stations"
                  maxCount={3}
                  disabled={stationOptions.length === 0}
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-4 pt-4">
            <Button
              disabled={!selectedLine || !startStationId || !endStationId}
              onClick={handlerSimulate}
              variant="outline"
              className="cursor-pointer disabled:cursor-not-allowed"
            >
              Simulate
            </Button>
            <Button
              disabled={!selectedLine || !startStationId || !endStationId}
              onClick={handleCalibrate}
              className="cursor-pointer disabled:cursor-not-allowed"
            >
              <CiCompass1 />
              Calibrate
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
