import { supabase } from './supabase'
import { User, Session } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  email: string
  full_name?: string
  phone?: string
  user_type: 'b2b' | 'b2c'
  is_verified: boolean
  created_at: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  full_name: string
  phone?: string
  user_type: 'b2b' | 'b2c'
}

// ورود کاربر
export const signIn = async (credentials: LoginCredentials) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password
    })

    if (error) throw error

    return {
      success: true,
      user: data.user,
      session: data.session
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'خطا در ورود به سیستم'
    }
  }
}

// ثبت نام کاربر جدید
export const signUp = async (userData: RegisterData) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          full_name: userData.full_name,
          phone: userData.phone,
          user_type: userData.user_type
        }
      }
    })

    if (error) throw error

    // ایجاد پروفایل کاربر در جدول users
    if (data.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: userData.email,
          full_name: userData.full_name,
          phone: userData.phone,
          user_type: userData.user_type,
          is_verified: false
        })

      if (profileError) {
        console.error('خطا در ایجاد پروفایل:', profileError)
      }
    }

    return {
      success: true,
      user: data.user,
      session: data.session
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'خطا در ثبت نام'
    }
  }
}

// خروج از سیستم
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error

    return { success: true }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'خطا در خروج از سیستم'
    }
  }
}

// دریافت اطلاعات کاربر فعلی
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return null

    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) throw error

    return profile as AuthUser
  } catch (error) {
    console.error('خطا در دریافت اطلاعات کاربر:', error)
    return null
  }
}

// بروزرسانی پروفایل کاربر
export const updateProfile = async (userId: string, updates: Partial<AuthUser>) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error

    return {
      success: true,
      user: data
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'خطا در بروزرسانی پروفایل'
    }
  }
}

// تغییر رمز عبور
export const changePassword = async (newPassword: string) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'خطا در تغییر رمز عبور'
    }
  }
}

// بازیابی رمز عبور
export const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'خطا در ارسال ایمیل بازیابی'
    }
  }
}

// بررسی وضعیت احراز هویت
export const getAuthState = () => {
  return supabase.auth.onAuthStateChange((event, session) => {
    return { event, session }
  })
}