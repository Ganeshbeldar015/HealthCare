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
  const { user } = useAuth();
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
  }, [user, navigate]);

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
    <div className="min-h-screen bg-slate-50 pt-16 px-6">
      {/* ================= HEADER ================= */}
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900">
          Welcome,{" "}
          <span className="text-emerald-600">
            {patient?.personalInfo?.firstName || user?.email}
          </span>
        </h1>
        <p className="text-slate-500 mt-1">
          Here’s a quick overview of your healthcare activity
        </p>
      </div>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <StatCard
          label="Total Appointments"
          value={stats.totalAppointments}
          icon={<Calendar className="w-8 h-8" />}
          bg="from-emerald-50 to-cyan-50"
        />
        <StatCard
          label="Pending Appointments"
          value={stats.pendingAppointments}
          icon={<Clock className="w-8 h-8" />}
          bg="from-yellow-50 to-orange-50"
        />
      </div>

      {/* ================= RECENT APPROVED ================= */}
      <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl shadow mb-10 p-6">
        <h2 className="font-bold text-slate-800 mb-4">
          Recent Approved Appointments
        </h2>

        {recentAppointments.length === 0 ? (
          <p className="text-sm text-slate-400">
            No approved appointments yet
          </p>
        ) : (
          <div className="space-y-3">
            {recentAppointments.map((a) => (
              <div
                key={a.id}
                className="flex justify-between items-center p-4 rounded-xl bg-slate-50 border border-slate-200"
              >
                <div>
                  <p className="font-semibold text-slate-800">
                    Dr. {a.doctorName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {a.appointmentType} • {a.date}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                  Approved
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= MAIN GRID ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl shadow p-6 h-64 flex items-center justify-center text-slate-400">
            Appointments Activity (Chart coming soon)
          </div>

          <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl shadow p-6">
            <h2 className="font-bold text-slate-800 mb-2">
              Patient Reviews
            </h2>
            <p className="text-sm text-slate-400">No reviews yet</p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl shadow p-6">
            <h2 className="font-bold text-slate-800 mb-4">
              Available Doctors
            </h2>

            {doctors.length === 0 ? (
              <p className="text-sm text-slate-400">
                No doctors available
              </p>
            ) : (
              <div className="space-y-3">
                {doctors.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => navigate(`/doc-info/${doc.id}`)}
                    className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200"
                  >
                    <div className="w-11 h-11 flex items-center justify-center rounded-full bg-emerald-600 text-white font-bold">
                      {doc.name?.charAt(0) || "D"}
                    </div>

                    <div className="flex-1">
                      <p className="font-semibold text-slate-800">
                        {doc.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {doc.specialization} • {doc.experience} yrs
                      </p>
                    </div>

                    <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-semibold">
                      Available
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

/* ================= STAT CARD ================= */
function StatCard({ label, value, icon, bg }) {
  return (
    <div
      className={`p-6 rounded-2xl shadow bg-gradient-to-br ${bg} border border-slate-200`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600">{label}</p>
          <h2 className="text-3xl font-extrabold text-slate-900">
            {value}
          </h2>
        </div>
        <div className="text-slate-600">{icon}</div>
      </div>
    </div>
  );
}
