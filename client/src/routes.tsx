import { Routes, Route } from "react-router-dom";
import { Login } from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import PrivateRoute from "./PrivateRoute";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./layouts/DashboardLayout";
import { NotificationProvider } from "./context/NotificationContext";

export default function AppRoutes() {
  return (
    <NotificationProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={<PrivateRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </NotificationProvider>
  );
}
