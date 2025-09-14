import React, { useState } from 'react';
import { ArrowLeft, Loader2, Mail } from 'lucide-react';
import { authHelpers } from '../lib/supabase';

interface SignupPageProps {
  onBack: () => void;
  onSignupSuccess: () => void;
}

function SignupPage({ onBack, onSignupSuccess }: SignupPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await authHelpers.signUp(email, password, name);
      
      if (error) {
        setError(error.message);
      } else if (data.user) {
        setSuccess(true);
        // Auto-login after successful signup
        setTimeout(() => {
          onSignupSuccess();
        }, 2000);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    setError(null);

    try {
      const { error } = await authHelpers.signInWithGoogle();
      
      if (error) {
        setError(error.message);
        setGoogleLoading(false);
      }
      // If successful, the redirect will handle the rest
    } catch (err) {
      setError('An unexpected error occurred with Google sign-up');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-300 to-white flex items-center justify-center px-4 py-8 font-['Open_Sans']">
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-blue-200/10 to-transparent animate-pulse"></div>
      
      {/* Back button */}
      <button
        onClick={onBack}
        className="absolute top-6 left-6 flex items-center gap-2 text-white/80 hover:text-white transition-colors duration-200"
      >
        <ArrowLeft size={20} />
        <span className="text-sm font-medium">Back to Home</span>
      </button>

      {/* Main content container */}
      <div className="relative z-10 w-full max-w-md mx-auto">
        {/* Signup form card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 md:p-10">
          {/* Heading */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center">
            Create Account
          </h1>
          
          {/* Signup form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Google Sign Up Button */}
            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={loading || googleLoading || success}
              className="w-full py-4 bg-white border-2 border-gray-300 text-gray-700 font-semibold text-lg rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 ease-in-out hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
            >
              {googleLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              {googleLoading ? 'Creating account with Google...' : 'Continue with Google'}
            </button>
            
            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or create account with email</span>
              </div>
            </div>
            
            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            {/* Success message */}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                Account created successfully! Redirecting to dashboard...
              </div>
            )}
            
            {/* Name field */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-200 text-gray-800 placeholder-gray-400"
                placeholder="Enter your full name"
                disabled={loading || success}
                required
              />
            </div>
            
            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-200 text-gray-800 placeholder-gray-400"
                placeholder="Enter your email"
                disabled={loading || success}
                required
              />
            </div>
            
            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-200 text-gray-800 placeholder-gray-400"
                placeholder="Create a secure password"
                disabled={loading || success}
                required
              />
            </div>
            
            {/* Signup button */}
            <button
              type="submit"
              disabled={loading || googleLoading || success}
              className="w-full py-4 bg-blue-600 text-white font-semibold text-lg rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 ease-in-out hover:bg-blue-700 mt-8 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              <Mail size={20} />
              {loading && <Loader2 size={20} className="animate-spin" />}
              {loading ? 'Creating Account...' : success ? 'Account Created!' : 'Create Account with Email'}
            </button>
          </form>
          
          {/* Additional options */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200">
                Login here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;