import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";

import { auth, db } from "../utils/firebase";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from "recharts";

export default function Prescription() {
  const navigate = useNavigate();

  /* ================= LOGGED-IN DOCTOR ================= */
  const [doctor, setDoctor] = useState(null);
  const [doctorLoading, setDoctorLoading] = useState(true);

  /* ================= PATIENTS ================= */
  const [patients, setPatients] = useState([]);
  const [patientSearch, setPatientSearch] = useState("");
  const [showPatientList, setShowPatientList] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  /* ================= DATE ================= */
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  /* ================= MEDICINES ================= */
  const [medicines, setMedicines] = useState([
    {
      name: "",
      quantity: "",
      timing: { morning: false, afternoon: false, night: false },
      note: "",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiInsights, setAiInsights] = useState("");
  const [chartData, setChartData] = useState([]);
  const [insightsLoading, setInsightsLoading] = useState(false);

  /* ================= AI ANALYSIS ================= */
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAnalyzing(true);
    try {
      const { analyzePrescriptionImage } = await import("../utils/aiService");
      const medicinesList = await analyzePrescriptionImage(file);
      
      if (Array.isArray(medicinesList)) {
        setMedicines(medicinesList);
      } else {
        alert("Could not extract medicines. Please try again.");
      }
    } catch (error) {
      console.error("Analysis failed", error);
      alert(error.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const generateInsights = async () => {
    if (medicines.every(m => !m.name)) return;
    
    setInsightsLoading(true);
    try {
      const { getMedicineInsights } = await import("../utils/aiService");
      const result = await getMedicineInsights(medicines);
      
      if (typeof result === "object") {
        setAiInsights(result.summary);
        setChartData(result.riskAnalysis || []);
      } else {
         // Fallback if it returns text (e.g. error message)
         setAiInsights(result);
         setChartData([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setInsightsLoading(false);
    }
  };

  /* ================= FETCH LOGGED-IN DOCTOR (AUTH UID) ================= */
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setDoctorLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "doctors"),
          where("authUid", "==", user.uid), // 🔑 AUTH UID
          where("status", "==", "approved")
        );

        const snap = await getDocs(q);

        if (!snap.empty) {
          setDoctor({ id: snap.docs[0].id, ...snap.docs[0].data() });
        } else {
          alert("Doctor profile not found or not approved");
        }
      } catch (err) {
        console.error("Failed to fetch doctor:", err);
      } finally {
        setDoctorLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  /* ================= FETCH PATIENTS ================= */
  useEffect(() => {
    const fetchPatients = async () => {
      const snap = await getDocs(collection(db, "patients"));
      setPatients(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    fetchPatients();
  }, []);

  /* ================= MEDICINE HANDLERS ================= */
  const addMedicine = () => {
    setMedicines([
      ...medicines,
      {
        name: "",
        quantity: "",
        timing: { morning: false, afternoon: false, night: false },
        note: "",
      },
    ]);
  };

  const updateMedicine = (index, field, value) => {
    const copy = [...medicines];
    copy[index][field] = value;
    setMedicines(copy);
  };

  const toggleTiming = (index, time) => {
    const copy = [...medicines];
    copy[index].timing[time] = !copy[index].timing[time];
    setMedicines(copy);
  };

  /* ================= SUBMIT ================= */
  const submitPrescription = async () => {
    if (!doctor || !selectedPatient) {
      alert("Doctor or patient not selected");
      return;
    }

    setLoading(true);

    try {
      // 1. Generate AI Chart Data for the Patient Dashboard
      let chartData = null;
      try {
         const { analyzePrescriptionForCharts } = await import("../utils/aiService");
         const patientAge = selectedPatient?.personalInfo?.age || 30; // Fallback
         chartData = await analyzePrescriptionForCharts(patientAge, medicines);
      } catch (aiError) {
        console.error("AI Analysis failed:", aiError);
        // Continue without charts rather than blocking submission
      }

      // 2. Save Prescription with Charts
      await addDoc(collection(db, "prescriptions"), {
        /* 🔐 DOCTOR (AUTH SOURCE OF TRUTH) */
        doctorAuthUid: auth.currentUser.uid,
        doctorRefId: doctor.id,
        doctorName: doctor.name,
        doctorMedicalUid: doctor.collegeUid, // optional but useful

        /* 👤 PATIENT */
        patientId: selectedPatient.id,
        patientName: `${selectedPatient.personalInfo.firstName} ${selectedPatient.personalInfo.lastName}`,

        /* 💊 DATA */
        date,
        medicines,
        chartData, // <--- Stored here!
        createdAt: serverTimestamp(),
      });

      navigate("/doctor/prescriptions", { replace: true });
    } catch (err) {
      console.error("Prescription creation failed:", err);
      alert("Failed to create prescription");
    } finally {
      setLoading(false);
    }
  };

  /* ================= FILTER PATIENTS ================= */
  const filteredPatients = patients.filter((p) =>
    `${p.personalInfo.firstName} ${p.personalInfo.lastName}`
      .toLowerCase()
      .includes(patientSearch.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto bg-white p-8 rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-6">Create Prescription</h1>

      {/* ================= DOCTOR (READ ONLY) ================= */}
      <label className="font-medium text-sm">Doctor</label>
      <input
        value={
          doctorLoading
            ? "Loading..."
            : doctor
            ? `${doctor.name}`
            : "Not available"
        }
        disabled
        className="w-full border rounded-lg px-4 py-2 mt-1 bg-gray-100 cursor-not-allowed"
      />

      {/* ================= PATIENT ================= */}
      <label className="font-medium text-sm mt-4 block">Patient</label>
      <input
        value={patientSearch}
        onChange={(e) => {
          setPatientSearch(e.target.value);
          setShowPatientList(true);
        }}
        onFocus={() => setShowPatientList(true)}
        placeholder="Search Patient"
        className="w-full border rounded-lg px-4 py-2 mt-1"
      />

      {showPatientList && patientSearch && (
        <div className="border rounded-lg mt-1 max-h-40 overflow-y-auto">
          {filteredPatients.map((p) => (
            <div
              key={p.id}
              onClick={() => {
                setSelectedPatient(p);
                setPatientSearch(
                  `${p.personalInfo.firstName} ${p.personalInfo.lastName}`
                );
                setShowPatientList(false);
              }}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              {p.personalInfo.firstName} {p.personalInfo.lastName}
            </div>
          ))}
        </div>
      )}

      {/* ================= DATE ================= */}
      <div className="mt-6">
        <label className="font-medium text-sm">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border rounded-lg px-4 py-2 mt-1"
        />
      </div>

      {/* ================= MEDICINES ================= */}
      <div className="mt-8 mb-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
        <h3 className="font-semibold text-emerald-800 mb-2">AI Prescription Auto-Fill</h3>
        <p className="text-sm text-emerald-600 mb-3">Upload a clear image of the prescription to automatically fill the details below.</p>
        <div className="flex items-center gap-4">
          <input 
            type="file" 
            accept="image/*"
            onChange={handleImageUpload}
            className="block w-full text-sm text-slate-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-emerald-100 file:text-emerald-700
              hover:file:bg-emerald-200"
          />
          {analyzing && <span className="text-sm font-medium text-emerald-700 animate-pulse">Analyzing...</span>}
        </div>
      </div>

      <div className="space-y-6 mt-6">
        {medicines.map((m, i) => (
          <div key={i} className="border rounded-xl p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                placeholder="Medicine name"
                value={m.name}
                onChange={(e) => updateMedicine(i, "name", e.target.value)}
                className="border rounded-lg px-3 py-2"
              />
              <input
                placeholder="Quantity"
                value={m.quantity}
                onChange={(e) => updateMedicine(i, "quantity", e.target.value)}
                className="border rounded-lg px-3 py-2"
              />
            </div>

            <div className="flex gap-4 mt-3">
              {["morning", "afternoon", "night"].map((t) => (
                <label key={t} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={m.timing[t]}
                    onChange={() => toggleTiming(i, t)}
                  />
                  {t}
                </label>
              ))}
            </div>

            <textarea
              placeholder="Note (optional)"
              value={m.note}
              onChange={(e) => updateMedicine(i, "note", e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mt-3"
            />
          </div>
        ))}
      </div>
      
      {/* ================= AI INSIGHTS ================= */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-slate-700">Medical Analysis</h3>
          <button 
             onClick={generateInsights}
             className="text-sm bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full hover:bg-indigo-100 font-medium transition"
             disabled={insightsLoading}
          >
             {insightsLoading ? "Analyzing..." : "✨ Analyze Potential Interactions"}
          </button>
        </div>
        
        {aiInsights && (
          <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl text-sm text-indigo-900 leading-relaxed">
            <h4 className="font-bold mb-1 text-indigo-700">AI Insight</h4>
            <p className="mb-4">{aiInsights}</p>

            {/* CHART */}
            {chartData.length > 0 && (
              <div className="mt-4 h-64 border-t border-indigo-200 pt-4">
                 <h5 className="font-semibold text-indigo-800 mb-2 text-center">Risk Profile Analysis</h5>
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={["#10B981", "#F59E0B", "#EF4444"][index % 3]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                 </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </div>
      <button
        onClick={addMedicine}
        className="mt-4 text-sm text-blue-600"
      >
        + Add another medicine
      </button>

      <button
        onClick={submitPrescription}
        disabled={loading}
        className="mt-8 w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold"
      >
        {loading ? "Submitting..." : "Submit Prescription"}
      </button>
    </div>
  );
}
