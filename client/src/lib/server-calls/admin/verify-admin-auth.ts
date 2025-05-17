import axios from "axios";
import { application } from "../../utils";

export const verifyAdminAuth = async (): Promise<boolean> => {
  try {
    const response = await axios.get(application.server + "/admin/verify", {
      withCredentials: true,
      xsrfCookieName: "token",
    });

    if (!response.data.user) {
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
};
