'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon,
  BuildingOfficeIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import { supabase } from '../../lib/supabase';

interface RegisterFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
  className?: string;
}

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  companyName?: string;
  userType: 'individual' | 'business';
  acceptTerms: boolean;
}

const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  redirectTo = '/auth/verify-email',
  className = ''
}) => {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    userType: 'individual',
    acceptTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.firstName.trim()) {
      setError('نام الزامی است');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('نام خانوادگی الزامی است');
      return false;
    }
    if (!formData.email.trim()) {
      setError('ایمیل الزامی است');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('فرمت ایمیل صحیح نیست');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('شماره تلفن الزامی است');
      return false;
    }
    if (!/^09\d{9}$/.test(formData.phone)) {
      setError('شماره تلفن باید با 09 شروع شود و ۱۱ رقم باشد');
      return false;
    }
    if (!formData.password.trim()) {
      setError('رمز عبور الزامی است');
      return false;
    }
    if (formData.password.length < 8) {
      setError('رمز عبور باید حداقل ۸ کاراکتر باشد');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('رمز عبور و تکرار آن یکسان نیستند');
      return false;
    }
    if (formData.userType === 'business' && !formData.companyName?.trim()) {
      setError('نام شرکت برای کاربران حقوقی الزامی است');
      return false;
    }
    if (!formData.acceptTerms) {
      setError('پذیرش قوانین و مقررات الزامی است');
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
      // Register user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
            user_type: formData.userType,
            company_name: formData.companyName || null,
          }
        }
      });

      if (authError) {
        throw authError;
      }

      if (authData.user) {
        // Create user profile in database
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: authData.user.id,
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            user_type: formData.userType,
            company_name: formData.companyName || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Continue anyway as auth was successful
        }

        // Success callback
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(redirectTo);
        }
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      
      // Handle specific error messages
      if (err.message.includes('User already registered')) {
        setError('این ایمیل قبلاً ثبت شده است');
      } else if (err.message.includes('Password should be at least 6 characters')) {
        setError('رمز عبور باید حداقل ۶ کاراکتر باشد');
      } else {
        setError('خطا در ثبت نام. لطفاً دوباره تلاش کنید');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`w-full max-w-lg mx-auto ${className}`}>
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <UserIcon className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">ثبت نام</h2>
          <p className="text-gray-600">حساب کاربری جدید ایجاد کنید</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              نوع کاربری
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="userType"
                  value="individual"
                  checked={formData.userType === 'individual'}
                  onChange={handleInputChange}
                  className="ml-3"
                  disabled={isLoading}
                />
                <div>
                  <div className="font-medium text-gray-900">شخصی</div>
                  <div className="text-sm text-gray-500">خرید شخصی</div>
                </div>
              </label>
              <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="userType"
                  value="business"
                  checked={formData.userType === 'business'}
                  onChange={handleInputChange}
                  className="ml-3"
                  disabled={isLoading}
                />
                <div>
                  <div className="font-medium text-gray-900">حقوقی</div>
                  <div className="text-sm text-gray-500">خرید عمده</div>
                </div>
              </label>
            </div>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                نام
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                placeholder="نام خود را وارد کنید"
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                نام خانوادگی
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                placeholder="نام خانوادگی"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Company Name (for business users) */}
          {formData.userType === 'business' && (
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                نام شرکت
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  placeholder="نام شرکت خود را وارد کنید"
                  disabled={isLoading}
                />
                <BuildingOfficeIcon className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>
          )}

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
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                placeholder="example@email.com"
                disabled={isLoading}
                dir="ltr"
              />
              <EnvelopeIcon className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Phone Field */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              شماره تلفن
            </label>
            <div className="relative">
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                placeholder="09123456789"
                disabled={isLoading}
                dir="ltr"
              />
              <PhoneIcon className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Password Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  className="w-full px-4 py-3 pr-12 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  placeholder="رمز عبور"
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
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                تکرار رمز عبور
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pr-12 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  placeholder="تکرار رمز عبور"
                  disabled={isLoading}
                />
                <LockClosedIcon className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Terms Acceptance */}
          <div className="flex items-start">
            <input
              type="checkbox"
              id="acceptTerms"
              name="acceptTerms"
              checked={formData.acceptTerms}
              onChange={handleInputChange}
              className="mt-1 ml-3"
              disabled={isLoading}
            />
            <label htmlFor="acceptTerms" className="text-sm text-gray-600">
              <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                قوانین و مقررات
              </Link>
              {' '}و{' '}
              <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
                حریم خصوصی
              </Link>
              {' '}را مطالعه کرده و می‌پذیرم
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white ml-2"></div>
                در حال ثبت نام...
              </div>
            ) : (
              'ثبت نام'
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            قبلاً ثبت نام کرده‌اید؟{' '}
            <Link
              href="/auth/login"
              className="text-blue-600 hover:text-blue-500 font-medium transition-colors"
            >
              وارد شوید
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;