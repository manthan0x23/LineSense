import { createBrowserRouter } from "react-router";
import { Root } from "./pages/root";
import Landing from "./pages/landing/page";
import Ladder from "./pages/ladder/page";
import Simulate from "./pages/simulate/page";
import Calibrate from "./pages/calibrate/page";
import AdminRoot from "./pages/admin/admin-root";
import LoginPage from "./pages/admin/auth/login";
import PannelPage from "./pages/admin/pannel/page";
import RegisterPage from "./pages/admin/auth/register";
import RouteLineAdmin from "./pages/admin/pannel/[pageId]/page";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Landing },
      { path: "ladder", Component: Ladder },
      { path: "calibrate", Component: Calibrate },
      { path: "simulate", Component: Simulate },
    ],
  },
  {
    path: "/admin",
    Component: AdminRoot,
    children: [
      {
        path: "login",
        Component: LoginPage,
      },
      {
        path: "register",
        Component: RegisterPage,
      },
      {
        path: "pannel",
        children: [
          { index: true, Component: PannelPage },
          {
            path: ":lineId",
            Component: RouteLineAdmin,
          },
        ],
      },
    ],
  },
]);
