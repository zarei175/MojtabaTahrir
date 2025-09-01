import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface AuthRequest {
  action: 'login' | 'register' | 'logout' | 'verify' | 'refresh';
  email?: string;
  password?: string;
  name?: string;
  phone?: string;
  user_type?: 'b2b' | 'b2c';
  refresh_token?: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user?: any;
    session?: any;
    access_token?: string;
    refresh_token?: string;
  };
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AuthResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'فقط درخواست POST مجاز است'
    });
  }

  try {
    const { action, email, password, name, phone, user_type, refresh_token }: AuthRequest = req.body;

    switch (action) {
      case 'register':
        if (!email || !password || !name) {
          return res.status(400).json({
            success: false,
            message: 'ایمیل، رمز عبور و نام الزامی است'
          });
        }

        // ثبت نام در Supabase
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              phone: phone || '',
              user_type: user_type || 'b2c'
            }
          }
        });

        if (signUpError) {
          return res.status(400).json({
            success: false,
            message: 'خطا در ثبت نام',
            error: signUpError.message
          });
        }

        // ایجاد پروفایل کاربر در جدول profiles
        if (signUpData.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: signUpData.user.id,
              email,
              name,
              phone: phone || '',
              user_type: user_type || 'b2c',
              is_active: true,
              created_at: new Date().toISOString()
            });

          if (profileError) {
            console.error('خطا در ایجاد پروفایل:', profileError);
          }
        }

        return res.status(201).json({
          success: true,
          message: 'ثبت نام با موفقیت انجام شد. لطفاً ایمیل خود را تأیید کنید.',
          data: {
            user: signUpData.user,
            session: signUpData.session
          }
        });

      case 'login':
        if (!email || !password) {
          return res.status(400).json({
            success: false,
            message: 'ایمیل و رمز عبور الزامی است'
          });
        }

        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) {
          return res.status(401).json({
            success: false,
            message: 'ایمیل یا رمز عبور اشتباه است',
            error: signInError.message
          });
        }

        // دریافت اطلاعات پروفایل کاربر
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', signInData.user.id)
          .single();

        return res.status(200).json({
          success: true,
          message: 'ورود با موفقیت انجام شد',
          data: {
            user: {
              ...signInData.user,
              profile
            },
            session: signInData.session,
            access_token: signInData.session?.access_token,
            refresh_token: signInData.session?.refresh_token
          }
        });

      case 'logout':
        const { error: signOutError } = await supabase.auth.signOut();

        if (signOutError) {
          return res.status(400).json({
            success: false,
            message: 'خطا در خروج از حساب کاربری',
            error: signOutError.message
          });
        }

        return res.status(200).json({
          success: true,
          message: 'خروج با موفقیت انجام شد'
        });

      case 'refresh':
        if (!refresh_token) {
          return res.status(400).json({
            success: false,
            message: 'توکن تازه‌سازی الزامی است'
          });
        }

        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession({
          refresh_token
        });

        if (refreshError) {
          return res.status(401).json({
            success: false,
            message: 'خطا در تازه‌سازی نشست',
            error: refreshError.message
          });
        }

        return res.status(200).json({
          success: true,
          message: 'نشست با موفقیت تازه‌سازی شد',
          data: {
            session: refreshData.session,
            access_token: refreshData.session?.access_token,
            refresh_token: refreshData.session?.refresh_token
          }
        });

      case 'verify':
        // بررسی وضعیت کاربر فعلی
        const authHeader = req.headers.authorization;
        if (!authHeader) {
          return res.status(401).json({
            success: false,
            message: 'توکن احراز هویت یافت نشد'
          });
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: userData, error: userError } = await supabase.auth.getUser(token);

        if (userError || !userData.user) {
          return res.status(401).json({
            success: false,
            message: 'توکن نامعتبر است',
            error: userError?.message
          });
        }

        return res.status(200).json({
          success: true,
          message: 'کاربر معتبر است',
          data: {
            user: userData.user
          }
        });

      default:
        return res.status(400).json({
          success: false,
          message: 'عملیات نامعتبر'
        });
    }
  } catch (error) {
    console.error('خطا در API احراز هویت:', error);
    return res.status(500).json({
      success: false,
      message: 'خطای داخلی سرور',
      error: error instanceof Error ? error.message : 'خطای نامشخص'
    });
  }
}