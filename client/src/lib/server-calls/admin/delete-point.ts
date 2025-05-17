import { application } from "@/lib/utils";
import axios from "axios";

interface DeletePointPayload {
  latitude: number;
  longitude: number;
  lineId: number;
}

export const deletePoint = async (
  pointData: DeletePointPayload
): Promise<boolean> => {
  try {
    const response = await axios.delete(
      application.server + "/update/delete-point",
      {
        data: pointData,
        withCredentials: true,
      }
    );

    return response.status === 200;
  } catch (error) {
    console.error("Delete point failed:", error);
    return false;
  }
};
