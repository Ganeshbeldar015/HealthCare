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
      <div className="flex justify-center items-center h-64 text-gray-500">
        Loading profile...
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center text-gray-500 p-6">
        No profile data found
      </div>
    );
  }

  const { personalInfo, medicalInfo } = patient;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">

      {/* ================= Profile Header ================= */}
      <div className="bg-white border rounded-2xl p-6 flex items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold">
          {personalInfo.firstName?.[0]}
          {personalInfo.lastName?.[0]}
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-gray-800">
            {personalInfo.firstName} {personalInfo.lastName}
          </h2>
          <p className="text-sm text-gray-500">{user.email}</p>
          <span className="inline-block mt-2 px-3 py-1 text-xs rounded-full bg-green-100 text-green-700">
            Registered Patient
          </span>
        </div>
        <div ><Action text="Edit Profile" onClick={() => navigate("/patientR")} /> </div>
      </div>

      {/* ================= Profile Details ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* -------- Personal Information -------- */}
        <div className="bg-white border rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Personal Information
          </h3>

          <div className="space-y-4">
            <ProfileItem label="Full Name" value={`${personalInfo.firstName} ${personalInfo.lastName}`} />
            <ProfileItem label="Gender" value={personalInfo.gender} />
            <ProfileItem label="Date of Birth" value={personalInfo.dob} />
            <ProfileItem label="Phone Number" value={personalInfo.contact} />
            <ProfileItem label="Address" value={personalInfo.address} />
          </div>
        </div>

        {/* -------- Medical Information -------- */}
        <div className="bg-white border rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Medical Information
          </h3>

          <div className="space-y-4">
            <ProfileItem label="Blood Group" value={medicalInfo.bloodGroup} />
            <ProfileItem label="Allergies" value={medicalInfo.allergies || "None"} />
            <ProfileItem label="Medical Conditions" value={medicalInfo.conditions || "None"} />
            <ProfileItem label="Medical History" value={medicalInfo.history || "None"} />
          </div>
        </div>
      </div>

      {/* ================= Bottom Section ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Medical Records */}
        <div className="lg:col-span-2 bg-white border rounded-2xl p-6">
          <h3 className="font-semibold text-gray-800 mb-4">
            Medical Records
          </h3>

          <div className="text-center text-gray-400 py-12">
            No medical records available
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border rounded-2xl p-6">
          <h3 className="font-semibold text-gray-800 mb-4">
            Quick Actions
          </h3>

          <div className="space-y-3">
            <Action text="View Appointments" onClick={() => navigate("/appointments")} />
            <Action text="Edit Profile" onClick={() => navigate("/patientR")} />
            <Action text="Go to Dashboard" onClick={() => navigate("/dashboard")} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= Reusable Components ================= */

function ProfileItem({ label, value }) {
  return (
    <div className="flex justify-between border-b pb-2 last:border-b-0">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-800 text-right max-w-[60%]">
        {value || "—"}
      </p>
    </div>
  );
}

function Action({ text, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full px-4 py-2 text-sm rounded-lg border bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
    >
      {text}
    </button>
  );
}

export default Profile;
