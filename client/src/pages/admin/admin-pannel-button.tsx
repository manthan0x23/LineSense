import { Button } from "@/components/ui/button"
import { MdAdminPanelSettings } from "react-icons/md"

export const AdminPannelButton = () => {
    return <Button onClick={() => {
        window.location.assign("/admin");
    }} className="absolute top-0 right-0 m-5 text-sm font-normal cursor-pointer" >
        <MdAdminPanelSettings />
        <p>
            Admin
        </p>
    </Button>
}