import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../utils/useAuth";
import { useNavigate } from "react-router-dom";

function Profile() {
  const { user } = useAuth();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        const ref = doc(db, "patients", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) setPatient(snap.data());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-slate-500">
        Loading profile...
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center text-slate-500 p-6">
        No profile data found
      </div>
    );
  }

  const { personalInfo, medicalInfo } = patient;

  return (
    <div className="max-w-7xl mx-auto px-6 pt-2 pb-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ================= MAIN CONTENT ================= */}
        <div className="lg:col-span-2 space-y-6">

          {/* Medical Records – MAIN FOCUS */}
          <div className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Medical Records
            </h2>

            <div className="flex items-center justify-center h-56 text-slate-400 text-sm">
              No medical records uploaded yet
            </div>
          </div>

        </div>

        {/* ================= RIGHT SIDEBAR ================= */}
        <div className="space-y-6">

          {/* Compact Profile Card */}
          <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 border border-emerald-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 text-white flex items-center justify-center font-semibold">
                {personalInfo.firstName?.[0]}
                {personalInfo.lastName?.[0]}
              </div>

              <div className="flex-1">
                <p className="font-semibold text-slate-900 leading-tight">
                  {personalInfo.firstName} {personalInfo.lastName}
                </p>
                <p className="text-xs text-slate-600">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-700">
                Registered Patient
              </span>

              <button
                onClick={() => navigate("/patientR")}
                className="text-xs font-medium text-emerald-700 hover:underline"
              >
                Edit
              </button>
            </div>
          </div>

          {/* Personal Information */}
          <SidebarCard title="Personal Information">
            <InfoRow label="Full Name" value={`${personalInfo.firstName} ${personalInfo.lastName}`} />
            <InfoRow label="Gender" value={personalInfo.gender} />
            <InfoRow label="DOB" value={personalInfo.dob} />
            <InfoRow label="Phone" value={personalInfo.contact} />
            <InfoRow label="Address" value={personalInfo.address} />
          </SidebarCard>

          {/* Medical Information */}
          <SidebarCard title="Medical Information">
            <InfoRow label="Blood Group" value={medicalInfo.bloodGroup} />
            <InfoRow label="Allergies" value={medicalInfo.allergies || "None"} />
            <InfoRow label="Conditions" value={medicalInfo.conditions || "None"} />
            <InfoRow label="History" value={medicalInfo.history || "None"} />
          </SidebarCard>

        </div>
      </div>
    </div>
  );
}

/* ================= REUSABLE ================= */

function SidebarCard({ title, children }) {
  return (
    <div className="bg-white border border-emerald-100 rounded-xl p-5 shadow-sm">
      <h4 className="text-sm font-semibold text-slate-800 mb-4">
        {title}
      </h4>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 text-sm border-b border-slate-100 pb-2 last:border-none">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-900 font-medium text-right max-w-[60%]">
        {value || "—"}
      </span>
    </div>
  );
}

export default Profile;
