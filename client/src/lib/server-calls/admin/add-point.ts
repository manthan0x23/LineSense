import type { Alert, Point } from "@/lib/types";
import { application } from "@/lib/utils";
import axios from "axios";

interface Speed {
  min: number;
  max: number;
}

interface AddPointPayload {
  latitude: number;
  longitude: number;
  message: string;
  speed: Speed;
  type: Alert["type"];
  lineId: number;
}

export const addPoint = async (
  pointData: AddPointPayload
): Promise<Point[]> => {
  try {
    const response = await axios.put(
      application.server + "/update/add-point",
      pointData,
      { withCredentials: true }
    );

    return response.data.polyline as Point[];
  } catch (error) {
    console.error("Add point failed:", error);
    throw new Error("Add point failed");
  }
};
