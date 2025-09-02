'use client'

import { useState, useEffect, useContext, createContext, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { 
  signIn, 
  signUp, 
  signOut, 
  getCurrentUser, 
  updateProfile, 
  changePassword, 
  resetPassword,
  getAuthState,
  type AuthUser,
  type LoginCredentials,
  type RegisterData
} from '@/lib/auth'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: AuthUser | null
  session: Session | null
  loading: boolean
  signIn: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>
  signUp: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<{ success: boolean; error?: string }>
  updateProfile: (updates: Partial<AuthUser>) => Promise<{ success: boolean; error?: string }>
  changePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Provider کامپوننت
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // بارگذاری اولیه کاربر
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // دریافت session فعلی
        const { data: { session: currentSession } } = await supabase.auth.getSession()
        setSession(currentSession)

        if (currentSession?.user) {
          // دریافت اطلاعات کامل کاربر
          const userData = await getCurrentUser()
          setUser(userData)
        }
      } catch (error) {
        console.error('خطا در بارگذاری اطلاعات کاربر:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  // گوش دادن به تغییرات احراز هویت
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        
        if (session?.user) {
          const userData = await getCurrentUser()
          setUser(userData)
        } else {
          setUser(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // تابع ورود
  const handleSignIn = async (credentials: LoginCredentials) => {
    setLoading(true)
    try {
      const result = await signIn(credentials)
      
      if (result.success && result.user) {
        const userData = await getCurrentUser()
        setUser(userData)
      }
      
      return result
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'خطا در ورود به سیستم'
      }
    } finally {
      setLoading(false)
    }
  }

  // تابع ثبت نام
  const handleSignUp = async (userData: RegisterData) => {
    setLoading(true)
    try {
      const result = await signUp(userData)
      return result
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'خطا در ثبت نام'
      }
    } finally {
      setLoading(false)
    }
  }

  // تابع خروج
  const handleSignOut = async () => {
    setLoading(true)
    try {
      const result = await signOut()
      
      if (result.success) {
        setUser(null)
        setSession(null)
      }
      
      return result
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'خطا در خروج از سیستم'
      }
    } finally {
      setLoading(false)
    }
  }

  // تابع بروزرسانی پروفایل
  const handleUpdateProfile = async (updates: Partial<AuthUser>) => {
    if (!user) {
      return {
        success: false,
        error: 'کاربر وارد نشده است'
      }
    }

    try {
      const result = await updateProfile(user.id, updates)
      
      if (result.success && result.user) {
        setUser(result.user as AuthUser)
      }
      
      return result
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'خطا در بروزرسانی پروفایل'
      }
    }
  }

  // تابع تغییر رمز عبور
  const handleChangePassword = async (newPassword: string) => {
    try {
      const result = await changePassword(newPassword)
      return result
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'خطا در تغییر رمز عبور'
      }
    }
  }

  // تابع بازیابی رمز عبور
  const handleResetPassword = async (email: string) => {
    try {
      const result = await resetPassword(email)
      return result
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'خطا در ارسال ایمیل بازیابی'
      }
    }
  }

  // تابع بروزرسانی اطلاعات کاربر
  const refreshUser = async () => {
    if (session?.user) {
      const userData = await getCurrentUser()
      setUser(userData)
    }
  }

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    updateProfile: handleUpdateProfile,
    changePassword: handleChangePassword,
    resetPassword: handleResetPassword,
    refreshUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook اصلی
export function useAuth() {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuth باید درون AuthProvider استفاده شود')
  }
  
  return context
}

// Hook ساده برای بررسی وضعیت احراز هویت
export function useAuthState() {
  const { user, loading } = useAuth()
  
  return {
    isAuthenticated: !!user,
    isLoading: loading,
    user,
    userType: user?.user_type || null,
    isB2B: user?.user_type === 'b2b',
    isB2C: user?.user_type === 'b2c',
    isVerified: user?.is_verified || false
  }
}

// Hook برای محافظت از صفحات
export function useRequireAuth(redirectTo = '/auth/login') {
  const { user, loading } = useAuth()
  const [shouldRedirect, setShouldRedirect] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      setShouldRedirect(true)
    }
  }, [user, loading])

  return {
    user,
    loading,
    shouldRedirect,
    redirectTo
  }
}

// Hook برای محافظت بر اساس نوع کاربر
export function useRequireUserType(requiredType: 'b2b' | 'b2c', redirectTo = '/') {
  const { user, loading } = useAuth()
  const [hasAccess, setHasAccess] = useState(false)

  useEffect(() => {
    if (!loading) {
      setHasAccess(!!user && user.user_type === requiredType)
    }
  }, [user, loading, requiredType])

  return {
    hasAccess,
    loading,
    user,
    redirectTo
  }
}