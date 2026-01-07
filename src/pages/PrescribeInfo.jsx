import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../utils/firebase";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function PrescribeInfo() {
  const { id } = useParams(); // prescriptionId
  const navigate = useNavigate();

  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);

  /* 🔹 Fetch prescription */
  useEffect(() => {
    const fetchPrescription = async () => {
      try {
        const ref = doc(db, "prescriptions", id);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          alert("Prescription not found");
          navigate(-1);
          return;
        }

        setPrescription({ id: snap.id, ...snap.data() });
      } catch (err) {
        console.error("Failed to fetch prescription", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrescription();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-500">
        Loading prescription…
      </div>
    );
  }

  if (!prescription) return null;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-8 pt-16">
      {/* 🔙 Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold">Prescription</h1>
      </div>

      {/* 🧑‍⚕️ Doctor + Patient Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <InfoBox label="Doctor Name" value={prescription.doctorName} />
        <InfoBox label="Patient Name" value={prescription.patientName} />
        <InfoBox label="Date" value={prescription.date} />
        <InfoBox
          label="Prescription ID"
          value={prescription.id}
          mono
        />
      </div>

      {/* 💊 Medicines */}
      <div>
        <h2 className="text-lg font-semibold mb-4">
          Medicines
        </h2>

        <div className="space-y-4">
          {prescription.medicines.map((m, index) => (
            <div
              key={index}
              className="border rounded-xl p-4 bg-gray-50"
            >
              <div className="flex justify-between mb-2">
                <p className="font-semibold text-gray-800">
                  {index + 1}. {m.name}
                </p>
                <span className="text-sm text-gray-500">
                  Qty: {m.quantity}
                </span>
              </div>

              {/* Timings */}
              <div className="flex gap-3 text-sm mb-2">
                {m.timing?.morning && <Timing label="Morning" />}
                {m.timing?.afternoon && <Timing label="Afternoon" />}
                {m.timing?.night && <Timing label="Night" />}
              </div>

              {/* Notes */}
              {m.note && (
                <p className="text-sm text-gray-600">
                  📝 {m.note}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================= Helpers ================= */

function InfoBox({ label, value, mono }) {
  return (
    <div className="border rounded-xl p-4 bg-gray-50">
      <p className="text-xs text-gray-500 mb-1">
        {label}
      </p>
      <p
        className={`font-medium text-gray-800 ${
          mono ? "font-mono text-sm" : ""
        }`}
      >
        {value || "-"}
      </p>
    </div>
  );
}

function Timing({ label }) {
  return (
    <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
      {label}
    </span>
  );
}
