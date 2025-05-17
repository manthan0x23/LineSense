import { application } from "@/lib/utils";
import axios from "axios";

export const registerAdmin = async (
  email: string,
  password: string
): Promise<boolean> => {
  try {
    const response = await axios.post(
      application.server + "/admin/register",
      { email, password },
      { withCredentials: true }
    );

    return response.status === 201;
  } catch (error) {
    console.error("Register failed:", error);
    return false;
  }
};
