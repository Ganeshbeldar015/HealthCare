import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../utils/firebase';
import { useAuth } from '../utils/useAuth';

function TopPanel() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const profileMenuRef = useRef(null);

  /* 🔐 Logout */
  const handleLogout = async () => {
    await signOut(auth);
    setProfileMenuOpen(false);
    navigate('/login');
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

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="bg-white/80 backdrop-blur-md fixed top-0 inset-x-0 z-50 border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">

          {/* Left: Logo */}
          <div
            onClick={() => navigate('/')}
            className="text-lg font-bold text-gray-800 cursor-pointer hover:text-purple-600 transition"
          >
            🚀 Home 
          </div>

          {/* Right: User icon and text, flush right */}
          <div className="flex items-center flex-shrink-0 justify-end">
            <div className="flex items-center gap-3">

              {/* ✅ Logged-in state */}
              {user ? (
                <div className="relative" ref={profileMenuRef}>
                  {/* Profile Button */}
                  <button
                    onClick={() => setProfileMenuOpen((prev) => !prev)}
                    className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                    aria-label="User profile menu"
                  >
                    <img
                      src="/public/images/user_profile.png"
                      alt="Profile"
                      className="w-9 h-9 rounded-full border-2 border-purple-300 shadow-sm hover:scale-105 transition-transform"
                    />
                  </button>

                  {/* Dropdown */}
                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden animate-fadeIn">
                      <div className="px-4 py-3 text-sm border-b border-gray-100">
                        <p className="text-gray-500">Signed in as</p>
                        <p className="font-semibold text-gray-900 break-words">
                          {user.email}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          navigate('/update-password');
                        }}
                        className="w-full px-4 py-3 text-left text-sm font-medium text-blue-600 hover:bg-blue-50 transition"
                      >
                        Reset Password
                      </button>

                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50 transition"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* ❌ Logged-out state */
                <div className="hidden md:flex items-center gap-3">
                  <button
                    onClick={() => navigate('/login')}
                    className="flex items-center gap-2 px-5 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 shadow transition"
                  >
                    Login
                  </button>

                  <Link
                    to="/signup"
                    className="px-5 py-2 rounded-lg border border-purple-300 text-purple-700 font-medium hover:bg-purple-50 transition"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* 📱 Mobile menu button */}
              <button
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
              >
                <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                  <span
                    className={`block h-0.5 w-6 bg-gray-700 transition-transform ${
                      menuOpen ? 'rotate-45 translate-y-1' : ''
                    }`}
                  ></span>
                  <span
                    className={`block h-0.5 w-6 bg-gray-700 transition-opacity ${
                      menuOpen ? 'opacity-0' : ''
                    }`}
                  ></span>
                  <span
                    className={`block h-0.5 w-6 bg-gray-700 transition-transform ${
                      menuOpen ? '-rotate-45 -translate-y-1' : ''
                    }`}
                  ></span>
                </div>
              </button>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TopPanel;
