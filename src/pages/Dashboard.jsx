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

        if (!snap.exists()) {
          navigate("/patientR");
          return;
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
          where("status", "==", "approved"),   // ✅ REQUIRED
          orderBy("createdAt", "desc"),
          limit(5)
        );

        const snap = await getDocs(q);

        const list = snap.docs.map(d => ({
          id: d.id,
          ...d.data(),
        }));

        console.log("Approved appointments:", list); // 🔍 debug
        setRecentAppointments(list);
      } catch (err) {
        console.error("Failed to fetch recent appointments", err);
      }
    };


    fetchRecentAppointments();
  }, [user]);

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-500">
        Loading dashboard…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-12 px-4">
      {/* ================= HEADER ================= */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome,{" "}
          <span className="text-purple-600">
            {patient?.personalInfo?.firstName || user?.email}
          </span>
        </h1>
      </div>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
        <StatCard
          label="Total Appointments"
          value={stats.totalAppointments}
          icon="📅"
          bg="bg-blue-50"
        />

        <StatCard
          label="Pending Appointments"
          value={stats.pendingAppointments}
          icon="⏳"
          bg="bg-yellow-50"
        />
      </div>

      {/* ================= RECENT APPROVED ================= */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="font-semibold text-gray-800 mb-4">
          Recent Approved Appointments (*Coming soon)
        </h2>

        {recentAppointments.length === 0 ? (
          <p className="text-sm text-gray-400">
            No approved appointments yet
          </p>
        ) : (
          <div className="space-y-3">
            {recentAppointments.map((a) => (
              <div
                key={a.id}
                className="flex justify-between items-center p-3 rounded-lg bg-gray-50"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    Dr. {a.doctorName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {a.appointmentType} • {a.date}
                  </p>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  Approved
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= MAIN GRID ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow p-6 h-64 flex items-center justify-center text-gray-400">
            Appointments Activity (Chart coming soon)
          </div>
          {/* Reviews */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="font-semibold text-gray-800 mb-4">
              Patient Reviews
            </h2>
            <p className="text-gray-400 text-sm">No reviews yet</p>
          </div>

        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          {/* Doctors */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="font-semibold text-gray-800 mb-4">
              Available Doctors
            </h2>

            {doctors.length === 0 ? (
              <p className="text-sm text-gray-400">No doctors available</p>
            ) : (
              <div className="space-y-3">
                {doctors.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-4 p-3 rounded-lg bg-gray-50"
                  >
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-purple-600 text-white font-bold">
                      {doc.name?.charAt(0) || "D"}
                    </div>

                    <div className="flex-1">
                      <p className="font-medium text-gray-800">
                        {doc.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {doc.specialization} • {doc.experience} yrs
                      </p>
                    </div>

                    <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700">
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
    <div className={`p-6 rounded-xl shadow-sm ${bg}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <h2 className="text-3xl font-bold text-gray-900">{value}</h2>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );
}
