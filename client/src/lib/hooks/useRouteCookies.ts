import { useRouteStore, type Route } from "@/store/useRouteStore";
import Cookies from "js-cookie";
import { useEffect } from "react";
import { application } from "../utils";
import { useNavigate } from "react-router";

export const useRouteCookies = () => {
  const navigate = useNavigate();
  const { setRoute, resetRoute } = useRouteStore((state) => state);

  useEffect(() => {
    const cookie = Cookies.get(application.routeConfigLiteral);
    if (!cookie) {
      resetRoute();
      navigate("/ladder");
      return;
    }
    const data: Route = JSON.parse(cookie);
    setRoute(data);
  }, []);
};
