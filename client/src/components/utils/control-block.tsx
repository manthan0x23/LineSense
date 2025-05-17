import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSimulationStore } from "@/store/useSimulationStore";

const ControlPanel = () => {
  const { status, setStatus } = useSimulationStore((state) => state);

  const handleStart = () => setStatus("running");
  const handleReset = () => {
    window.location.reload();
  };

  return (
    <Card>
      <div className="flex flex-wrap gap-2 justify-center">
        {status === "idle" && (
          <Button onClick={handleStart} className="w-24">
            Start
          </Button>
        )}

        {status == "running" && (
          <Button onClick={handleReset} variant="destructive" className="w-24">
            Reset
          </Button>
        )}
      </div>
    </Card>
  );
};

export default ControlPanel;
