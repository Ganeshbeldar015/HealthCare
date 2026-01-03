import { useEffect, useState } from 'react';
import {
  verifyPasswordResetCode,
  confirmPasswordReset,
} from 'firebase/auth';
import { auth } from '../utils/firebase';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const UpdatePassword = () => {
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);     // verifying link
  const [processing, setProcessing] = useState(false); // updating password
  const [codeValid, setCodeValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [oobCode, setOobCode] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('oobCode');

        if (!code) {
          setMessage(
            'Invalid or missing reset link. Please request a new password reset.'
          );
          setLoading(false);
          return;
        }

        setOobCode(code);

        // Verify reset code
        await verifyPasswordResetCode(auth, code);

        setCodeValid(true);
        setMessage('Reset link verified. You may now set a new password.');
      } catch (error) {
        setMessage(
          'This reset link is invalid or expired. Please request a new one.'
        );
        setCodeValid(false);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const handleUpdate = async () => {
    setMessage('');

    if (!newPassword || !confirmPassword) {
      return setMessage('Please fill in both password fields.');
    }

    if (newPassword.length < 6) {
      return setMessage('Password must be at least 6 characters.');
    }

    if (newPassword !== confirmPassword) {
      return setMessage('❌ Passwords do not match.');
    }

    if (!codeValid) {
      return setMessage(
        'Reset session is invalid. Please request a new reset link.'
      );
    }

    setProcessing(true);

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);

      setMessage('✅ Password updated successfully. Redirecting to login...');
      setTimeout(() => navigate('/login'), 1800);
    } catch (error) {
      setMessage(
        '❌ Failed to update password. The link may be expired.'
      );
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
          <p className="text-center text-gray-500">
            Verifying reset link...
          </p>
        ) : (
          <>
            {!codeValid && (
              <p className="mb-4 text-center text-red-600">{message}</p>
            )}

            {codeValid && (
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
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute top-3 right-3 text-gray-600"
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
