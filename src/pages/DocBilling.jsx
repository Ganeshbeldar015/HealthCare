import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

import { db, auth } from "../utils/firebase";

export default function DocBilling() {
  const navigate = useNavigate();

  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  /* ================= REAL-TIME FETCH (LOGGED-IN DOCTOR ONLY) ================= */
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      const q = query(
        collection(db, "bills"),
        where("doctorAuthUid", "==", user.uid)
      );

      const unsubscribeSnapshot = onSnapshot(
        q,
        (snapshot) => {
          const list = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setBills(list);
          setLoading(false);
        },
        (error) => {
          console.error("Error fetching bills:", error);
          setLoading(false);
        }
      );

      return () => unsubscribeSnapshot();
    });

    return () => unsubscribeAuth();
  }, []);

  /* ================= CONFIRM BILL ================= */
  const confirmBill = async (billId) => {
    try {
      setUpdatingId(billId);

      await updateDoc(doc(db, "bills", billId), {
        status: "Confirmed",
      });

      // UI updates automatically via onSnapshot
    } catch (err) {
      console.error("Confirm failed:", err);
      alert("Failed to confirm bill");
    } finally {
      setUpdatingId(null);
    }
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="p-10 text-center text-gray-500">
        Loading bills…
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-20 bg-white p-6 rounded-xl shadow">
      {/* ================= HEADER ================= */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/doctor-dashboard")}
          className="p-2 rounded-lg hover:bg-gray-100 transition"
        >
          <ArrowLeftIcon className="h-5 w-5 text-gray-700" />
        </button>

        <h1 className="text-2xl font-bold">Issued Bills</h1>
      </div>

      {/* ================= EMPTY STATE ================= */}
      {bills.length === 0 ? (
        <p className="text-gray-500">No bills issued yet.</p>
      ) : (
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border">#</th>
              <th className="p-3 border">Date</th>
              <th className="p-3 border">Patient</th>
              <th className="p-3 border">Total</th>
              <th className="p-3 border">Status</th>
              <th className="p-3 border">Action</th>
            </tr>
          </thead>

          <tbody>
            {bills.map((bill, i) => (
              <tr key={bill.id} className="hover:bg-gray-50">
                <td className="p-3 border">{i + 1}</td>

                <td className="p-3 border">{bill.date || "-"}</td>

                <td className="p-3 border">
                  {bill.patientName || "-"}
                </td>

                <td className="p-3 border font-semibold">
                  ₹{bill.total ?? 0}
                </td>

                <td className="p-3 border">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      bill.status === "Confirmed"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {bill.status || "Pending"}
                  </span>
                </td>

                <td className="p-3 border">
                  {bill.status === "Pending" ? (
                    <button
                      onClick={() => confirmBill(bill.id)}
                      disabled={updatingId === bill.id}
                      className="flex items-center gap-1 px-3 py-1 text-xs rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      <CheckCircleIcon className="h-4 w-4" />
                      {updatingId === bill.id
                        ? "Confirming..."
                        : "Confirm"}
                    </button>
                  ) : (
                    <span className="text-gray-400 text-xs">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
