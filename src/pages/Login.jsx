import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorEmail, setErrorEmail] = useState('');
  const [errorPassword, setErrorPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  // const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetStatus, setResetStatus] = useState('');
  // const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setErrorEmail('');
    setErrorPassword('');
    setLoginError('');
    setIsLoading(true);

    if (!email) {
      setErrorEmail('Email is required.');
      setIsLoading(false);
      return;
    } else if (!isValidEmail(email)) {
      setErrorEmail('Please enter a valid email address.');
      setIsLoading(false);
      return;
    }

    if (!password) {
      setErrorPassword('Password is required.');
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error?.message === 'Invalid login credentials') {
        setLoginError('Account not found, please sign up first.');
      } else if (data?.user) {
        navigate('/dashboard');
      } else if (error) {
        setLoginError(error.message || 'Login failed.');
      }
    } catch (error) {
      setLoginError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // const handleResetPassword = async () => {
  //   setResetStatus('');
  //   setIsSending(true);

  //   if (!email) {
  //     setResetStatus('⚠ Please enter your email first.');
  //     setIsSending(false);
  //     return;
  //   }

  //   if (!isValidEmail(email)) {
  //     setResetStatus('⚠ Please enter a valid email address.');
  //     setIsSending(false);
  //     return;
  //   }

  //   try {
  //     const { error } = await supabase.auth.resetPasswordForEmail(email, {
  //       redirectTo: `/update-password`,
  //     });

  //     if (error) {
  //       if (
  //         error.message.toLowerCase().includes('user') ||
  //         error.message.toLowerCase().includes('invalid')
  //       ) {
  //         setResetStatus('❌ Account not found with this email.');
  //       } else {
  //         setResetStatus('❌ Failed to send reset email. Try again.');
  //       }
  //     } else {
  //       setResetStatus('✅ Check your email to reset your password.');
  //     }
  //   } catch (error) {
  //     setResetStatus('❌ An unexpected error occurred. Please try again.');
  //   } finally {
  //     setIsSending(false);
  //   }
  // };

  // Auto-dismiss reset alert
  useEffect(() => {
    if (resetStatus) {
      const timer = setTimeout(() => setResetStatus(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [resetStatus]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 sm:px-6 lg:px-8 py-12">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <video
              src="/logo.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="h-16 w-16 rounded-full shadow-lg"
              aria-label="ProPath Logo"
            />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Lawyer managment app 
            </h1>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-gray-600">Sign in to continue</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-xl bg-white/70 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-describedby={errorEmail ? "email-error" : undefined}
              />
              {errorEmail && (
                <p id="email-error" className="text-red-500 text-sm mt-1 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errorEmail}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-white/70 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-describedby={errorPassword ? "password-error" : undefined}
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
              {errorPassword && (
                <p id="password-error" className="text-red-500 text-sm mt-1 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errorPassword}
                </p>
              )}
            </div>

            {/* Error Message */}
            {loginError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-600 text-sm flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {loginError}
                </p>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </button>

            {/* Forgot Password */}
            {/* <div className="text-center">
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-sm text-purple-600 hover:text-purple-800 underline transition-colors"
              >
                Forgot Password?
              </button>
            </div> */}

            {/* Sign Up */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/signup')}
                  className="text-purple-600 hover:text-purple-800 font-medium underline transition-colors"
                >
                  Sign up here
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {/* {showForgotModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative animate-fade-in-down">
            <button
              aria-label="Close reset password modal"
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => {
                setShowForgotModal(false);
                setResetStatus('');
              }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Reset Your Password</h3>
              <p className="text-gray-600 mb-6">
                Enter your registered email. We'll send you a link to reset your password.
              </p>

              <div className="space-y-4">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <button
                  onClick={handleResetPassword}
                  disabled={!email || isSending}
                  className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSending ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </div>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>

                {resetStatus && (
                  <div
                    className={`px-4 py-3 rounded-xl text-sm ${
                      resetStatus.startsWith('✅')
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {resetStatus}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
}

export default Login;
