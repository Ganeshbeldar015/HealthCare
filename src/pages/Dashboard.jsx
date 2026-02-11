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
import { Calendar, Clock, Activity, Pill } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { analyzePrescription } from "../utils/prescriptionAnalyzer";

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

  // Analytics State
  const [analyticsData, setAnalyticsData] = useState([]);
  const [specializationData, setSpecializationData] = useState([]);

  // Prescription Chart State
  const [medicineDosage, setMedicineDosage] = useState([]);
  const [medicineDuration, setMedicineDuration] = useState([]);
  const [medicineRisk, setMedicineRisk] = useState([]);
  const [medicineUsage, setMedicineUsage] = useState([]);
  const [hasPrescriptionStats, setHasPrescriptionStats] = useState(false);
  const [prescriptionStats, setPrescriptionStats] = useState(null); // NEW

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];
  const COLORS_RISK = ["#10B981", "#F59E0B", "#EF4444"]; // Low, Med, High

  /* ================= FETCH DATA ON MOUNT ================= */
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Fetch Patient Data
        const patientRef = doc(db, "patients", user.uid);
        const patientSnap = await getDoc(patientRef);
        
        if (userData?.role === "patient" && !patientSnap.exists()) {
          navigate("/patientR");
          return;
        }

        const patientData = patientSnap.data();
        setPatient(patientData);
        setStats({
          totalAppointments: patientData?.appointmentCount ?? 0,
          pendingAppointments: patientData?.pendingAppointmentCount ?? 0,
        });

        const patientAge = patientData?.personalInfo?.age || 30;

        // 2. Fetch Doctors
        const doctorsQuery = query(
          collection(db, "doctors"),
          where("status", "==", "approved")
        );
        const doctorsSnap = await getDocs(doctorsQuery);
        setDoctors(doctorsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

        // 3. Fetch Appointments (Recent & Analytics)
        const appointmentsQuery = query(
          collection(db, "appointments"),
          where("patientId", "==", user.uid)
          // Removed status filter to get ALL appointments for stats
        );
        const appointmentsSnap = await getDocs(appointmentsQuery);
        const allAppointments = appointmentsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        // Filter for specific views
        const approvedAppointments = allAppointments.filter(a => a.status === "approved" || a.status === "completed");
        const pendingAppointments = allAppointments.filter(a => a.status === "pending" || a.status === "requested");

        // Update Stats (Real-time calculation)
        setStats({
          totalAppointments: approvedAppointments.length, // Show ONLY approved in Total
          pendingAppointments: pendingAppointments.length, // Show Pending separately
        });

        // Use APPROVED appointments for lists and charts
        const sortedRecent = [...approvedAppointments].sort((a, b) => 
            (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
        ).slice(0, 5);
        setRecentAppointments(sortedRecent);

        // Process Timeline Analytics
        const timelineMap = {};
        approvedAppointments.forEach((doc) => {
          if (!doc.date) return;
          const date = new Date(doc.date);
          const key = date.toLocaleString("default", { month: "short", year: "2-digit" }); 
          timelineMap[key] = (timelineMap[key] || 0) + 1;
        });
        setAnalyticsData(Object.keys(timelineMap).map(key => ({ name: key, appointments: timelineMap[key] })));

        // Process Specialization Analytics
        const specMap = {};
        approvedAppointments.forEach((doc) => {
          const type = doc.appointmentType || "General";
          specMap[type] = (specMap[type] || 0) + 1;
        });
        setSpecializationData(Object.keys(specMap).map(key => ({ name: key, value: specMap[key] })));

        // 4. Fetch All Prescriptions for Analysis (Limit 50 for performance)
        const prescriptionQuery = query(
          collection(db, "prescriptions"),
          where("patientId", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(50)
        );
        const prescriptionSnap = await getDocs(prescriptionQuery);

        if (!prescriptionSnap.empty) {
          // Aggregate medicines from ALL fetched prescriptions
          let allMedicines = [];
          prescriptionSnap.docs.forEach(doc => {
            const data = doc.data();
            if (data.medicines && Array.isArray(data.medicines)) {
              allMedicines = [...allMedicines, ...data.medicines];
            }
          });

          // Use the CSV-based analyzer on the aggregated list
          const result = analyzePrescription(patientAge, allMedicines);
          
          if (result && result.chart_data) {
             setMedicineDosage(result.chart_data.daily_dosage_chart);
             setMedicineDuration(result.chart_data.medicine_duration_chart);
             setMedicineRisk(result.chart_data.side_effect_risk_chart);
             setMedicineUsage(result.chart_data.medicine_usage_chart);
             setPrescriptionStats(result.stats);
             setHasPrescriptionStats(true);
          }
        }

      } catch (err) {
        console.error("Dashboard data fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate, userData]);


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-16 px-6 pb-12">
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
          icon={<Calendar className="w-8 h-8 text-emerald-600" />}
          bg="bg-white"
        />
        <StatCard
          label="Pending Appointments"
          value={stats.pendingAppointments}
          icon={<Clock className="w-8 h-8 text-orange-500" />}
          bg="bg-white"
        />
      </div>

      {/* ================= MAIN GRID ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN (Charts) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* APPOINTMENT ANALYTICS */}
          {/* APPOINTMENT ANALYTICS */}
          {analyticsData.length > 0 && (
            <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl shadow-sm p-6">
              <h2 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-600" />
                Health Analytics
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Timeline */}
                <div className="h-64">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 text-center">Appointments History</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{fontSize: 12}} />
                      <YAxis allowDecimals={false} />
                      <Tooltip cursor={{fill: 'transparent'}} />
                      <Bar dataKey="appointments" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Specialization */}
                <div className="h-64">
                   <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 text-center">Visit Types</h3>
                   <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={specializationData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {specializationData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend iconType="circle" wrapperStyle={{fontSize: '12px'}} />
                      </PieChart>
                   </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* PRESCRIPTION ANALYTICS (Charts from analyzed medicines) */}
          {hasPrescriptionStats && prescriptionStats && (
            <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl shadow-sm p-6">
              <div className="mb-6 flex items-center justify-between">
                 <h2 className="font-bold text-slate-800 flex items-center gap-2">
                  <Pill className="w-5 h-5 text-purple-600" />
                  Medication Insights & History
                </h2>
                <span className="text-xs font-medium px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                  Aggregated Analysis
                </span>
              </div>

              {/* SUMMARY CARDS */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                 <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-500 font-medium uppercase">Total Prescribed</p>
                    <p className="text-2xl font-bold text-slate-800">{prescriptionStats.total_medicines}</p>
                 </div>
                 <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-500 font-medium uppercase">Unique Meds</p>
                    <p className="text-2xl font-bold text-slate-800">{prescriptionStats.active_medicines}</p>
                 </div>
                 <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                    <p className="text-xs text-red-600 font-medium uppercase">High Risk</p>
                    <p className="text-2xl font-bold text-red-700">{prescriptionStats.high_risk_count}</p>
                 </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Dosage Chart */}
                  <div className="h-64">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 text-center">Daily Dosage Frequency</h3>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={medicineDosage}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="medicine_name" tick={{fontSize: 10}} interval={0} height={50} angle={-30} textAnchor="end" />
                        <YAxis />
                        <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                        <Bar dataKey="frequency_per_day" fill="#8B5CF6" radius={[4, 4, 0, 0]} name="Times/Day" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Duration Chart */}
                  <div className="h-64">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 text-center">Course Duration</h3>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={medicineDuration} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" hide />
                        <YAxis dataKey="medicine_name" type="category" width={90} tick={{fontSize: 10}} />
                        <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                        <Bar dataKey="duration_days" fill="#10B981" radius={[0, 4, 4, 0]} name="Days" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Usage/Therapeutic Class */}
                  <div className="h-64">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 text-center">Therapeutic Distribution</h3>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={medicineUsage}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="count"
                          nameKey="usage_type"
                        >
                          {medicineUsage.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                         <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                         <Legend iconType="circle" wrapperStyle={{fontSize: '11px'}} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Risk Profile */}
                  <div className="h-64">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 text-center">Risk Assessment</h3>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={medicineRisk}
                          cx="50%"
                          cy="50%"
                          startAngle={180}
                          endAngle={0}
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="risk_level"
                          nameKey="medicine_name"
                        >
                          {medicineRisk.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS_RISK[(entry.risk_level - 1) % 3]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                        <Legend verticalAlign="bottom" height={36} wrapperStyle={{fontSize: '11px'}} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-6 text-center italic">
                * Based on analysis of your complete prescription history.
              </p>
            </div>
          )}

          {/* RECENT APPOINTMENTS LIST */}
          <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl shadow-sm p-6">
            <h2 className="font-bold text-slate-800 mb-4">
              Recent Approved Appointments
            </h2>
            {recentAppointments.length === 0 ? (
              <p className="text-sm text-slate-400">No approved appointments yet</p>
            ) : (
              <div className="space-y-3">
                {recentAppointments.map((a) => (
                  <div key={a.id} className="flex justify-between items-center p-4 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                         {a.doctorName?.charAt(0) || "D"}
                       </div>
                       <div>
                        <p className="font-semibold text-slate-800">Dr. {a.doctorName}</p>
                        <p className="text-xs text-slate-500">{a.appointmentType} • {a.date}</p>
                       </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                      Approved
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN (Doctors & Info) */}
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl shadow-sm p-6">
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
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all cursor-pointer group"
                  >
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      {doc.name?.charAt(0) || "D"}
                    </div>

                    <div className="flex-1">
                      <p className="font-semibold text-slate-800 text-sm">
                        {doc.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {doc.specialization} • {doc.experience} yrs
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white min-h-[200px] flex flex-col justify-center">
             <h3 className="font-bold text-lg mb-2">Did you know?</h3>
             <p className="text-white/80 text-sm">
               Regular check-ups can detect health issues before they become problems. Schedule your next visit today!
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple Stat Card Component
function StatCard({ label, value, icon, bg }) {
  return (
    <div className={`p-6 rounded-2xl shadow-sm border border-slate-200 ${bg} flex items-center justify-between`}>
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <h2 className="text-3xl font-extrabold text-slate-800 mt-1">{value}</h2>
      </div>
      <div>{icon}</div>
    </div>
  );
}

export default Dashboard;
