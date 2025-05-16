import { useRouteStore } from "@/store/useRouteStore";
import { useEffect } from "react";
import { fetchLineInfo } from "../server-calls/fetch-line-info";

export const useLineInfo = () => {
  const {
    setLineData,
    route: { lineId },
  } = useRouteStore();

  useEffect(() => {
    if (lineId) {
      fetchLineInfo(lineId).then((data) => {
        if (data) setLineData(data);
      });
    }
  }, [lineId]);
};
