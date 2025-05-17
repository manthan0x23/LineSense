import useVerifyAdmin from "@/lib/hooks/admin/useVerifyAdmin";
import { Outlet } from "react-router";
import { Toaster } from "sonner";

const Page = () => {
  useVerifyAdmin();

  return (
    <>
      <Outlet />
      <Toaster />
    </>
  );
};

export default Page;
