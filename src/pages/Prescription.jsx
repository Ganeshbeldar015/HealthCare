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
      await addDoc(collection(db, "prescriptions"), {
        /* 🔐 DOCTOR (AUTH SOURCE OF TRUTH) */
        doctorAuthUid: auth.currentUser.uid,
        doctorRefId: doctor.id,
        doctorName: doctor.name,
        doctorMedicalUid: doctor.collegeUid, // optional but useful

        /* 👤 PATIENT */
        patientId: selectedPatient.id,
        patientName: `${selectedPatient.personalInfo.firstName} ${selectedPatient.personalInfo.lastName}`,

        date,
        medicines,
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
