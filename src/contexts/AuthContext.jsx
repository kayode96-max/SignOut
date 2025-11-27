import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, database } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [studentProfile, setStudentProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        console.log('Getting initial auth session...')
        
        // Add timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
          console.warn('Auth session loading timeout')
          setLoading(false)
        }, 8000)
        
        const { data: { session } } = await supabase.auth.getSession()
        clearTimeout(timeoutId)
        
        console.log('Auth session result:', session ? 'logged in' : 'not logged in')
        
        if (session) {
          setUser(session.user)
          await loadStudentProfile(session.user.id)
        }
      } catch (error) {
        console.error('Error getting session:', error)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          await loadStudentProfile(session.user.id)
        } else {
          setStudentProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const loadStudentProfile = async (userId) => {
    try {
      console.log('Loading student profile for user:', userId)
      
      // Add timeout for profile loading
      const timeoutId = setTimeout(() => {
        console.warn('Student profile loading timeout')
        setStudentProfile(null)
      }, 5000)
      
      const { data, error } = await database.getStudentProfile(userId)
      clearTimeout(timeoutId)
      
      console.log('Student profile result:', { data, error })
      
      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it
        console.log('Creating new student profile...')
        const { data: newProfile } = await database.createStudentProfile({ 
          id: userId, 
          email: user?.email || 'unknown@example.com',
          user_metadata: { full_name: user?.user_metadata?.full_name || 'User' }
        })
        setStudentProfile(newProfile?.[0] || null)
      } else if (!error) {
        setStudentProfile(data)
      } else {
        console.error('Profile loading error:', error)
        setStudentProfile(null)
      }
    } catch (error) {
      console.error('Error loading student profile:', error)
      setStudentProfile(null)
    }
  }

  const signUp = async (email, password, fullName) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signInWithMagicLink = async (email) => {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      })
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (error) {
      return { error }
    }
  }

  const resetPassword = async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  const updateProfile = async (updates) => {
    try {
      if (user) {
        const { data, error } = await database.updateStudentProfile(user.id, updates)
        if (!error && data) {
          setStudentProfile(data[0])
        }
        return { data, error }
      }
    } catch (error) {
      return { data: null, error }
    }
  }

  const value = {
    user,
    studentProfile,
    loading,
    signUp,
    signIn,
    signInWithMagicLink,
    signOut,
    resetPassword,
    updateProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}