import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLadderData } from "@/lib/hooks/useLadderData";
import { TbTrain } from "react-icons/tb";
import { GoArrowSwitch } from "react-icons/go";
import { HomeButton } from "./home-button";

const PannelPage = () => {
  const data = useLadderData();

  return (
    <div className="h-[100vh] w-[100wh] p-5 relative">
      <HomeButton />
      <div className="h-[10%] w-full flex p-4 justify-start items-center text-3xl gap-2">
        <TbTrain className="text-muted-foreground" size={33} />
        <p className="font-bold">Routes</p>
      </div>
      <div className="h-[90%] w-full  flex justify-start items-start gap-4">
        {data &&
          data.map((metroL) => {
            return (
              <Card
                onClick={() => {
                  window.location.assign(`/admin/pannel/${metroL.id}`);
                }}
                className="w-[20rem] relative overflow-hidden cursor-pointer hover:scale-102 transition-all"
                key={metroL.id}
              >
                <div
                  className="absolute bottom-0 right h-1 w-full"
                  style={{ backgroundColor: metroL.color }}
                />
                <CardHeader>
                  <CardTitle className="">{metroL.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-2 items-center text-sm justify-start">
                  <p>{metroL.start.name}</p>
                  <GoArrowSwitch style={{ color: metroL.color }} />
                  <p>{metroL.end.name}</p>
                </CardContent>
              </Card>
            );
          })}
      </div>
    </div>
  );
};

export default PannelPage;
