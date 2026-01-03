import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const UpdatePassword = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true); // verifying token
  const [processing, setProcessing] = useState(false); // updating password
  const [sessionSet, setSessionSet] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        // Read tokens from URL hash (fragment)
        const hash = window.location.hash || '';
        const params = new URLSearchParams(hash.replace('#', ''));
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        // Debug: Log the URL and tokens (remove in production)
        console.log('Current URL:', window.location.href);
        console.log('Hash:', hash);
        console.log('Access token present:', !!accessToken);
        console.log('Refresh token present:', !!refreshToken);

        if (!accessToken || !refreshToken) {
          setMessage('Invalid or missing token in URL. Please use the link from your email or request a new one.');
          setLoading(false);
          setSessionSet(false);
          return;
        }

        // Set session before letting user proceed
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          setMessage('Session could not be verified. The reset link may be expired or invalid. Please request a new one.');
          setSessionSet(false);
        } else {
          setSessionSet(true);
          setMessage('Session verified. You may now set your new password.');
        }

        // Remove tokens from address bar for security
        try {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        } catch (e) {
          // ignore if not supported
        }
      } catch (err) {
        setMessage('An unexpected error occurred. Please try again.');
        setSessionSet(false);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const handleUpdate = async () => {
    setMessage('');
    if (!newPassword || !confirmPassword) {
      setMessage('Please fill in both password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage('❌ Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setMessage('Password should be at least 6 characters.');
      return;
    }
    if (!sessionSet) {
      setMessage('No valid session. Please use the reset link from your email.');
      return;
    }

    setProcessing(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setMessage('❌ Failed to update password: ' + (error.message || 'Unknown error'));
      } else {
        setMessage('✅ Password updated successfully. Redirecting to login...');
        setTimeout(() => navigate('/login'), 1800);
      }
    } catch (err) {
      setMessage('❌ Unexpected error occurred. Try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-100 px-4 py-8">
      <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-xl shadow-lg">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-blue-700 text-center">
          🔐 Set New Password
        </h2>

        {loading ? (
          <p className="text-center text-gray-500">Verifying reset link...</p>
        ) : (
          <>
            {!sessionSet && (
              <p className="mb-4 text-center text-red-600">{message}</p>
            )}

            {sessionSet && (
              <>
                <div className="relative mb-4">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(s => !s)}
                    className="absolute top-3 right-3 text-gray-600"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <div className="relative mb-4">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    autoComplete="new-password"
                  />
                </div>

                <button
                  onClick={handleUpdate}
                  disabled={processing}
                  className={`w-full py-3 rounded-md font-medium text-white transition ${
                    processing
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {processing ? 'Updating...' : 'Update Password'}
                </button>

                {message && (
                  <p className="mt-4 text-center text-sm text-gray-700">
                    {message}
                  </p>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UpdatePassword;
