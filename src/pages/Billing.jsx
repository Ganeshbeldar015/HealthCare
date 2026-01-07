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

export default function Billing() {
  const navigate = useNavigate();

  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH PATIENT BILLS ================= */
  useEffect(() => {
    if (!auth.currentUser) return;

    const fetchBills = async () => {
      try {
        const q = query(
          collection(db, "bills"),
          where("patientId", "==", auth.currentUser.uid),
          
        );

        const snap = await getDocs(q);

        const list = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setBills(list);
      } catch (error) {
        console.error("Error fetching bills:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, []);

  /* ================= LOADING STATE ================= */
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
          onClick={() => navigate("/dashboard")}
          className="p-2 rounded-lg hover:bg-gray-100 transition"
        >
          <ArrowLeftIcon className="h-5 w-5 text-gray-700" />
        </button>

        <h1 className="text-2xl font-bold">My Bills</h1>
      </div>

      {/* ================= EMPTY STATE ================= */}
      {bills.length === 0 ? (
        <p className="text-gray-500">No bills found.</p>
      ) : (
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border">#</th>
              <th className="p-3 border">Date</th>
              <th className="p-3 border">Doctor</th>
              <th className="p-3 border">Total</th>
              <th className="p-3 border">Status</th>
              
            </tr>
          </thead>

          <tbody>
            {bills.map((bill, index) => (
              <tr
                key={bill.id}
                onClick={() => navigate(`/billing/${bill.id}`)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td className="p-3 border">{index + 1}</td>

                <td className="p-3 border">
                  {bill.date || "-"}
                </td>

                <td className="p-3 border">
                  {bill.doctorName || "-"}
                </td>

                <td className="p-3 border font-semibold">
                  ₹{bill.total ?? 0}
                </td>

                <td className="p-3 border">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      bill.status === "Paid"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {bill.status || "Pending"}
                  </span>
                </td>

                
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
