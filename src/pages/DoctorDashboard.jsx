import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  addDoc,
  increment,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../utils/firebase";

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const doctorId = auth.currentUser?.uid;

  /* 🔹 Fetch appointments for this doctor (kept for future use) */
  useEffect(() => {
    if (!doctorId) return;

    const q = query(
      collection(db, "appointments"),
      where("doctorId", "==", doctorId)
    );

    const unsub = onSnapshot(q, (snap) => {
      setAppointments(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
      );
    });

    return () => unsub();
  }, [doctorId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center bg-white border border-slate-200 rounded-2xl shadow-lg px-10 py-14 max-w-xl w-full">
        <div className="text-6xl mb-4">📊</div>

        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Doctor Analytics
        </h1>

        <p className="text-slate-600 mb-6">
          Powerful insights and visual analytics are on the way.
        </p>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold">
          🚀 Coming Soon
        </div>

        <p className="mt-6 text-sm text-slate-400">
          Appointment trends, patient statistics, and performance graphs
          will appear here.
        </p>
      </div>
    </div>
  );
}
