import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../utils/firebase";
import { useNavigate } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

function DoctorSignup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const navigate = useNavigate();

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSignup = async () => {
    setMessage({ text: "", type: "" });

    if (!email || !password || !confirmPassword) {
      return setMessage({
        text: "All fields are required.",
        type: "error",
      });
    }

    if (!isValidEmail(email)) {
      return setMessage({
        text: "Invalid email format.",
        type: "error",
      });
    }

    if (password.length < 6) {
      return setMessage({
        text: "Password must be at least 6 characters.",
        type: "error",
      });
    }

    if (password !== confirmPassword) {
      return setMessage({
        text: "Passwords do not match.",
        type: "error",
      });
    }

    setLoading(true);

    try {
      // 🔐 Create auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      // 📧 Email verification
      await sendEmailVerification(user);

      // 🔥 USERS collection (role = doctor)
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        role: "doctor",
        profileCompleted: false,
        createdAt: serverTimestamp(),
      });

      // 🩺 DOCTORS collection (status = waiting)
      await setDoc(doc(db, "doctors", user.uid), {
        uid: user.uid,
        email: user.email,
        status: "waiting", // waiting | approved | rejected
        createdAt: serverTimestamp(),
      });

      setMessage({
        text:
          "✅ Doctor account created! Please verify your email. After completing your profile, wait for admin approval.",
        type: "success",
      });

      // Redirect to doctor form
      setTimeout(() => navigate("/doctor-form"), 3000);
    } catch (error) {
      setMessage({
        text: error.message || "Something went wrong.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 py-12">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Doctor Registration
          </h1>
          <p className="text-gray-600 mt-2">
            Register as a healthcare professional
          </p>
        </div>

        {/* Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSignup();
            }}
            className="space-y-6"
          >
            {message.text && (
              <div
                className={`px-4 py-3 rounded-xl text-sm ${
                  message.type === "error"
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-green-50 text-green-700 border border-green-200"
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Email */}
            <input
              type="email"
              placeholder="Email address"
              className="w-full px-4 py-3 rounded-xl border"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full px-4 py-3 pr-12 rounded-xl border"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                className="w-full px-4 py-3 pr-12 rounded-xl border"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-semibold"
            >
              {loading ? "Creating Account..." : "Register as Doctor"}
            </button>

            <p className="text-center text-sm">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-purple-600 underline"
              >
                Sign in
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default DoctorSignup;
