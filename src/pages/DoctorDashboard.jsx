import React from "react";
import BarChartComponent from "../components/BarChartComponent";
import PieChartComponent from "../components/PieChartComponent";

export default function DoctorDashboard() {

  /* 🔹 Static Prototype Data (Hackathon-ready) */
  const summaryStats = {
    totalAppointments: 42,
    completed: 31,
    pending: 11,
    uniquePatients: 28,
  };

  const appointmentTrend = [
    { day: "Mon", count: 5 },
    { day: "Tue", count: 7 },
    { day: "Wed", count: 6 },
    { day: "Thu", count: 9 },
    { day: "Fri", count: 8 },
    { day: "Sat", count: 5 },
    { day: "Sun", count: 2 },
  ];

  const ageData = {
    "0-18": 5,
    "19-30": 10,
    "31-50": 8,
    "50+": 7,
  };

  const statusRatio = {
    Completed: 31,
    Pending: 11,
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-6">

      <h1 className="text-3xl font-bold text-slate-800 text-center mb-10">
        Doctor Analytics Dashboard
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 max-w-6xl mx-auto">
        <div className="p-5 bg-white shadow rounded-xl text-center border">
          <p className="text-xs text-slate-500">Total Appointments</p>
          <h2 className="text-2xl font-bold text-slate-800">{summaryStats.totalAppointments}</h2>
        </div>

        <div className="p-5 bg-white shadow rounded-xl text-center border">
          <p className="text-xs text-slate-500">Completed</p>
          <h2 className="text-2xl font-bold text-emerald-600">{summaryStats.completed}</h2>
        </div>

        <div className="p-5 bg-white shadow rounded-xl text-center border">
          <p className="text-xs text-slate-500">Pending</p>
          <h2 className="text-2xl font-bold text-amber-600">{summaryStats.pending}</h2>
        </div>

        <div className="p-5 bg-white shadow rounded-xl text-center border">
          <p className="text-xs text-slate-500">Unique Patients</p>
          <h2 className="text-2xl font-bold text-indigo-600">{summaryStats.uniquePatients}</h2>
        </div>
      </div>

      {/* Charts Section */}
      <div className="max-w-6xl mx-auto mt-10 grid grid-cols-1 md:grid-cols-2 gap-10">

        {/* Appointment Status Pie Chart */}
        <div className="bg-white p-6 rounded-2xl shadow border">
          <h3 className="text-md font-semibold text-slate-700 mb-4">Appointment Status</h3>
          <PieChartComponent data={statusRatio} />
        </div>

        {/* Patient Age Distribution */}
        <div className="bg-white p-6 rounded-2xl shadow border">
          <h3 className="text-md font-semibold text-slate-700 mb-4">Patient Age Distribution</h3>
          <BarChartComponent data={ageData} />
        </div>
      </div>

     

    </div>
  );
}
