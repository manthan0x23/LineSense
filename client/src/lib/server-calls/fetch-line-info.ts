import axios from "axios";
import type { MetroLine } from "../types";
import { application } from "../utils";

export const fetchLineInfo = async (
  lineId: number
): Promise<MetroLine | null> => {
  try {
    const response = await axios.get(
      application.server + `/data/line-info/${lineId}`
    );

    return response.data as MetroLine;
  } catch (error) {
    return null;
  }
};
