import { Outlet } from "react-router-dom";
import { useAuth } from "../utils/useAuth";

import DashboardLayout from "./DashboardLayout";
import DoctorDashboardLayout from "./DoctorDashboardLayout";

export default function RoleBasedLayout() {
  const { userData } = useAuth();

  if (!userData) return null;

  // 🧍 Patient layout
  if (userData.role === "patient") {
    return <DashboardLayout />;
  }

  // 👨‍⚕️ Doctor layout
  if (userData.role === "doctor") {
    return <DoctorDashboardLayout />;
  }

  // 🛡️ Admin or fallback
  return <Outlet />;
}
