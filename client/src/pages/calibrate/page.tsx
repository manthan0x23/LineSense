import { Card } from "@/components/ui/card";
import { useRouteCookies } from "@/lib/hooks/useRouteCookies";
import DisplayInfo from "../../components/utils/DisplayInfo";
import CalibrateMap from "./map";
import { CalibrateSideSection } from "./side-section";

export default function Page() {
  useRouteCookies();

  return (
    <div className="h-full w-full flex justify-center items-center p-6">
      <div className="h-full w-2/3">
        <DisplayInfo />
        <div className="h-[89%] w-full mt-3 overflow-hidden rounded-lg">
          <CalibrateMap />
        </div>
      </div>
      <div className="h-full w-1/3 ml-3">
        <CalibrateSideSection />
      </div>
    </div>
  );
}
