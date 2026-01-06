import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { collection, onSnapshot, query, where } from "firebase/firestore";

import {
  Activity,
  Bell,
  UserCircle,
  LogOut,
  LogIn,
  UserPlus,
  KeyRound,
} from "lucide-react";

import { auth, db } from "../utils/firebase";
import { useAuth } from "../utils/useAuth";

function TopPanel() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const profileMenuRef = useRef(null);

  /* 🔔 Fetch unread notifications */
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
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bg-white/80 backdrop-blur-md fixed top-0 inset-x-0 z-50 border-b shadow-sm">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">

          {/* 🏥 Mediconnect Logo */}
          <div
            className="flex items-center gap-3 group cursor-pointer px-5 py-5"
            // onClick={() => navigate("/")}
          >
            <div className="bg-emerald-600 p-2 rounded-xl text-white 
                            group-hover:rotate-12 transition-transform 
                            shadow-lg shadow-emerald-200">
              <Activity size={24} />
            </div>

            <div className="flex flex-col leading-tight">
              <span className="text-xl font-bold text-gray-900">
                Medi<span className="text-emerald-600">Connect</span>
              </span>
              <span className="text-xs text-black
">
                Smart Healthcare Platform
              </span>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">

            {/* 🔔 Notifications */}
            {user && (
              <button
                onClick={() => navigate("/notifications")}
                className="relative p-2 rounded-full hover:bg-gray-100 transition"
              >
                <Bell className="w-6 h-6 text-gray-700" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 
                                   text-white text-xs rounded-full 
                                   h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* 👤 Profile */}
            {user ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2"
                >
                  <UserCircle className="w-9 h-9 text-emerald-600" />
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white 
                                  rounded-xl shadow-lg border">
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
                      className="flex items-center gap-2 w-full 
                                 px-4 py-3 text-blue-600 hover:bg-blue-50"
                    >
                      <KeyRound className="w-4 h-4" />
                      Reset Password
                    </button>

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full 
                                 px-4 py-3 text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex gap-3">
                <button
                  onClick={() => navigate("/login")}
                  className="flex items-center gap-2 px-5 py-2 
                             rounded-lg bg-emerald-600 text-white 
                             hover:bg-emerald-700"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </button>

                <Link
                  to="/signup"
                  className="flex items-center gap-2 px-5 py-2 
                             rounded-lg border border-emerald-300 
                             text-emerald-700 hover:bg-emerald-50"
                >
                  <UserPlus className="w-4 h-4" />
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
