import React, { useEffect, useState } from "react";
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
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);

  const [doctorSearch, setDoctorSearch] = useState("");
  const [patientSearch, setPatientSearch] = useState("");

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [medicines, setMedicines] = useState([
    {
      name: "",
      quantity: "",
      timing: {
        morning: false,
        afternoon: false,
        night: false,
      },
      note: "",
    },
  ]);

  const [loading, setLoading] = useState(false);

  /* ================= FETCH DOCTORS ================= */
  useEffect(() => {
    const fetchDoctors = async () => {
      const q = query(
        collection(db, "doctors"),
        where("status", "==", "approved")
      );
      const snap = await getDocs(q);
      setDoctors(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };

    fetchDoctors();
  }, []);

  /* ================= FETCH PATIENTS ================= */
  useEffect(() => {
    const fetchPatients = async () => {
      const snap = await getDocs(collection(db, "patients"));
      setPatients(snap.docs.map(d => ({ id: d.id, ...d.data() })));
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
    if (!selectedDoctor || !selectedPatient) {
      alert("Please select doctor and patient");
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, "prescriptions"), {
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        patientId: selectedPatient.id,
        patientName: `${selectedPatient.personalInfo.firstName} ${selectedPatient.personalInfo.lastName}`,
        date,
        medicines,
        createdBy: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      });

      alert("Prescription created successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to create prescription");
    } finally {
      setLoading(false);
    }
  };

  /* ================= FILTERS ================= */
  const filteredDoctors = doctors.filter(d =>
    d.name?.toLowerCase().includes(doctorSearch.toLowerCase())
  );

  const filteredPatients = patients.filter(p =>
    `${p.personalInfo.firstName} ${p.personalInfo.lastName}`
      .toLowerCase()
      .includes(patientSearch.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto bg-white p-8 rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-6">Create Prescription</h1>

      {/* ================= DOCTOR & PATIENT ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Doctor */}
        <div>
          <label className="font-medium text-sm">Doctor</label>
          <input
            value={doctorSearch}
            onChange={e => setDoctorSearch(e.target.value)}
            placeholder="Search Doctor"
            className="w-full border rounded-lg px-4 py-2 mt-1"
          />

          {doctorSearch && (
            <div className="border rounded-lg mt-1 max-h-40 overflow-y-auto">
              {filteredDoctors.map(d => (
                <div
                  key={d.id}
                  onClick={() => {
                    setSelectedDoctor(d);
                    setDoctorSearch(d.name);
                  }}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  {d.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Patient */}
        <div>
          <label className="font-medium text-sm">Patient</label>
          <input
            value={patientSearch}
            onChange={e => setPatientSearch(e.target.value)}
            placeholder="Search Patient"
            className="w-full border rounded-lg px-4 py-2 mt-1"
          />

          {patientSearch && (
            <div className="border rounded-lg mt-1 max-h-40 overflow-y-auto">
              {filteredPatients.map(p => (
                <div
                  key={p.id}
                  onClick={() => {
                    setSelectedPatient(p);
                    setPatientSearch(
                      `${p.personalInfo.firstName} ${p.personalInfo.lastName}`
                    );
                  }}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  {p.personalInfo.firstName} {p.personalInfo.lastName}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ================= DATE ================= */}
      <div className="mb-6">
        <label className="font-medium text-sm">Date</label>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="border rounded-lg px-4 py-2 mt-1"
        />
      </div>

      {/* ================= MEDICINES ================= */}
      <div className="space-y-6">
        {medicines.map((m, i) => (
          <div key={i} className="border rounded-xl p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                placeholder="Medicine name"
                value={m.name}
                onChange={e => updateMedicine(i, "name", e.target.value)}
                className="border rounded-lg px-3 py-2"
              />

              <input
                placeholder="Quantity"
                value={m.quantity}
                onChange={e => updateMedicine(i, "quantity", e.target.value)}
                className="border rounded-lg px-3 py-2"
              />
            </div>

            <div className="flex gap-4 mt-3">
              {["morning", "afternoon", "night"].map(t => (
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
              onChange={e => updateMedicine(i, "note", e.target.value)}
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

      {/* ================= SUBMIT ================= */}
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
