import React from "react";
import { useAuth } from "../utils/useAuth";

function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 pt-12">
      {/* Welcome Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome, <span className="text-purple-600">{user?.email}</span>
        </h1>
        
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map((item, i) => (
          <div
            key={i}
            className={`p-5 rounded-xl shadow-sm ${item.bg}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{item.label}</p>
                <h2 className="text-2xl font-bold text-gray-900">0</h2>
              </div>
              <div className="text-3xl">{item.icon}</div>
            </div>
          </div>
        ))}
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

/* 🧠 Stats config */
const stats = [
  {
    label: "Total Appointments",
    icon: "📅",
    bg: "bg-blue-50",
  },
  {
    label: "Cancelled",
    icon: "❌",
    bg: "bg-red-50",
  },
  {
    label: "Pending",
    icon: "⏳",
    bg: "bg-yellow-50",
  },
  {
    label: "Completed",
    icon: "✅",
    bg: "bg-green-50",
  },
];
