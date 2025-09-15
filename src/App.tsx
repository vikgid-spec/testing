import React, { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase, authHelpers } from './lib/supabase'
import LoginPage from './components/LoginPage'
import SignupPage from './components/SignupPage'
import Dashboard from './components/Dashboard'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState<'home' | 'login' | 'signup' | 'dashboard'>('home')

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      if (session?.user) {
        setCurrentPage('dashboard')
      }
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          setCurrentPage('dashboard')
        } else {
          setCurrentPage('home')
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (currentPage === 'login') {
    return (
      <LoginPage 
        onBack={() => setCurrentPage('home')} 
        onLoginSuccess={() => setCurrentPage('dashboard')}
        onGoToSignup={() => setCurrentPage('signup')}
      />
    )
  }

  if (currentPage === 'signup') {
    return (
      <SignupPage 
        onBack={() => setCurrentPage('home')} 
        onSignupSuccess={() => setCurrentPage('dashboard')}
      />
    )
  }

  if (user && currentPage === 'dashboard') {
    return (
      <Dashboard 
        onLogout={() => {
          setCurrentPage('home')
          setUser(null)
        }} 
        user={user}
      />
    )
  }

  // Home page with 3 options
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-300 to-white flex items-center justify-center px-4 py-8 font-['Open_Sans']">
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-blue-200/10 to-transparent animate-pulse"></div>
      
      {/* Main content container */}
      <div className="relative z-10 w-full max-w-md mx-auto">
        {/* Welcome card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 md:p-10">
          {/* Heading */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center">
            Welcome to Task Manager
          </h1>
          
          {/* Description */}
          <p className="text-gray-600 text-center mb-8">
            Organize your tasks efficiently and boost your productivity
          </p>
          
          {/* Action buttons */}
          <div className="space-y-4">
            {/* Login button */}
            <button
              onClick={() => setCurrentPage('login')}
              className="w-full py-4 bg-blue-600 text-white font-semibold text-lg rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 ease-in-out hover:bg-blue-700"
            >
              Login
            </button>
            
            {/* Signup button */}
            <button
              onClick={() => setCurrentPage('signup')}
              className="w-full py-4 bg-green-600 text-white font-semibold text-lg rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 ease-in-out hover:bg-green-700"
            >
              Sign Up
            </button>
            
            {/* Dashboard button (if user exists) */}
            {user && (
              <button
                onClick={() => setCurrentPage('dashboard')}
                className="w-full py-4 bg-purple-600 text-white font-semibold text-lg rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 ease-in-out hover:bg-purple-700"
              >
                Go to Dashboard
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App