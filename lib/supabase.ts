import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

// اطلاعات اتصال به Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// ایجاد کلاینت Supabase با تایپ‌های TypeScript
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// تابع بررسی وضعیت اتصال
export const checkConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('health_check')
      .select('*')
      .limit(1)
    
    return !error
  } catch (error) {
    console.error('خطا در اتصال به Supabase:', error)
    return false
  }
}

// تابع دریافت اطلاعات کاربر فعلی
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  } catch (error) {
    console.error('خطا در دریافت اطلاعات کاربر:', error)
    return null
  }
}

// تابع آپلود فایل
export const uploadFile = async (
  bucket: string,
  path: string,
  file: File
): Promise<string | null> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path)

    return publicUrl
  } catch (error) {
    console.error('خطا در آپلود فایل:', error)
    return null
  }
}

export default supabase