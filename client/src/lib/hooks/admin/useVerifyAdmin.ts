import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { verifyAdminAuth } from "../../server-calls/admin/verify-admin-auth";

const useVerifyAdmin = () => {
  const [verified, setVerified] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    verifyAdminAuth().then((isValid) => {
      setVerified(isValid);

      const currentPath = location.pathname;

      if (isValid) {
        if (!currentPath.startsWith("/admin/pannel")) {
          navigate("/admin/pannel");
        }
      } else {
        if (!currentPath.startsWith("/admin/login")) {
          navigate("/admin/login");
        }
      }
    });
  }, [location.pathname, navigate]);

  return verified;
};

export default useVerifyAdmin;
