import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { BellIcon } from "@heroicons/react/24/outline";

import { auth, db } from "../utils/firebase";
import { useAuth } from "../utils/useAuth";

function TopPanel() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const profileMenuRef = useRef(null);

  /* 🔔 Fetch unread notifications count */
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      where("read", "==", false)
    );

    const unsub = onSnapshot(q, (snap) => {
      setUnreadCount(snap.size);
    });

    return () => unsub();
  }, [user]);

  /* 🔐 Logout */
  const handleLogout = async () => {
    await signOut(auth);
    setProfileMenuOpen(false);
    navigate("/login");
  };

  /* ❌ Close dropdown on outside click */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bg-white/80 backdrop-blur-md fixed top-0 inset-x-0 z-50 border-b border-gray-200 shadow-sm">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">

          {/* Logo */}
          <div className="text-lg font-bold text-gray-800">
            🚀 HealthCare
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">

            {/* 🔔 Notification Bell */}
            {user && (
              <button
                onClick={() => navigate("/notifications")}
                className="relative p-2 rounded-full hover:bg-gray-100 transition"
              >
                <BellIcon className="h-6 w-6 text-gray-700" />

                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* 👤 Profile */}
            {user ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() =>
                    setProfileMenuOpen((prev) => !prev)
                  }
                  className="flex items-center gap-2 rounded-full"
                >
                  <img
                    src="/images/user_profile.png"
                    alt="Profile"
                    className="w-9 h-9 rounded-full border-2 border-purple-300"
                  />
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-lg border z-50">
                    <div className="px-4 py-3 text-sm border-b">
                      <p className="text-gray-500">Signed in as</p>
                      <p className="font-semibold break-words">
                        {user.email}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        navigate("/update-password");
                      }}
                      className="w-full px-4 py-3 text-left text-blue-600 hover:bg-blue-50"
                    >
                      Reset Password
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex gap-3">
                <button
                  onClick={() => navigate("/login")}
                  className="px-5 py-2 rounded-lg bg-purple-600 text-white"
                >
                  Login
                </button>
                <Link
                  to="/signup"
                  className="px-5 py-2 rounded-lg border border-purple-300 text-purple-700"
                >
                  Sign Up
                </Link>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default TopPanel;
