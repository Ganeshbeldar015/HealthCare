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
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Loading patient profile...
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center text-gray-500 p-6">
        No patient profile found
      </div>
    );
  }

  const { personalInfo, medicalInfo } = patient;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      {/* ================= Profile Header ================= */}
      <div className="bg-white rounded-2xl shadow-sm border p-6 flex flex-col lg:flex-row gap-6">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">
            {personalInfo.firstName?.[0]}
            {personalInfo.lastName?.[0]}
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              {personalInfo.firstName} {personalInfo.lastName}
            </h2>
            <p className="text-sm text-gray-500">{user.email}</p>
            <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
              Active Patient
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
          <Stat label="Appointments" value="0" />
          <Stat label="Pending" value="0" />
          <Stat label="Reports" value="0" />
          <Stat label="Bills" value="0" />
        </div>
      </div>

      {/* ================= Patient Details ================= */}
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Personal & Medical Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Info label="Gender" value={personalInfo.gender} />
          <Info label="Date of Birth" value={personalInfo.dob} />
          <Info label="Phone" value={personalInfo.contact} />
          <Info label="Blood Group" value={medicalInfo.bloodGroup} />
          <Info label="Address" value={personalInfo.address} />
          <Info label="Allergies" value={medicalInfo.allergies || "None"} />
          <Info label="Conditions" value={medicalInfo.conditions || "None"} />
          <Info label="Medical History" value={medicalInfo.history || "None"} />
        </div>
      </div>

      {/* ================= Bottom Section ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Medical Records */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800">
              Medical Records
            </h3>
            <span className="text-xs text-gray-400">0 Records</span>
          </div>

          <div className="text-center text-gray-400 py-12">
            No medical records uploaded yet
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h3 className="font-semibold text-gray-800 mb-4">
              Quick Actions
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <Action onClick={() => navigate("/appointments")} text="Appointments" />
              <Action text="Medical Records" />
              <Action text="Medical Bills" />
              <Action onClick={() => navigate("/dashboard")} text="Dashboard" />
              <Action onClick={() => navigate("/patientR")} text="Edit Profile" />
            </div>
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h3 className="font-semibold text-gray-800 mb-2">
              Patient Reviews
            </h3>
            <p className="text-sm text-gray-400">
              No reviews available
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= Reusable Components ================= */

function Info({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 border">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-sm font-medium text-gray-800 truncate">
        {value || "—"}
      </p>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-blue-50 rounded-xl p-4 text-center border">
      <p className="text-xs text-blue-600">{label}</p>
      <p className="text-lg font-semibold text-blue-800">{value}</p>
    </div>
  );
}

function Action({ text, onClick }) {
  return (
    <button
      onClick={onClick}
      className="text-sm px-3 py-2 rounded-lg border bg-blue-50 text-blue-700 hover:bg-blue-100 transition text-center"
    >
      {text}
    </button>
  );
}

export default Profile;
