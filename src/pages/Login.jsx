import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth , db} from '../utils/firebase';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { doc, getDoc } from "firebase/firestore";


function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorEmail, setErrorEmail] = useState('');
  const [errorPassword, setErrorPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [resetStatus, setResetStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = async () => {
    setErrorEmail("");
    setErrorPassword("");
    setLoginError("");
    setIsLoading(true);

    if (!email) {
      setErrorEmail("Email is required.");
      setIsLoading(false);
      return;
    }

    if (!isValidEmail(email)) {
      setErrorEmail("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }

    if (!password) {
      setErrorPassword("Password is required.");
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      if (!user.emailVerified) {
        setLoginError("Please verify your email before logging in.");
        setIsLoading(false);
        return;
      }

      // 🔥 Fetch user role
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        setLoginError("User profile not found. Contact support.");
        setIsLoading(false);
        return;
      }

      const userData = userSnap.data();

      // 🔁 ROLE-BASED REDIRECTION
      if (userData.role === "patient") {
        if (!userData.profileCompleted) {
          navigate("/patientR");
        } else {
          navigate("/dashboard");
        }
      }

      else if (userData.role === "doctor") {
        const doctorRef = doc(db, "doctors", user.uid);
        const doctorSnap = await getDoc(doctorRef);

        if (!doctorSnap.exists()) {
          navigate("/doctor-form");
          return;
        }

        const doctorStatus = doctorSnap.data().status;

        if (doctorStatus === "approved") {
          navigate("/doctor-dashboard");
        } else {
          navigate("/doctor-waiting");
        }
      }

      else if (userData.role === "admin") {
        navigate("/admin");
      }

      else {
        setLoginError("Invalid user role.");
      }

    } catch (error) {
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        setLoginError("Invalid email or password. Please try again.");
      } else {
        setLoginError(error.message || "Login failed.");
      }
    } finally {
      setIsLoading(false);
    }
  };


  // Auto-clear reset status
  useEffect(() => {
    if (resetStatus) {
      const timer = setTimeout(() => setResetStatus(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [resetStatus]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 sm:px-6 lg:px-8 py-12">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-6">
            {/* <video
              src="/logo.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="h-16 w-16 rounded-full shadow-lg"
            /> */}
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Health Care APP
            </h1>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-600">Sign in to continue</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            className="space-y-6"
          >
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 rounded-xl border"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errorEmail && (
                <p className="text-red-500 text-sm mt-1">
                  {errorEmail}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-4 py-3 pr-12 rounded-xl border"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-4 -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errorPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errorPassword}
                </p>
              )}
            </div>

            {/* Login Error */}
            {loginError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">
                {loginError}
              </div>
            )}

            {/* Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>

            {/* Signup */}
            <div className="text-center pt-4 border-t">
              <p className="text-sm">
                Don’t have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="text-purple-600 underline"
                >
                  Register yourself first.
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;


