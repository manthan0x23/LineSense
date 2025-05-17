import { application } from "@/lib/utils";
import axios from "axios";

export const loginAdmin = async (
  username: string,
  password: string
): Promise<boolean> => {
  try {
    const response = await axios.post(
      application.server + "/admin/login",
      { username, password },
      { withCredentials: true }
    );

    return response.status === 200;
  } catch (error) {
    console.error("Login failed:", error);
    return false;
  }
};
