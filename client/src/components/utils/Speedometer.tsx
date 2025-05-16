import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { RouteType } from "@/store/useRouteStore";
import { useSimulationStore } from "@/store/useSimulationStore";
import { useMemo } from "react";

const mutlis = [2, 5, 10, 12, 15, 20];

export const SpeedometerCard = ({ routeType }: { routeType: RouteType }) => {
  const { speed, multiplier, setMultiplier, currentPolylineIdx, polyline } =
    useSimulationStore();

  const speedLimits = useMemo(() => {
    if (currentPolylineIdx < 0) return null;
    return polyline[currentPolylineIdx] || null;
  }, [currentPolylineIdx]);

  const effectiveSpeed = (speed * multiplier) / 10;
  const maxSpeed = speedLimits?.speed.max;

  const speedColor = useMemo(() => {
    if (maxSpeed && effectiveSpeed > maxSpeed * 1.2) {
      return "text-red-600";
    } else if (maxSpeed && effectiveSpeed > maxSpeed * 1.1) {
      return "text-yellow-500";
    } else {
      return "text-green-600";
    }
  }, [effectiveSpeed, maxSpeed]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Speed</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
        <div className={cn("text-3xl font-bold", speedColor)}>
          {effectiveSpeed.toFixed(1)} km/h
        </div>
        <div className="text-sm text-muted-foreground">
          {routeType === "calibrate" ? "Live Speed" : "Simulated Speed"}
        </div>

        {routeType === "simulate" && (
          <div className="inline-flex border border-border rounded-full overflow-hidden bg-background shadow-sm">
            {mutlis.map((multi, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={() => setMultiplier(multi)}
                className={cn(
                  "px-4 py-2 rounded-none text-xs font-medium transition-all",
                  multiplier === multi
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                )}
              >
                {multi / 10}x
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
