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
import PrescribeInfo from "./pages/PrescribeInfo";
import AllPrescribePat from "./pages/AllPrescribePat";

import Billing from "./pages/Billing";


/* Doctor */
import DoctorSignup from "./pages/DoctorSignup";
import DoctorForm from "./pages/DoctorForm";
import DoctorWaiting from "./pages/DoctorWaiting";
import DoctorDashboard from "./pages/DoctorDashboard";
import DocInfo from "./pages/DocInfo";
import Prescription from "./pages/Prescription";
import DocAppointments from "./pages/DocAppointments";
import AllPrescribeDoc from "./pages/AllPrescribeDoc";
import CreateBilling from "./pages/CreateBilling";
import DocBilling from "./pages/DocBilling";

/* Admin */
import AdminDashboard from "./pages/AdminDashboard";

/* Layouts & Guards */
import TopPanel from "./components/TopPanel";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import ProfileGuard from "./components/ProfileGuard";
import AdminRoute from "./components/AdminRoute";
import DoctorDashboardLayout from "./layouts/DoctorDashboardLayout";


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

            
            <Route path="/doc-info/:doctorId" element={<DocInfo />} />


          </Route>

          <Route path="/patient/prescriptions" element={<AllPrescribePat />} />
          <Route path="/doctor/prescriptions" element={<AllPrescribeDoc />} />
          <Route path="/PrescribeInfo/:id" element={<PrescribeInfo />} />
          <Route path="/create-billing" element={<CreateBilling />} />
          <Route path="/display-billing" element={<Billing />} />
          <Route path="/doc-billing" element={<DocBilling />} />




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

          {/* 👨‍⚕️ DOCTOR DASHBOARD + SIDEBAR */}
          <Route
            element={
              <ProtectedRoute role="doctor">
                <DoctorDashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
            <Route path="/doctor-appointments" element={<DocAppointments />} />
            <Route path="/doctor/prescription/new" element={<Prescription />} />
            <Route path="/profile" element={<DocInfo />} />
          </Route>


          {/* 🛡️ ADMIN (ONLY ONE ROUTE, CORRECT) */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            element={
              <ProtectedRoute role="doctor">
                <DoctorDashboardLayout />
              </ProtectedRoute>
            }
          ></Route>

          {/* ❓ FALLBACK */}
          <Route path="*" element={<Welcome />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
