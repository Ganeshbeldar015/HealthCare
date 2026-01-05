import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { TrashIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

import { auth, db } from "../utils/firebase";
import { useAuth } from "../utils/useAuth";

function Notifications() {
  const navigate = useNavigate();
  const { userData } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  /* 🔔 FETCH NOTIFICATIONS */
  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", auth.currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setNotifications(
          snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }))
        );
        setLoading(false);
      },
      (err) => {
        console.error("Notification fetch error:", err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  /* 🔙 BACK BUTTON */
  const handleBack = () => {
    if (userData?.role === "doctor") {
      navigate("/doctor-dashboard");
    } else if (userData?.role === "patient") {
      navigate("/appointments");
    } else if (userData?.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/");
    }
  };

  /* 👉 CLICK NOTIFICATION */
  const handleNotificationClick = async (n) => {
    try {
      if (!n.read) {
        await updateDoc(doc(db, "notifications", n.id), {
          read: true,
        });
      }

      handleBack(); // redirect after click
    } catch (err) {
      console.error("Notification click error:", err);
    }
  };

  /* 🗑️ DELETE NOTIFICATION */
  const handleDelete = async (e, id) => {
    e.stopPropagation(); // 🚫 prevent navigation

    const ok = window.confirm("Delete this notification?");
    if (!ok) return;

    try {
      await deleteDoc(doc(db, "notifications", id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete notification");
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading notifications...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white shadow rounded-xl p-6 pt-20">

      {/* 🔙 HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={handleBack}
          className="p-2 rounded-lg hover:bg-gray-100 transition"
          title="Go back"
        >
          <ArrowLeftIcon className="h-6 w-6 text-gray-700" />
        </button>

        <h2 className="text-2xl font-bold">Notifications</h2>
      </div>

      {notifications.length === 0 ? (
        <p className="text-gray-500">No notifications available</p>
      ) : (
        <ul className="divide-y">
          {notifications.map((n) => (
            <li
              key={n.id}
              onClick={() => handleNotificationClick(n)}
              className={`group flex items-start justify-between gap-4 p-4 cursor-pointer transition
                hover:bg-gray-50
                ${!n.read ? "bg-blue-50" : ""}
              `}
            >
              {/* CONTENT */}
              <div className="flex-1">
                <p className="font-semibold text-gray-800">
                  {n.title}
                </p>
                <p className="text-sm text-gray-600">
                  {n.message}
                </p>

                {!n.read && (
                  <span className="inline-block mt-2 text-xs text-blue-600 font-medium">
                    New
                  </span>
                )}
              </div>

              {/* DELETE */}
              <button
                onClick={(e) => handleDelete(e, n.id)}
                className="opacity-0 group-hover:opacity-100 transition text-red-500 hover:text-red-700"
                title="Delete notification"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Notifications;
