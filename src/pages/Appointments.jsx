import React, { useEffect, useRef, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { auth, db } from "../utils/firebase";
import RequestAppointmentModal from "../components/RequestAppointmentModal";

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [open, setOpen] = useState(false);

  // 🔹 Track previous statuses to avoid double decrement
  const prevStatusRef = useRef({});

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "appointments"),
      where("patientId", "==", auth.currentUser.uid)
    );

    const unsub = onSnapshot(q, async (snap) => {
      const updatedAppointments = [];

      for (const docSnap of snap.docs) {
        const data = docSnap.data();
        const prevStatus = prevStatusRef.current[docSnap.id];
        const currentStatus = data.status;

        /* 🔻 Decrease pending count when status changes
           requested → approved / rejected / withdrawn */
        if (
          prevStatus === "requested" &&
          ["approved", "rejected", "withdrawn"].includes(currentStatus)
        ) {
          await updateDoc(
            doc(db, "patients", auth.currentUser.uid),
            {
              pendingAppointmentCount: increment(-1),
            }
          );
        }

        prevStatusRef.current[docSnap.id] = currentStatus;

        updatedAppointments.push({
          id: docSnap.id,
          ...data,
        });
      }

      setAppointments(updatedAppointments);
    });

    return () => unsub();
  }, []);

  /* 🔹 Withdraw Appointment (Patient Action) */
  const withdrawAppointment = async (appointmentId) => {
    const confirmWithdraw = window.confirm(
      "Are you sure you want to withdraw this appointment?"
    );
    if (!confirmWithdraw) return;

    try {
      await updateDoc(doc(db, "appointments", appointmentId), {
        status: "withdrawn",
        withdrawnAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Withdraw failed:", error);
      alert("Failed to withdraw appointment");
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Appointments</h2>
        <button
          onClick={() => setOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Request Appointment
        </button>
      </div>

      {appointments.length === 0 ? (
        <p className="text-gray-500">No appointments yet</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="p-2">Date</th>
              <th className="p-2">Doctor</th>
              <th className="p-2">Status</th>
              <th className="p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((a) => (
              <tr key={a.id} className="border-t">
                <td className="p-2">{a.date}</td>
                <td className="p-2">{a.doctorName}</td>

                <td className="p-2">
                  <StatusBadge status={a.status} />
                </td>

                <td className="p-2 text-center">
                  {a.status === "requested" && (
                    <button
                      onClick={() => withdrawAppointment(a.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded text-xs"
                    >
                      Withdraw
                    </button>
                  )}

                  {["approved", "rejected", "withdrawn"].includes(
                    a.status
                  ) && (
                    <span className="text-gray-500 text-xs capitalize">
                      {a.status}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {open && (
        <RequestAppointmentModal onClose={() => setOpen(false)} />
      )}
    </div>
  );
}

/* 🔹 Status Badge */
function StatusBadge({ status }) {
  const styles = {
    requested: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    withdrawn: "bg-gray-100 text-gray-600",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${
        styles[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}

export default Appointments;
