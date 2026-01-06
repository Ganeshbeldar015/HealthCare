import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../utils/firebase";
import { useNavigate } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { Activity, LogIn } from "lucide-react";
import { motion } from "framer-motion";
import BackToWelcome from "../components/BackToWelcome";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../utils/firebase";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const navigate = useNavigate();

  const handleLogin = async () => {
    setMessage({ text: "", type: "" });

    if (!email || !password) {
      return setMessage({
        text: "Email and password are required.",
        type: "error",
      });
    }

    setLoading(true);

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;

      // 🔍 Check role from users collection
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        throw new Error("User role not found");
      }

      const { role } = userSnap.data();

      // 🎯 Role-based redirect
      if (role === "patient") {
        navigate("/dashboard");
      } else if (role === "doctor") {
        navigate("/doctor-dashboard");
      } else if (role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }

    } catch (error) {
      setMessage({
        text: error.message || "Login failed.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl"></div>
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="relative z-10 w-full max-w-md">
        <BackToWelcome className="absolute top-6 left-6" />
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="bg-emerald-600 p-2 rounded-xl text-white shadow-lg">
              <Activity size={24} />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-cyan-600 bg-clip-text text-transparent">
              MediConnect
            </span>
          </div>
          <h2 className="text-3xl font-black text-slate-900">
            Welcome Back
          </h2>
          <p className="text-slate-600 mt-1">
            Sign in to your account
          </p>
        </motion.div>


        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/60 p-8"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            className="space-y-6"
          >
            {message.text && (
              <div
                className={`px-4 py-3 rounded-xl text-sm font-medium ${message.type === "error"
                  ? "bg-red-50 text-red-700 border-2 border-red-200"
                  : "bg-emerald-50 text-emerald-700 border-2 border-emerald-200"
                  }`}
              >
                {message.text}
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none bg-white/50"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3.5 pr-12 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none bg-white/50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-4 rounded-xl font-bold shadow-lg hover:scale-[1.02] transition"
            >
              {loading ? "Signing in..." : (
                <span className="flex items-center justify-center gap-2">
                  <LogIn size={18} />
                  Sign In
                </span>
              )}
            </button>

            <p className="text-center text-sm text-slate-600">
              Don’t have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="text-emerald-600 font-semibold hover:underline"
              >
                Create account
              </button>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default Login;
