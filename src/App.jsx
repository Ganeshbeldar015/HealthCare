import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";

/* Public */
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UpdatePassword from "./pages/UpdatePassword";

/* Patient */
import PatientR from "./pages/PatientR";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Appointments from "./pages/Appointments";
import Notifications from "./pages/Notifications";

/* Doctor */
import DoctorSignup from "./pages/DoctorSignup";
import DoctorForm from "./pages/DoctorForm";
import DoctorWaiting from "./pages/DoctorWaiting";
import DoctorDashboard from "./pages/DoctorDashboard";

/* Admin */
import AdminDashboard from "./pages/AdminDashboard";

/* Layouts & Guards */
import TopPanel from "./components/TopPanel";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import ProfileGuard from "./components/ProfileGuard";
import AdminRoute from "./components/AdminRoute";

function App() {
  const location = useLocation();

  // 🚫 Pages without TopPanel
  const hideTopPanelRoutes = [
    "/",
    "/login",
    "/signup",
    "/doctor-signup",
    "/update-password",
  ];

  const hideTopPanel = hideTopPanelRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50">
      {!hideTopPanel && <TopPanel />}

      <main className={hideTopPanel ? "" : "pt-4"}>
        <Routes>

          {/* 🌐 PUBLIC ROUTES */}
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/doctor-signup" element={<DoctorSignup />} />
          <Route path="/update-password" element={<UpdatePassword />} />

          {/* 🧍 PATIENT REGISTRATION */}
          <Route
            path="/patientR"
            element={
              <ProtectedRoute role="patient">
                <PatientR />
              </ProtectedRoute>
            }
          />

          {/* 🧾 PATIENT DASHBOARD + SIDEBAR */}
          <Route
            element={
              <ProtectedRoute role="patient">
                <ProfileGuard>
                  <DashboardLayout />
                </ProfileGuard>
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/records" element={<div>Records</div>} />
            <Route path="/prescription" element={<div>Prescription</div>} />
            <Route path="/billing" element={<div>Billing</div>} />

          </Route>

          {/* 👨‍⚕️ DOCTOR FLOW */}
          <Route
            path="/doctor-form"
            element={
              <ProtectedRoute role="doctor">
                <DoctorForm />
              </ProtectedRoute>
            }
          />
          {/* 🔔 Notifications (Doctor + Patient) */}
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctor-waiting"
            element={
              <ProtectedRoute role="doctor">
                <DoctorWaiting />
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctor-dashboard"
            element={
              <ProtectedRoute role="doctor">
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />

          {/* 🛡️ ADMIN (ONLY ONE ROUTE, CORRECT) */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          {/* ❓ FALLBACK */}
          <Route path="*" element={<Welcome />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
