import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Welcome from "./pages/Welcome";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UpdatePassword from "./pages/UpdatePassword";
import PatientR from "./pages/PatientR";
import Profile from "./pages/Profile";
import TopPanel from "./components/TopPanel";
import ProtectedRoute from "./components/ProtectedRoute";
import ProfileGuard from "./components/ProfileGuard";
import DashboardLayout from "./layouts/DashboardLayout";

function App() {
  const location = useLocation();

  // 🚫 Routes where TopPanel should NOT appear
  const hideTopPanelRoutes = [
    "/",
    "/login",
    "/signup",
    "/update-password",
  ];

  const hideTopPanel = hideTopPanelRoutes.includes(location.pathname);

  return (
    <div className="relative min-h-screen bg-cover bg-center">
      {!hideTopPanel && <TopPanel />}

      <main className={hideTopPanel ? "p-0" : "p-4 min-h-[calc(100vh-64px)]"}>
        <div className={hideTopPanel ? "w-full" : "w-full max-w-7xl mx-auto"}>
          <Routes>
            {/* 🌐 Public Routes */}
            <Route path="/" element={<Welcome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/update-password" element={<UpdatePassword />} />

            {/* 🔐 Auth-only (profile not required yet) */}
            <Route
              path="/patientR"
              element={
                <ProtectedRoute>
                  <PatientR />
                </ProtectedRoute>
              }
            />

            {/* 🧾 Auth + Profile Required */}
            <Route
              path="/dashboard"
              element={
                <ProfileGuard>
                  <Dashboard />
                </ProfileGuard>
              }
            />

            {/* ❓ Fallback */}
            <Route path="*" element={<Welcome />} />
            <Route
              element={
                <ProfileGuard>
                  <DashboardLayout />
                </ProfileGuard>
              }
            >
              <Route path="/profile" element={<Profile />} />
              <Route path="/dashboard" element={<Dashboard />} />
              {/* <Route path="/profile" element={<div>Profile Page</div>} /> */}
              <Route path="/appointments" element={<div>Appointments</div>} />
              <Route path="/records" element={<div>Records</div>} />
              <Route path="/prescription" element={<div>Prescription</div>} />
              <Route path="/billing" element={<div>Billing</div>} />
              <Route path="/notifications" element={<div>Notifications</div>} />
            </Route>
          </Routes>


        </div>
      </main>
    </div>
  );
}

export default App;
