import useVerifyAdmin from "@/lib/hooks/admin/useVerifyAdmin"
import { Outlet } from "react-router";

const Page = () => {
    useVerifyAdmin();

    return (
        <Outlet />
    )
}

export default Page