import { useState, useEffect } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import axios from "axios";
import { ENV } from "./core/config";
import { useNotification } from "./context/NotificationContext";

export default function PrivateRoute() {
  const navigate = useNavigate();
  const notify = useNotification();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(`${ENV.API_URL}/auth/me`, {
          withCredentials: true,
        });
        if (response.status === 200) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.status === 401) {
          notify.error("Session Expired. Please login!");
          navigate("/");
        }
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return <div className="text-center mt-10">Checking authentication...</div>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
}
