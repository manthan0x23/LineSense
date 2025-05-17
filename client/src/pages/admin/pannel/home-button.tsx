import { Button } from "@/components/ui/button";
import { IoIosTrain } from "react-icons/io";


export const HomeButton = () => {
  return (
    <Button
      onClick={() => {
        window.location.assign("/ladder");
      }}
      className="absolute top-0 right-0 m-5 text-sm font-normal cursor-pointer z-25"
    >
      <IoIosTrain />
      <p>Application</p>
    </Button>
  );
};
