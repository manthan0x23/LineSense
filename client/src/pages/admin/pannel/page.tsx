import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLadderData } from "@/lib/hooks/useLadderData";
import { TbTrain } from "react-icons/tb";
import { GoArrowSwitch } from "react-icons/go";

const PannelPage = () => {
  const data = useLadderData();

  return (
    <div className="flex flex-col h-full w-full p-5">
      <div className="h-[10%] w-full flex p-4 justify-start items-center text-3xl gap-2">
        <TbTrain className="text-muted-foreground" size={33} />
        <p className="font-bold">Routes</p>
      </div>

      <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {data &&
          data.map((metroL) => (
            <Card
              onClick={() => {
                window.location.assign(`/admin/pannel/${metroL.id}`);
              }}
              className="h-40 w-full relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform"
              key={metroL.id}
            >
              <div
                className="absolute bottom-0 right-0 h-1 w-full"
                style={{ backgroundColor: metroL.color }}
              />
              <CardHeader>
                <CardTitle>{metroL.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex gap-2 items-center text-sm justify-start">
                <p>{metroL.start.name}</p>
                <GoArrowSwitch style={{ color: metroL.color }} />
                <p>{metroL.end.name}</p>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
};

export default PannelPage;
