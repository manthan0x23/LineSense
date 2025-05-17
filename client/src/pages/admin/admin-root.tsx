import useVerifyAdmin from "@/lib/hooks/admin/useVerifyAdmin";
import { Outlet } from "react-router";
import { Toaster } from "sonner";
import { HomeButton } from "./pannel/home-button";

const Page = () => {
  useVerifyAdmin();

  return (
    <>
      <HomeButton />
      <Outlet />
      <Toaster />
    </>
  );
};

export default Page;
