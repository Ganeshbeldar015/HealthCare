import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from "firebase/firestore";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

import { db, auth } from "../utils/firebase";

export default function AllPrescribePat() {
  const navigate = useNavigate();

  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH PATIENT PRESCRIPTIONS ================= */
  useEffect(() => {
    if (!auth.currentUser) return;

    const fetchPrescriptions = async () => {
      try {
        const q = query(
          collection(db, "prescriptions"),
          where("patientId", "==", auth.currentUser.uid), // ✅ FIX
          orderBy("createdAt", "desc")
        );

        const snap = await getDocs(q);

        const list = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setPrescriptions(list);
      } catch (error) {
        console.error("Error fetching patient prescriptions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, []);

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-500">
        Loading prescriptions…
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-20 bg-white p-6 rounded-xl shadow">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="p-2 rounded-lg hover:bg-gray-100 transition"
        >
          <ArrowLeftIcon className="h-5 w-5 text-gray-700" />
        </button>

        <h1 className="text-2xl font-bold">My Prescriptions</h1>
      </div>

      {prescriptions.length === 0 ? (
        <p className="text-gray-500">No prescriptions found.</p>
      ) : (
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border">#</th>
              <th className="p-3 border">Date</th>
              <th className="p-3 border">Doctor</th>
              <th className="p-3 border">Action</th>
            </tr>
          </thead>

          <tbody>
            {prescriptions.map((p, i) => (
              <tr
                key={p.id}
                onClick={() => navigate(`/PrescribeInfo/${p.id}`)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td className="p-3 border">{i + 1}</td>
                <td className="p-3 border">{p.date || "-"}</td>
                <td className="p-3 border">{p.doctorName || "-"}</td>
                <td className="p-3 border text-emerald-600 font-semibold">
                  View
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
