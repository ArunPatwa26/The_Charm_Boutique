import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import {
  UserPlusIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

const Register = () => {
  const { loginWithGoogle, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  // ============================================
  // GOOGLE SIGN-UP
  // ============================================
  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    try {
      const success = await loginWithGoogle(credentialResponse.credential);
      if (success) {
        navigate('/');
      }
    } catch (err) {
      console.error('Google sign-up error:', err);
      setError(
        typeof err?.message === 'string'
          ? err.message
          : 'Google sign-up failed. Please try again.'
      );
    }
  };

  const handleGoogleError = () => {
    setError('Google Sign-Up was unsuccessful. Please try again.');
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
          <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlusIcon className="w-8 h-8 text-gold-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
          <p className="mt-2 text-gray-600">
            Join The Charm Boutique in one click
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
            <span>{typeof error === 'string' ? error : 'Sign-up failed'}</span>
          </motion.div>
        )}

        {/* Google Sign-Up */}
        <div className="flex flex-col items-center gap-4 pt-2">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-4">
              <LoadingSpinner size="sm" />
              <span className="text-sm text-gray-600">Creating account...</span>
            </div>
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="outline"
              size="large"
              text="signup_with"
              shape="rectangular"
              width="320"
            />
          )}

          <p className="text-xs text-gray-500 text-center">
            Sign up securely with your Google account. No passwords to
            remember.
          </p>
        </div>

        {/* Login link */}
        <div className="text-center pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-gold-600 hover:text-gold-700 font-semibold"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Terms */}
        <p className="text-xs text-gray-400 text-center">
          By creating an account, you agree to our{' '}
          <Link to="/terms" className="text-gold-600 hover:text-gold-700">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="text-gold-600 hover:text-gold-700">
            Privacy Policy
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;