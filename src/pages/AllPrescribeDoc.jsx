import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { onAuthStateChanged } from "firebase/auth";

import { db, auth } from "../utils/firebase";

export default function AllPrescribeDoc() {
  const navigate = useNavigate();

  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= REAL-TIME FETCH (LOGGED-IN DOCTOR ONLY) ================= */
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      console.log("AUTH UID:", user.uid);

      const q = query(
        collection(db, "prescriptions"),
        where("doctorAuthUid", "==", user.uid),
        orderBy("createdAt", "desc")
      );

      const unsubscribeSnapshot = onSnapshot(
        q,
        (snapshot) => {
          const list = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setPrescriptions(list);
          setLoading(false);
        },
        (error) => {
          console.error("Error fetching prescriptions:", error);
          setLoading(false);
        }
      );

      return () => unsubscribeSnapshot();
    });

    return () => unsubscribeAuth();
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
          onClick={() => navigate("/doctor-dashboard")}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <ArrowLeftIcon className="h-5 w-5 text-gray-700" />
        </button>

        <h1 className="text-2xl font-bold">Issued Prescriptions</h1>
      </div>

      {prescriptions.length === 0 ? (
        <p className="text-gray-500">No prescriptions issued yet.</p>
      ) : (
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border">#</th>
              <th className="p-3 border">Date</th>
              <th className="p-3 border">Patient</th>
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
                <td className="p-3 border">{p.date}</td>
                <td className="p-3 border">{p.patientName}</td>
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
    