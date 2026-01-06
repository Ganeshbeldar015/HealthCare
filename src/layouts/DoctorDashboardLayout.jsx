import { Outlet } from "react-router-dom";
import DoctorSidebar from "../components/DoctorSidebar";

function DoctorDashboardLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <DoctorSidebar />

      {/* Main Content */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}

export default DoctorDashboardLayout;
