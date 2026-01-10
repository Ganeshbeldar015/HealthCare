// ====================== IMPORTS ======================
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
import { analyzeMedicines } from "../utils/gemini";
import BarChartComponent from "../components/BarChartComponent";
import PieChartComponent from "../components/PieChartComponent";


// ====================== DASHBOARD COMPONENT ======================
function Dashboard() {
  const { user, userData } = useAuth();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [recentAppointments, setRecentAppointments] = useState([]);

  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [chartData, setChartData] = useState(null);
  const [aiSummary, setAiSummary] = useState(null);
  const [specializationFilter, setSpecializationFilter] = useState("All");
  const specialities = ["All", ...new Set(doctors.map(doc => doc.specialization))];
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
  });

  // ====================== FETCH PATIENT ======================
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


  // ====================== FETCH DOCTORS ======================
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


  // ====================== FETCH RECENT APPOINTMENTS ======================
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



  // ====================== ANALYSIS BUTTON LOGIC ======================
  // const handleAnalysis = async () => {
  //   try {
  //     setLoadingAnalysis(true);

  //     const q = query(
  //       collection(db, "prescriptions"),
  //       where("patientId", "==", user.uid)
  //     );
  //     const snap = await getDocs(q);

  //     const prescriptions = snap.docs.map(doc => doc.data());

  //     const medicineList = [];
  //     prescriptions.forEach(p => {
  //       p.medicines.forEach(m => medicineList.push(m.name));
  //     });

  //     // REAL GEMINI CALL
  //     const analysis = await analyzeMedicines(medicineList);

  //     if (!analysis) {
  //       alert("AI analysis failed!");
  //       return;
  //     }

  //     const medCount = {};
  //     const disCount = {};

  //     analysis.medicines.forEach(m => {
  //       medCount[m.name] = (medCount[m.name] || 0) + 1;
  //       disCount[m.disease] = (disCount[m.disease] || 0) + 1;
  //     });

  //     setChartData({
  //       medicineCount: medCount,
  //       diseases: disCount,
  //       details: analysis.medicines
  //     });

  //     setAiSummary(analysis.summary);

  //   } catch (err) {
  //     console.error("Analysis error:", err);
  //   } finally {
  //     setLoadingAnalysis(false);
  //   }
  // };

  const handleAnalysis = async () => {
    try {
      setLoadingAnalysis(true);

      // 🔥 STATIC PROTOTYPE DATA (Replace with Gemini later)
      const staticAnalysis = {
        medicines: [
          { name: "Paracetamol", disease: "Fever" },
          { name: "Pantoprazole", disease: "Acidity" },
          { name: "Azithromycin", disease: "Infection" },
          { name: "Paracetamol", disease: "Fever" },
          { name: "Cetrizine", disease: "Allergy" },
          { name: "ORS", disease: "Dehydration" }
        ],
        summary:
          "Most medicines relate to fever, acidity, infection & allergies. Patient shows seasonal patterns and mild recurring issues."
      };

      // 🔄 Count frequencies
      const medCount = {};
      const disCount = {};

      staticAnalysis.medicines.forEach((m) => {
        medCount[m.name] = (medCount[m.name] || 0) + 1;
        disCount[m.disease] = (disCount[m.disease] || 0) + 1;
      });

      // Set chart data
      setChartData({
        medicineCount: medCount,
        diseases: disCount,
        details: staticAnalysis.medicines,
      });

      setAiSummary(staticAnalysis.summary);
    } catch (err) {
      console.error("Static Analysis error:", err);
    } finally {
      setLoadingAnalysis(false);
    }
  };



  // ====================== LOADING ======================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Loading dashboard…
      </div>
    );
  }



  // ====================== MAIN JSX ======================
  return (
    <div className="min-h-screen bg-slate-50 pt-2 px-6 relative">

      {/* SIDE DOCTORS LIST */}
      <aside
        className="
    bg-white border border-slate-200 rounded-xl shadow-sm p-4 max-h-[80vh] overflow-y-auto

    lg:absolute lg:right-2 lg:top-20 lg:w-96  /* Desktop */

    w-full mt-4 lg:mt-0                  /* Mobile below main content */
  "
      >

        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold text-slate-800 text-[15px] tracking-tight">
            Available Doctors
          </h2>

          <select
            value={specializationFilter}
            onChange={(e) => setSpecializationFilter(e.target.value)}
            className="text-sm border border-slate-300 rounded-lg px-2 py-1 bg-white"
          >
            {specialities.map((spec, i) => (
              <option key={i} value={spec}>{spec}</option>
            ))}
          </select>
        </div>


        {doctors.length === 0 ? (
          <p className="text-sm text-slate-400 text-center">No doctors available</p>
        ) : (
          <div className="space-y-2.5">
            {doctors
              .filter(doc => specializationFilter === "All" || doc.specialization === specializationFilter)
              .map(doc => (
                <div key={doc.id}
                  onClick={() => navigate(`/doc-info/${doc.id}`)}
                  className="p-3 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition flex gap-3"
                >
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-emerald-600 text-white text-lg font-bold">
                    {doc.name?.charAt(0) || "D"}
                  </div>

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



      {/* MAIN CONTENT */}
      <main className="pt-2 max-w-5xl
    lg:pr-64   /* right padding only for large screens */
    w-full
">

        {/* WELCOME */}
        <div className="mb-4">
          <h1 className="text-[26px] font-extrabold text-slate-900 leading-tight">
            Welcome, <span className="text-emerald-600">{patient?.personalInfo?.firstName || user?.email}</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">Here’s a quick overview of your healthcare activity</p>
        </div>


        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 w-full">
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



        {/* RECENT APPOINTMENTS */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-6 p-5">
          <h2 className="font-semibold text-slate-800 mb-3 text-[15px]">Recent Approved Appointments</h2>

          {recentAppointments.length === 0 ? (
            <p className="text-sm text-slate-400">No approved appointments yet</p>
          ) : (
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">

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



        {/* AI CHART SECTION */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 mb-6">

          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-slate-800 text-[15px]">
              Medicine Insights & Health Analytics
            </h2>

            <button
              onClick={handleAnalysis}
              className="px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow"
            >
              Do Analysis
            </button>
          </div>


          {/* States */}
          {!loadingAnalysis && !chartData && (
            <p className="text-slate-400 text-sm">Click “Do Analysis” to generate graphs</p>
          )}

          {loadingAnalysis && (
            <p className="text-slate-400 text-sm">Analyzing medicines…</p>
          )}


          {/* Chart Placeholder */}
          {chartData && (
            <>
              <div className="my-4 w-full overflow-x-auto">
                <h3 className="text-[14px] font-semibold mb-2">Most Used Medicines</h3>
                <BarChartComponent data={chartData.medicineCount} />
              </div>

              <div className="my-4">
                <h3 className="text-[14px] font-semibold mb-2">Health Issues Detected</h3>
                <PieChartComponent data={chartData.diseases} />
              </div>
            </>
          )}

          {aiSummary && (
            <div className="mt-5 p-3 bg-slate-50 border rounded-lg text-sm text-slate-600">
              <strong>AI Summary: </strong>{aiSummary}
            </div>
          )}
        </div>



        {/* REVIEWS */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 mb-6">
          <h2 className="font-semibold text-slate-800 mb-2 text-[15px]">Patient Reviews</h2>
          <p className="text-sm text-slate-400">No reviews yet</p>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;



// ====================== STAT CARD COMPONENT ======================
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
}
