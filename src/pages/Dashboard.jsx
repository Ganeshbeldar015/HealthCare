import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../utils/useAuth";

function Dashboard() {
  const { user } = useAuth();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
  });

  useEffect(() => {
    if (!user) return;

    const fetchPatient = async () => {
      try {
        const ref = doc(db, "patients", user.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data(); // ✅ FIX HERE

          setPatient(data);
          setStats({
            totalAppointments: data.appointmentCount ?? 0,
            pendingAppointments: data.pendingAppointmentCount ?? 0,
          });

        }
      } catch (err) {
        console.error("Failed to fetch patient data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [user]);

  if (loading) {
    return <div className="p-10 text-center text-gray-500">Loading dashboard…</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-12">
      {/* Welcome Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome, <span className="text-purple-600">{patient?.personalInfo?.firstName || user?.email}</span>
        </h1>

      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
        {/* Total Appointments */}
        <StatCard
          label="Total Appointments"
          value={stats.totalAppointments}
          icon="📅"
          bg="bg-blue-50"
        />

        {/* Pending Appointments */}
        <StatCard
          label="Pending Appointments"
          value={stats.pendingAppointments}
          icon="⏳"
          bg="bg-yellow-50"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart Placeholder */}
          <div className="bg-white rounded-xl shadow p-6 h-64">
            <h2 className="font-semibold text-gray-800 mb-4">
              Appointments Activity
            </h2>
            <div className="flex items-center justify-center h-full text-gray-400">
              Chart coming soon
            </div>
          </div>

          {/* Recent Appointments */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex justify-between mb-4">
              <h2 className="font-semibold text-gray-800">
                Recent Appointments
              </h2>
              <button className="text-sm text-purple-600 hover:underline">
                View all
              </button>
            </div>

            <div className="text-gray-400 text-center py-10">
              No appointments found
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex justify-between mb-4">
              <h2 className="font-semibold text-gray-800">Summary</h2>
              <button className="text-sm text-purple-600 hover:underline">
                See details
              </button>
            </div>

            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              Summary visualization
            </div>
          </div>

          {/* Available Doctors */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="font-semibold text-gray-800 mb-4">
              Available Doctors
            </h2>

            <div className="flex items-center gap-4 p-3 rounded-lg bg-gray-50">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-purple-600 text-white font-bold">
                D1
              </div>
              <div>
                <p className="font-medium text-gray-800">Doctor 1</p>
                <p className="text-xs text-gray-500">
                  Cardiologist • Not Available
                </p>
              </div>
            </div>
          </div>

          {/* Patient Reviews */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="font-semibold text-gray-800 mb-4">
              Patient Reviews
            </h2>
            <p className="text-gray-400 text-sm">
              No reviews yet
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

/* ================== Small Reusable Card ================== */
function StatCard({ label, value, icon, bg }) {
  return (
    <div className={`p-6 rounded-xl shadow-sm ${bg}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <h2 className="text-3xl font-bold text-gray-900">{value}</h2>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );
}
