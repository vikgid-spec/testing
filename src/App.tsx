import React, { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase, authHelpers } from './lib/supabase'
import LoginPage from './components/LoginPage'
import SignupPage from './components/SignupPage'
import Dashboard from './components/Dashboard'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState<'login' | 'signup' | 'dashboard'>('login')

  useEffect(() => {
    // Check for existing session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Handle OAuth callback
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      if (hashParams.get('access_token')) {
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname)
        
        // Get the session after OAuth
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setUser(session.user)
          setCurrentPage('dashboard')
        }
      }
    }

    handleOAuthCallback()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (user) {
    return <Dashboard />
  }

  if (currentPage === 'signup') {
    return <SignupPage onSwitchToLogin={() => setCurrentPage('login')} />
  }

  return <LoginPage onSwitchToSignup={() => setCurrentPage('signup')} />
}

export default App