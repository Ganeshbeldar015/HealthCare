import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../utils/firebase";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

function DocInfo() {
  const { doctorId } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const ref = doc(db, "doctors", doctorId);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          alert("Doctor not found");
          navigate(-1);
          return;
        }

        setDoctor(snap.data());
      } catch (err) {
        console.error("Failed to fetch doctor info", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [doctorId, navigate]);

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading doctor information...
      </div>
    );
  }

  if (!doctor) return null;

  return (
    <div className="max-w-5xl mx-auto px-6 py-4">

      {/* 🔙 Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeftIcon className="h-5 w-5" />
        Back
      </button>

      {/* Doctor Card */}
      <div className="bg-white rounded-xl shadow p-6 grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Left: Avatar */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-20 h-20 rounded-full bg-green-600 text-white flex items-center justify-center text-2xl font-bold">
            {doctor.name?.charAt(0) || "D"}
          </div>

          <h2 className="text-lg font-semibold text-gray-800">
            Dr. {doctor.name}
          </h2>

          <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700">
            {doctor.specialization || "Doctor"}
          </span>
        </div>

        {/* Right: Info */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">

          <InfoItem label="Email" value={doctor.email} />
          <InfoItem label="Mobile" value={doctor.phone} />
          <InfoItem label="Experience" value={`${doctor.experience || 0} years`} />
          <InfoItem label="Clinic Address" value={doctor.clinicAddress} />

        </div>
      </div>
    </div>
  );
}

export default DocInfo;

/* ---------- Small Reusable Row ---------- */
function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-sm font-medium text-gray-800">
        {value || "Not provided"}
      </p>
    </div>
  );
}
