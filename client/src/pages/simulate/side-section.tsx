import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertsStack } from "@/components/utils/AlertsStack";
import { SpeedometerCard } from "@/components/utils/Speedometer";
import { StationInfoCard } from "@/components/utils/StationInfoCard";

export const SimulateSideSection = () => {
  return (
    <ScrollArea className="h-full w-full ">
      <div className="h-auto w-full flex flex-col justify-start gap-5">
        <StationInfoCard />
        <SpeedometerCard routeType="simulate" />
        <AlertsStack />
      </div>
    </ScrollArea>
  );
};
