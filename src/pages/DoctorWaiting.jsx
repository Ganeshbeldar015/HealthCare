import React from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  CalendarCheck,
  FileText,
  CreditCard,
} from "lucide-react";

function DoctorWaiting() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col justify-between">

      {/* ===== SUCCESS CARD ===== */}
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">

          {/* ✅ LUCIDE ICON */}
          <div className="flex justify-center mb-4">
            <div className="bg-emerald-100 p-4 rounded-full">
              <CheckCircle2
                size={48}
                className="text-emerald-600"
                strokeWidth={2.5}
              />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-emerald-700">
            Registration Submitted
          </h2>

          <p className="text-gray-600 mt-3">
            Your doctor profile is under admin verification.
            <br />
            You will be able to access your dashboard once approved.
          </p>

          <button
            onClick={() => navigate("/login")}
            className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold transition"
          >
            Go to Login
          </button>
        </div>
      </div>

      {/* ===== FEATURES SECTION ===== */}
      <div className="bg-white py-12">
        <h3 className="text-center text-2xl font-bold text-emerald-800 mb-8">
          What you can do after approval
        </h3>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 px-6">
          <Feature
            icon={<CalendarCheck size={30} />}
            title="Appointments"
            desc="Approve, reschedule and manage patient appointments easily."
          />

          <Feature
            icon={<FileText size={30} />}
            title="Prescriptions"
            desc="Create digital prescriptions and share them with patients."
          />

          <Feature
            icon={<CreditCard size={30} />}
            title="Billing"
            desc="Generate bills, manage payments and treatment charges."
          />
        </div>
      </div>
    </div>
  );
}

/* ===== FEATURE CARD ===== */
function Feature({ icon, title, desc }) {
  return (
    <div className="bg-green-50 border border-green-100 rounded-xl p-6 text-center hover:shadow-lg transition">
      <div className="flex justify-center text-emerald-600 mb-3">
        {icon}
      </div>
      <h4 className="font-bold text-lg text-emerald-800">{title}</h4>
      <p className="text-gray-600 text-sm mt-2">{desc}</p>
    </div>
  );
}

export default DoctorWaiting;
