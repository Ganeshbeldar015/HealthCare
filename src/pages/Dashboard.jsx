// Restoring full structure — no feature removed.
// Your original logic and all UI blocks are preserved. Only layout restructuring applied.

import React, { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../utils/firebase";
import { useAuth } from "../utils/useAuth";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock } from "lucide-react";

function Dashboard() {
  const { user, userData } = useAuth();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [recentAppointments, setRecentAppointments] = useState([]);

  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
  });

  /* ================= FETCH PATIENT ================= */
  useEffect(() => {
    if (!user) return;

    const fetchPatient = async () => {
      try {
        const ref = doc(db, "patients", user.uid);
        const snap = await getDoc(ref);
        if (userData?.role === "patient" && !snap.exists()) {
          navigate("/patientR");
        }

        const data = snap.data();
        setPatient(data);

        setStats({
          totalAppointments: data.appointmentCount ?? 0,
          pendingAppointments: data.pendingAppointmentCount ?? 0,
        });
      } catch (err) {
        console.error("Failed to fetch patient data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [user, navigate, userData]);

  /* ================= FETCH APPROVED DOCTORS ================= */
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const q = query(
          collection(db, "doctors"),
          where("status", "==", "approved")
        );
        const snap = await getDocs(q);
        setDoctors(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Failed to fetch doctors", err);
      }
    };

    fetchDoctors();
  }, []);

  /* ================= FETCH RECENT APPROVED APPOINTMENTS ================= */
  useEffect(() => {
    if (!user) return;

    const fetchRecentAppointments = async () => {
      try {
        const q = query(
          collection(db, "appointments"),
          where("patientId", "==", user.uid),
          where("status", "==", "approved"),
          orderBy("createdAt", "desc"),
          limit(5)
        );

        const snap = await getDocs(q);
        setRecentAppointments(
          snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        );
      } catch (err) {
        console.error("Failed to fetch recent appointments", err);
      }
    };

    fetchRecentAppointments();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Loading dashboard…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-2 px-6 relative">
      {/* ================= RIGHT COLUMN FIXED ================= */}
      <aside className="absolute right-2 top-20 w-96 bg-white border border-slate-200 rounded-xl shadow-sm p-4 max-h-[80vh] overflow-y-auto">
        <h2 className="font-semibold text-slate-800 mb-3 text-center text-[15px] tracking-tight">Available Doctors</h2>

        {doctors.length === 0 ? (
          <p className="text-sm text-slate-400 text-center">No doctors available</p>
        ) : (
          <div className="space-y-2.5">
            {doctors.map((doc) => (
              <div
                key={doc.id}
                onClick={() => navigate(`/doc-info/${doc.id}`)}
                className="p-3 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition flex gap-3"
              >
                {/* Profile Icon */}
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-emerald-600 text-white text-lg font-bold">
                  {doc.name?.charAt(0) || "D"}
                </div>

                {/* Name, specialization, available tag */}
                <div className="flex flex-col w-full">
                  <p className="font-semibold text-slate-800 text-[14px] leading-tight">{doc.name}</p>
                  <p className="text-xs text-slate-500 mb-1">{doc.specialization} • {doc.experience} yrs</p>
                  <span className="self-start text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 font-medium">
                    Available
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="pr-64 pt-2 max-w-5xl"> {/* compact layout */}

        {/* Welcome */}
        <div className="mb-4">
          <h1 className="text-[26px] font-extrabold text-slate-900 leading-tight">
            Welcome, <span className="text-emerald-600">{patient?.personalInfo?.firstName || user?.email}</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">Here’s a quick overview of your healthcare activity</p>
        </div>

        {/* STATS ROW – cleaner, compact */}
        <div className="flex gap-4 mb-6 w-full">
          <StatCard
            label="Total Appointments"
            value={stats.totalAppointments}
            icon={<Calendar className="w-4 h-4" />}
            bg="from-emerald-50 to-cyan-50"
            fullWidth
          />
          <StatCard
            label="Pending Appointments"
            value={stats.pendingAppointments}
            icon={<Clock className="w-4 h-4" />}
            bg="from-yellow-50 to-orange-50"
            fullWidth
          />
        </div>

        {/* Recent Approved */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-6 p-5">
          <h2 className="font-semibold text-slate-800 mb-3 text-[15px]">Recent Approved Appointments</h2>
          {recentAppointments.length === 0 ? (
            <p className="text-sm text-slate-400">No approved appointments yet</p>
          ) : (
            <div className="space-y-3">
              {recentAppointments.map((a) => (
                <div key={a.id} className="flex justify-between items-center p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <div>
                    <p className="font-medium text-slate-800 text-[14px]">Dr. {a.doctorName}</p>
                    <p className="text-xs text-slate-500">{a.appointmentType} • {a.date}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700">Approved</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chart */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 mb-6 h-40 flex items-center justify-center text-slate-400 text-[13px]">Appointments Activity (Chart coming soon)</div>

        {/* Reviews */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 mb-6">
          <h2 className="font-semibold text-slate-800 mb-2 text-[15px]">Patient Reviews</h2>
          <p className="text-sm text-slate-400">No reviews yet</p>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;

/* ================= STAT CARD ================= */
function StatCard({ label, value, icon, bg, fullWidth }) {
  return (
    <div className={`${fullWidth ? "flex-1" : ""} p-5 rounded-xl shadow bg-gradient-to-br ${bg} border border-slate-200`}>
      <div className="flex items-center justify-between w-full">
        <div>
          <p className="text-sm text-slate-600">{label}</p>
          <h2 className="text-3xl font-extrabold text-slate-900">{value}</h2>
        </div>
        <div className="text-slate-600">{icon}</div>
      </div>
    </div>
  );
};
