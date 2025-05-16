import { useEffect, useState } from "react";
import type { MetroLine } from "../types";
import { fetchLadderData } from "../server-calls/fetch-ladder-data";
import { useLoadingStore } from "@/store/useLoadingStore";

export const useLadderData = () => {
  const [data, setData] = useState<MetroLine[]>([]);
  const { setLoading } = useLoadingStore();

  useEffect(() => {
    setLoading();
    fetchLadderData()
      .then((d) => {
        setData(d);
        setLoading();
      })
      .catch((_) => {
        setLoading();
      });
  }, []);

  return data;
};
