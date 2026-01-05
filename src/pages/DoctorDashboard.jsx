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

  /* 🔹 Fetch doctor appointments */
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

  /* 🔹 Update status (SINGLE SOURCE OF TRUTH) */
  const updateStatus = async (appointment, newStatus) => {
    try {
      // 🔻 Decrease pending count ONLY ONCE
      if (
        appointment.status === "requested" &&
        ["approved", "rejected"].includes(newStatus)
      ) {
        await updateDoc(doc(db, "patients", appointment.patientId), {
          pendingAppointmentCount: increment(-1),
        });
      }

      // 🔄 Update appointment status
      await updateDoc(doc(db, "appointments", appointment.id), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Failed to update appointment status", error);
      alert("Failed to update appointment");
    }
  };

  const updateAppointmentStatus = async (appointment, status) => {
    try {
      // 1️⃣ Update appointment
      await updateDoc(doc(db, "appointments", appointment.id), {
        status,
        updatedAt: serverTimestamp(),
      });

      // 2️⃣ Notify patient
      let message = "";

      if (status === "approved") {
        message = `Appointment with Dr. ${appointment.doctorName} is approved for ${appointment.date}`;
      }

      if (status === "rejected") {
        message = `Appointment with Dr. ${appointment.doctorName} on ${appointment.date} was rejected`;
      }

      await addDoc(collection(db, "notifications"), {
        userId: appointment.patientId,
        role: "patient",
        type: "appointment",
        title: "Appointment Update",
        message,
        appointmentDate: appointment.date,
        read: false,
        createdAt: serverTimestamp(),
      });

    } catch (err) {
      console.error("Status update failed", err);
      alert("Failed to update appointment");
    }
  };

  return (
    <div className="p-6 pt-16">
      <h1 className="text-3xl font-bold mb-6">Doctor Dashboard</h1>

      <div className="bg-white shadow rounded-xl overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">#</th>
              <th className="p-3 text-left">Patient Name</th>
              <th className="p-3 text-left">Mobile</th>
              <th className="p-3 text-left">Requested At</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Reason</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {appointments.length === 0 && (
              <tr>
                <td colSpan="8" className="p-4 text-center text-gray-500">
                  No appointments found
                </td>
              </tr>
            )}

            {appointments.map((a, index) => (
              <tr key={a.id} className="border-t">
                <td className="p-3">{index + 1}</td>
                <td className="p-3">{a.patientName || "N/A"}</td>
                <td className="p-3">{a.patientPhone || "-"}</td>

                <td className="p-3">
                  {a.createdAt?.toDate
                    ? a.createdAt.toDate().toLocaleString()
                    : "-"}
                </td>

                <td className="p-3">{a.date}</td>
                <td className="p-3">{a.appointmentType}</td>

                <td className="p-3 text-center">
                  <StatusBadge status={a.status} />
                </td>

                <td className="p-3 text-center space-x-2">
                  {a.status === "requested" && (
                    <>
                      <button
                        onClick={() => updateStatus(a, "approved")}
                        className="px-3 py-1 bg-green-600 text-white rounded text-xs"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updateStatus(a, "rejected")}
                        className="px-3 py-1 bg-red-500 text-white rounded text-xs"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {a.status === "approved" && (
                    <button
                      onClick={() => updateStatus(a, "completed")}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-xs"
                    >
                      Mark Completed
                    </button>
                  )}

                  {["rejected", "withdrawn"].includes(a.status) && (
                    <span className="text-xs text-gray-500 capitalize">
                      {a.status}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* 🔹 Status Badge */
function StatusBadge({ status }) {
  const styles = {
    requested: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    completed: "bg-blue-100 text-blue-700",
    withdrawn: "bg-gray-100 text-gray-600",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || "bg-gray-100 text-gray-600"
        }`}
    >
      {status}
    </span>
  );
}
