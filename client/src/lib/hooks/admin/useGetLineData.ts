import { fetchLineInfo } from "@/lib/server-calls/fetch-line-info";
import type { MetroLine } from "@/lib/types";
import { useEffect, useState } from "react";
import { useParams } from "react-router";

const useGetLineData = () => {
  const { lineId } = useParams();
  const [data, setData] = useState<MetroLine | null>(null);

  useEffect(() => {
    if (lineId && Number(lineId) <= 12)
      fetchLineInfo(Number(lineId)).then((D) => {
        if (D) {
          setData(D);
        } else {
          window.location.assign("/admin/pannel");
        }
      });
  }, [lineId]);

  return data;
};

export default useGetLineData;
