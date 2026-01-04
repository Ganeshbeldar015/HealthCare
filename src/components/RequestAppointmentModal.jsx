import React, { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
  serverTimestamp,
  updateDoc,
  increment,
} from "firebase/firestore";
import { auth, db } from "../utils/firebase";

const APPOINTMENT_TYPES = [
  "General Consultation",
  "Follow-up",
  "Emergency",
  "Lab Test Review",
];

function RequestAppointmentModal({ onClose }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    doctorId: "",
    doctorName: "",
    appointmentType: "",
    date: "",
    note: "",
  });

  /* 🔹 Fetch ONLY approved doctors */
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const q = query(
          collection(db, "doctors"),
          where("status", "==", "approved")
        );

        const snapshot = await getDocs(q);
        setDoctors(
          snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }))
        );
      } catch (error) {
        console.error("Failed to fetch doctors:", error);
      }
    };

    fetchDoctors();
  }, []);

  /* 🔹 Submit Appointment Request */
  const submitRequest = async () => {
    if (!form.doctorId || !form.appointmentType || !form.date) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);

    try {
      const patientRef = doc(db, "patients", auth.currentUser.uid);
      const patientSnap = await getDoc(patientRef);

      if (!patientSnap.exists()) {
        alert("Patient profile not found. Please complete registration.");
        setLoading(false);
        return;
      }

      const patient = patientSnap.data();
      const patientName = `${patient.personalInfo.firstName} ${patient.personalInfo.lastName}`;
      const patientPhone = patient.personalInfo.contact;

      /* 🧾 Create appointment */
      await addDoc(collection(db, "appointments"), {
        patientId: auth.currentUser.uid,
        patientName,
        patientPhone,
        doctorId: form.doctorId,
        doctorName: form.doctorName,
        appointmentType: form.appointmentType,
        date: form.date,
        note: form.note || "",
        status: "requested",
        createdAt: serverTimestamp(),
      });

      /* 🔢 Update patient counters */
      await updateDoc(patientRef, {
        appointmentCount: increment(1),
        pendingAppointmentCount: increment(1),
      });

      /* 🔔 Notify doctor */
      await addDoc(collection(db, "notifications"), {
        userId: form.doctorId,
        title: "New Appointment Request",
        message: `New appointment request from ${patientName}`,
        read: false,
        createdAt: serverTimestamp(),
      });

      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-end z-50">
      <div className="bg-white w-full max-w-md p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Request Appointment</h2>
          <button onClick={onClose} className="text-gray-500 text-xl">✕</button>
        </div>

        {/* Doctor */}
        <label className="block text-sm font-medium mb-1">Select Doctor</label>
        <select
          className="w-full border rounded-lg p-3 mb-4"
          value={form.doctorId}
          onChange={(e) => {
            const selectedDoctor = doctors.find(d => d.id === e.target.value);
            if (!selectedDoctor) return;

            setForm(prev => ({
              ...prev,
              doctorId: selectedDoctor.id,
              doctorName: selectedDoctor.name,
            }));
          }}
        >
          <option value="">-- Select Doctor --</option>
          {doctors.map(doc => (
            <option key={doc.id} value={doc.id}>
              {doc.name} — {doc.specialization}
            </option>
          ))}
        </select>

        {/* Type */}
        <label className="block text-sm font-medium mb-1">Appointment Type</label>
        <select
          className="w-full border rounded-lg p-3 mb-4"
          value={form.appointmentType}
          onChange={(e) =>
            setForm({ ...form, appointmentType: e.target.value })
          }
        >
          <option value="">-- Select Type --</option>
          {APPOINTMENT_TYPES.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        {/* Date */}
        <label className="block text-sm font-medium mb-1">Appointment Date</label>
        <input
          type="date"
          className="w-full border rounded-lg p-3 mb-4"
          value={form.date}
          min={new Date().toISOString().split("T")[0]}
          onChange={(e) =>
            setForm({ ...form, date: e.target.value })
          }
        />

        {/* Note */}
        <label className="block text-sm font-medium mb-1">
          Additional Note (optional)
        </label>
        <textarea
          className="w-full border rounded-lg p-3 mb-6"
          rows={3}
          value={form.note}
          onChange={(e) =>
            setForm({ ...form, note: e.target.value })
          }
        />

        <button
          onClick={submitRequest}
          disabled={loading}
          className="bg-blue-600 text-white w-full py-3 rounded-lg font-semibold disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Request"}
        </button>
      </div>
    </div>
  );
}

export default RequestAppointmentModal;
