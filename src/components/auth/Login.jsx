import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

const Login = () => {
  const { loginWithGoogle, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/';

  // ============================================
  // GOOGLE SIGN-IN
  // ============================================
  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    try {
      const success = await loginWithGoogle(credentialResponse.credential);
      if (success) {
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error('Google login error:', err);
      setError(
        typeof err?.message === 'string'
          ? err.message
          : 'Google login failed. Please try again.'
      );
    }
  };

  const handleGoogleError = () => {
    setError('Google Sign-In was unsuccessful. Please try again.');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-white to-gold-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl shadow-2xl"
      >
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="mt-2 text-gray-600">
            Sign in to continue to The Charm Boutique
          </p>
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex gap-2"
          >
            <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{typeof error === 'string' ? error : 'Login failed'}</span>
          </motion.div>
        )}

        {/* Google Sign-In */}
        <div className="flex flex-col items-center gap-4 pt-2">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-4">
              <LoadingSpinner size="sm" />
              <span className="text-sm text-gray-600">Signing in...</span>
            </div>
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="outline"
              size="large"
              text="signin_with"
              shape="rectangular"
              width="320"
            />
          )}

          <p className="text-xs text-gray-500 text-center">
            We only support Google Sign-In for a faster, more secure
            experience.
          </p>
        </div>

        {/* Register link */}
        <div className="text-center pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            New here?{' '}
            <Link
              to="/register"
              className="text-gold-600 hover:text-gold-700 font-semibold"
            >
              Create an account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;