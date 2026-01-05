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
import { useAuth } from "../context/AuthContext"; // ✅ FIXED IMPORT

function Notifications() {
    const navigate = useNavigate();
    const { userData, loading } = useAuth();

    const [notifications, setNotifications] = useState([]);
    const [fetching, setFetching] = useState(true);

    /* 🔔 FETCH NOTIFICATIONS */
    useEffect(() => {
        if (loading || !auth.currentUser) return;

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
                setFetching(false);
            },
            (err) => {
                console.error("Notification fetch error:", err);
                setFetching(false);
            }
        );

        return () => unsub();
    }, [loading]);

    /* 🔙 BACK BUTTON */
    const handleBack = () => {
        if (!userData) return;

        switch (userData.role) {
            case "doctor":
                navigate("/doctor-dashboard");
                break;
            case "patient":
                navigate("/appointments");
                break;
            case "admin":
                navigate("/admin");
                break;
            default:
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

            handleBack();
        } catch (err) {
            console.error("Notification click error:", err);
        }
    };

    /* 🗑️ DELETE NOTIFICATION */
    const handleDelete = async (e, id) => {
        e.stopPropagation();

        const ok = window.confirm("Delete this notification?");
        if (!ok) return;

        try {
            await deleteDoc(doc(db, "notifications", id));
        } catch (err) {
            console.error("Delete failed:", err);
            alert("Failed to delete notification");
        }
    };

    /* ⏳ LOADING STATES */
    if (loading || fetching) {
        return (
            <div className="p-6 text-center text-gray-500">
                Loading notifications...
            </div>
        );
    }
    const getPatientNotificationStyle = (n) => {
        const text = `${n.title} ${n.message}`.toLowerCase();

        if (text.includes("approved")) {
            return "bg-green-50 border-green-300 text-green-800";
        }

        if (text.includes("rejected")) {
            return "bg-red-50 border-red-300 text-red-800";
        }

        return "bg-blue-50 border-blue-200 text-gray-800";
    };

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
                            onClick={() => handleNotificationClick(n)}
                            className={`group flex items-start justify-between gap-4 p-4 cursor-pointer transition
                                border rounded-lg mb-3
                                ${getPatientNotificationStyle(n)}
                                ${!n.read ? "ring-1 ring-blue-300" : ""}
                                `}
                        >
                            {/* CONTENT */}
                            <div className="flex-1">
                                <p className="font-semibold">{n.title}</p>
                                <p className="text-sm opacity-90">{n.message}</p>

                                {/* STATUS TAG */}
                                {n.message?.toLowerCase().includes("approved") && (
                                    <span className="inline-block mt-2 px-2 py-0.5 text-xs rounded-full bg-green-600 text-white">
                                        Approved
                                    </span>
                                )}

                                {n.message?.toLowerCase().includes("rejected") && (
                                    <span className="inline-block mt-2 px-2 py-0.5 text-xs rounded-full bg-red-600 text-white">
                                        Rejected
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
