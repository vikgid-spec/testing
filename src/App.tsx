import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Dashboard from './components/Dashboard';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import { User } from '@supabase/supabase-js';

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'login' | 'signup' | 'dashboard'>('home');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setCurrentPage('dashboard');
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setCurrentPage('dashboard');
      } else {
        setCurrentPage('home');
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (currentPage === 'login') {
    return <LoginPage onBack={() => setCurrentPage('home')} onSignup={() => setCurrentPage('signup')} />;
  }

  if (currentPage === 'signup') {
    return <SignupPage onBack={() => setCurrentPage('home')} onLogin={() => setCurrentPage('login')} />;
  }

  if (currentPage === 'dashboard' && user) {
    return <Dashboard user={user} onLogout={() => setCurrentPage('home')} />;
  }

  // Home page
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md border border-white/20 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Task Manager</h1>
          <p className="text-white/80">Organize your tasks efficiently</p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={() => setCurrentPage('login')}
            className="w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/30"
          >
            Login
          </button>
          
          <button
            onClick={() => setCurrentPage('signup')}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
          >
            Sign Up
          </button>
          
          {user && (
            <button
              onClick={() => setCurrentPage('dashboard')}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
            >
              Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;