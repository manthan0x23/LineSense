import type { Alert } from "@/lib/types";
import { application } from "@/lib/utils";
import axios from "axios";

interface UpdatePointPayload {
  latitude: number;
  longitude: number;
  lineId: number;
  message: string;
  type: Alert["type"];
  speed: {
    min: number;
    max: number;
  };
}

export const updatePoint = async (
  pointData: UpdatePointPayload
): Promise<boolean> => {
  console.log("in func", pointData);

  try {
    const response = await axios.put(
      application.server + "/update/update-point",
      pointData,
      {
        withCredentials: true,
      }
    );

    return response.status === 200;
  } catch (error) {
    console.error("Update point failed:", error);
    return false;
  }
};
