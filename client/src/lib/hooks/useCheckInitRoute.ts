import Cookies from "js-cookie";
import { useEffect } from "react";
import { application } from "../utils";
import { useNavigate } from "react-router";
import type { Route } from "@/store/useRouteStore";

export const useCheckInitRoute = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const cookie = Cookies.get(application.routeConfigLiteral);

    if (cookie) {
      const data: Route = JSON.parse(cookie);
      navigate(`/${data.type}`);
      return;
    } else {
      navigate(`/ladder`);
      return;
    }
  }, []);
};
