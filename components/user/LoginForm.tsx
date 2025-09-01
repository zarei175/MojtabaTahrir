'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { EyeIcon, EyeSlashIcon, UserIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { supabase } from '../../lib/supabase';

interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
  className?: string;
}

interface LoginFormData {
  email: string;
  password: string;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  redirectTo = '/',
  className = ''
}) => {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.email.trim()) {
      setError('ایمیل الزامی است');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('فرمت ایمیل صحیح نیست');
      return false;
    }
    if (!formData.password.trim()) {
      setError('رمز عبور الزامی است');
      return false;
    }
    if (formData.password.length < 6) {
      setError('رمز عبور باید حداقل ۶ کاراکتر باشد');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        throw authError;
      }

      if (data.user) {
        // Success callback
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(redirectTo);
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Handle specific error messages
      if (err.message.includes('Invalid login credentials')) {
        setError('ایمیل یا رمز عبور اشتباه است');
      } else if (err.message.includes('Email not confirmed')) {
        setError('لطفاً ابتدا ایمیل خود را تأیید کنید');
      } else {
        setError('خطا در ورود به سیستم. لطفاً دوباره تلاش کنید');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <UserIcon className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">ورود به حساب کاربری</h2>
          <p className="text-gray-600">به فروشگاه مجتبی تحریر خوش آمدید</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              ایمیل
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="example@email.com"
                disabled={isLoading}
                dir="ltr"
              />
              <UserIcon className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              رمز عبور
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 pr-12 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="رمز عبور خود را وارد کنید"
                disabled={isLoading}
              />
              <LockClosedIcon className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="text-left">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
            >
              رمز عبور را فراموش کرده‌اید؟
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white ml-2"></div>
                در حال ورود...
              </div>
            ) : (
              'ورود'
            )}
          </button>
        </form>

        {/* Register Link */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            حساب کاربری ندارید؟{' '}
            <Link
              href="/auth/register"
              className="text-blue-600 hover:text-blue-500 font-medium transition-colors"
            >
              ثبت نام کنید
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;