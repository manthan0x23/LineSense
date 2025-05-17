import type { Point } from "@/lib/types";
import { application } from "@/lib/utils";
import axios from "axios";

interface DeletePointPayload {
  latitude: number;
  longitude: number;
  lineId: number;
}

export const deletePoint = async (
  pointData: DeletePointPayload
): Promise<Point[]> => {
  try {
    const response = await axios.delete(
      application.server + "/update/delete-point",
      {
        data: pointData,
        withCredentials: true,
      }
    );

    return response.data.polyline as Point[];
  } catch (error) {
    console.error("Delete point failed:", error);
    throw new Error("Delete point failed");
  }
};
