import { useCheckInitRoute } from "@/lib/hooks/useCheckInitRoute";
import { Outlet } from "react-router";

export const Root = () => {
  useCheckInitRoute();
  return (
    <div className="p-0 m-0 h-[100vh] w-[100vw] overflow-hidden">
      <Outlet />
    </div>
  );
};
