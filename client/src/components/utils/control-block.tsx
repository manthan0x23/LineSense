import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSimulationStore } from "@/store/useSimulationStore";

const ControlPanel = () => {
  const { status, setStatus } = useSimulationStore((state) => state);

  const handleStart = () => setStatus("running");
  const handlePause = () => setStatus("paused");
  const handleResume = () => setStatus("running");
  const handleReset = () => {
    window.location.reload();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Journey Controls</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-wrap gap-2 justify-center">
        {status === "idle" && (
          <Button onClick={handleStart} className="w-24">
            Start
          </Button>
        )}

        {status === "running" && (
          <Button onClick={handlePause} variant="secondary" className="w-24">
            Pause
          </Button>
        )}

        {status === "paused" && (
          <Button onClick={handleResume} className="w-24">
            Resume
          </Button>
        )}

        <Button onClick={handleReset} variant="destructive" className="w-24">
          Reset
        </Button>
      </CardContent>
    </Card>
  );
};

export default ControlPanel;
