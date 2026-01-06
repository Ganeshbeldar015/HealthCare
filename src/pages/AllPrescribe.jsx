import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

import { db } from "../utils/firebase";
import { useAuth } from "../utils/useAuth";

export default function AllPrescribe() {
  const navigate = useNavigate();
  const { user, userData } = useAuth();

  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  /* 🔹 Fetch prescriptions role-wise */
  useEffect(() => {
    if (!user || !userData) return;

    const fetchPrescriptions = async () => {
      try {
        let q;

        // 👨‍⚕️ Doctor → only his prescriptions
        if (userData.role === "doctor") {
          q = query(
            collection(db, "prescriptions"),
            where("doctorId", "==", user.uid),
            orderBy("createdAt", "desc")
          );
        }

        // 🧍 Patient → only his prescriptions
        if (userData.role === "patient") {
          q = query(
            collection(db, "prescriptions"),
            where("patientId", "==", user.uid),
            orderBy("createdAt", "desc")
          );
        }

        if (!q) return;

        const snap = await getDocs(q);

        const list = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        setPrescriptions(list);
      } catch (err) {
        console.error("Failed to fetch prescriptions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, [user, userData]);

  /* 🔙 Back navigation */
  const handleBack = () => {
    if (userData?.role === "doctor") {
      navigate("/doctor-dashboard");
    } else {
      navigate("/dashboard");
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-500">
        Loading prescriptions…
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto bg-white/90 backdrop-blur rounded-2xl shadow p-6 pt-16">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={handleBack}
          className="p-2 rounded-lg hover:bg-gray-100 transition"
        >
          <ArrowLeftIcon className="h-6 w-6 text-gray-700" />
        </button>

        <h1 className="text-2xl font-bold text-gray-800">
          Prescriptions
        </h1>
      </div>

      {prescriptions.length === 0 ? (
        <p className="text-gray-500">
          No prescriptions found
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-600">
                <th className="p-3 text-left">#</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Doctor</th>
                <th className="p-3 text-left">Patient</th>
                <th className="p-3 text-left">Medicines</th>
                <th className="p-3 text-left">Action</th>
              </tr>
            </thead>

            <tbody>
              {prescriptions.map((p, index) => (
                <tr
                  key={p.id}
                  onClick={() => navigate(`/prescription/${p.id}`)}
                  className="border-t hover:bg-gray-50 cursor-pointer transition"
                >
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3">{p.date}</td>
                  <td className="p-3">{p.doctorName}</td>
                  <td className="p-3">{p.patientName}</td>
                  <td className="p-3">
                    {p.medicines?.length || 0}
                  </td>
                  <td className="p-3 text-purple-600 font-medium">
                    View
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
