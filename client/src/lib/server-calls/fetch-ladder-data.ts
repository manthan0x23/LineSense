import axios from "axios";
import type { MetroLine } from "../types";
import { application } from "../utils";

export const fetchLadderData = async (): Promise<MetroLine[]> => {
  try {
    const response = await axios.get(application.server + `/data/ladder-data`);

    return response.data as MetroLine[];
  } catch (error) {
    console.error(error);
    return [];
  }
};
