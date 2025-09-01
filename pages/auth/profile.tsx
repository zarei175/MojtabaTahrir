import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '../../hooks/useAuth';
import { Layout } from '../../components/layout';
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon,
  BuildingOfficeIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationCircleIcon,
  ShoppingBagIcon,
  HeartIcon,
  CogIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  company?: string;
  taxId?: string;
  address?: string;
  city?: string;
  postalCode?: string;
}

interface TabType {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  count?: number;
}

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const { user, updateProfile, signOut, loading } = useAuth();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    taxId: '',
    address: '',
    city: '',
    postalCode: ''
  });
  const [originalData, setOriginalData] = useState<ProfileData>({} as ProfileData);
  const [errors, setErrors] = useState<Partial<ProfileData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // اگر کاربر وارد نشده باشد، به صفحه ورود هدایت شود
  useEffect(() => {
    if (!user && !loading) {
      router.push('/auth/login?redirect=/auth/profile');
    }
  }, [user, loading, router]);

  // بارگذاری اطلاعات کاربر
  useEffect(() => {
    if (user?.profile) {
      const data = {
        name: user.profile.name || '',
        email: user.email || '',
        phone: user.profile.phone || '',
        company: user.profile.company || '',
        taxId: user.profile.tax_id || '',
        address: user.profile.address || '',
        city: user.profile.city || '',
        postalCode: user.profile.postal_code || ''
      };
      setProfileData(data);
      setOriginalData(data);
    }
  }, [user]);

  const tabs: TabType[] = [
    { id: 'profile', name: 'اطلاعات شخصی', icon: UserIcon },
    { id: 'orders', name: 'سفارشات من', icon: ShoppingBagIcon, count: 5 },
    { id: 'wishlist', name: 'علاقه‌مندی‌ها', icon: HeartIcon, count: 12 },
    { id: 'settings', name: 'تنظیمات', icon: CogIcon }
  ];

  const validateForm = (): boolean => {
    const newErrors: Partial<ProfileData> = {};

    if (!profileData.name.trim()) {
      newErrors.name = 'نام و نام خانوادگی الزامی است';
    }

    if (!profileData.phone) {
      newErrors.phone = 'شماره تلفن الزامی است';
    } else if (!/^09\d{9}$/.test(profileData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'شماره تلفن صحیح نیست';
    }

    if (user?.profile?.user_type === 'b2b' && !profileData.company?.trim()) {
      newErrors.company = 'نام شرکت برای حساب تجاری الزامی است';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError('');
    setSuccessMessage('');

    try {
      await updateProfile({
        name: profileData.name,
        phone: profileData.phone,
        company: profileData.company,
        tax_id: profileData.taxId,
        address: profileData.address,
        city: profileData.city,
        postal_code: profileData.postalCode
      });

      setOriginalData(profileData);
      setIsEditing(false);
      setSuccessMessage('اطلاعات با موفقیت بروزرسانی شد');
      
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (error: any) {
      setSubmitError(error.message || 'خطا در بروزرسانی اطلاعات');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setProfileData(originalData);
    setIsEditing(false);
    setErrors({});
    setSubmitError('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name as keyof ProfileData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('خطا در خروج:', error);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  const renderProfileTab = () => (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">اطلاعات شخصی</h3>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PencilIcon className="h-4 w-4 ml-2" />
            ویرایش
          </button>
        ) : (
          <div className="flex space-x-2 space-x-reverse">
            <button
              onClick={handleSave}
              disabled={isSubmitting}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <CheckIcon className="h-4 w-4 ml-2" />
              {isSubmitting ? 'در حال ذخیره...' : 'ذخیره'}
            </button>
            <button
              onClick={handleCancel}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <XMarkIcon className="h-4 w-4 ml-2" />
              انصراف
            </button>
          </div>
        )}
      </div>

      {/* Messages */}
      {submitError && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
            <div className="mr-3">
              <p className="text-sm text-red-800">{submitError}</p>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <CheckIcon className="h-5 w-5 text-green-400" />
            <div className="mr-3">
              <p className="text-sm text-green-800">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            نام و نام خانوادگی
          </label>
          {isEditing ? (
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="name"
                value={profileData.name}
                onChange={handleInputChange}
                className={`block w-full pr-10 pl-3 py-2 border ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              />
            </div>
          ) : (
            <p className="mt-1 text-sm text-gray-900">{profileData.name || 'تعریف نشده'}</p>
          )}
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ایمیل
          </label>
          <div className="flex items-center">
            <EnvelopeIcon className="h-5 w-5 text-gray-400 ml-2" />
            <p className="text-sm text-gray-900">{profileData.email}</p>
          </div>
          <p className="mt-1 text-xs text-gray-500">ایمیل قابل تغییر نیست</p>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            شماره تلفن
          </label>
          {isEditing ? (
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <PhoneIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                name="phone"
                value={profileData.phone}
                onChange={handleInputChange}
                className={`block w-full pr-10 pl-3 py-2 border ${
                  errors.phone ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                dir="ltr"
              />
            </div>
          ) : (
            <p className="mt-1 text-sm text-gray-900">{profileData.phone || 'تعریف نشده'}</p>
          )}
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>

        {/* User Type Badge */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            نوع حساب
          </label>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            user.profile?.user_type === 'b2b' 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {user.profile?.user_type === 'b2b' ? 'تجاری (B2B)' : 'شخصی (B2C)'}
          </span>
        </div>

        {/* Company (B2B only) */}
        {user.profile?.user_type === 'b2b' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                نام شرکت
              </label>
              {isEditing ? (
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="company"
                    value={profileData.company}
                    onChange={handleInputChange}
                    className={`block w-full pr-10 pl-3 py-2 border ${
                      errors.company ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  />
                </div>
              ) : (
                <p className="mt-1 text-sm text-gray-900">{profileData.company || 'تعریف نشده'}</p>
              )}
              {errors.company && (
                <p className="mt-1 text-sm text-red-600">{errors.company}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                شناسه ملی/اقتصادی
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="taxId"
                  value={profileData.taxId}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  dir="ltr"
                />
              ) : (
                <p className="mt-1 text-sm text-gray-900">{profileData.taxId || 'تعریف نشده'}</p>
              )}
            </div>
          </>
        )}

        {/* Address */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            آدرس
          </label>
          {isEditing ? (
            <input
              type="text"
              name="address"
              value={profileData.address}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="آدرس کامل خود را وارد کنید"
            />
          ) : (
            <p className="mt-1 text-sm text-gray-900">{profileData.address || 'تعریف نشده'}</p>
          )}
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            شهر
          </label>
          {isEditing ? (
            <input
              type="text"
              name="city"
              value={profileData.city}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          ) : (
            <p className="mt-1 text-sm text-gray-900">{profileData.city || 'تعریف نشده'}</p>
          )}
        </div>

        {/* Postal Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            کد پستی
          </label>
          {isEditing ? (
            <input
              type="text"
              name="postalCode"
              value={profileData.postalCode}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              dir="ltr"
            />
          ) : (
            <p className="mt-1 text-sm text-gray-900">{profileData.postalCode || 'تعریف نشده'}</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderOrdersTab = () => (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6">سفارشات من</h3>
      <div className="text-center py-12">
        <ShoppingBagIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">هنوز سفارشی ندارید</h3>
        <p className="mt-1 text-sm text-gray-500">
          شما هنوز هیچ سفارشی ثبت نکرده‌اید. برای شروع خرید به فروشگاه بروید.
        </p>
        <div className="mt-6">
          <button
            onClick={() => router.push('/products')}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            مشاهده محصولات
          </button>
        </div>
      </div>
    </div>
  );

  const renderWishlistTab = () => (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6">علاقه‌مندی‌ها</h3>
      <div className="text-center py-12">
        <HeartIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">لیست علاقه‌مندی‌ها خالی است</h3>
        <p className="mt-1 text-sm text-gray-500">
          محصولات مورد علاقه خود را به این لیست اضافه کنید.
        </p>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6">تنظیمات حساب</h3>
      
      <div className="space-y-6">
        {/* Change Password */}
        <div className="border-b border-gray-200 pb-6">
          <h4 className="text-base font-medium text-gray-900 mb-2">تغییر رمز عبور</h4>
          <p className="text-sm text-gray-500 mb-4">
            برای امنیت بیشتر، رمز عبور خود را به‌طور منظم تغییر دهید.
          </p>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            تغییر رمز عبور
          </button>
        </div>

        {/* Notifications */}
        <div className="border-b border-gray-200 pb-6">
          <h4 className="text-base font-medium text-gray-900 mb-4">اعلان‌ها</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">ایمیل‌های تبلیغاتی</p>
                <p className="text-sm text-gray-500">دریافت اطلاعات محصولات جدید و تخفیف‌ها</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">اعلان‌های سفارش</p>
                <p className="text-sm text-gray-500">اطلاع‌رسانی وضعیت سفارشات</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        {/* Delete Account */}
        <div>
          <h4 className="text-base font-medium text-gray-900 mb-2">حذف حساب کاربری</h4>
          <p className="text-sm text-gray-500 mb-4">
            با حذف حساب کاربری، تمام اطلاعات شما به‌طور دائمی پاک خواهد شد.
          </p>
          <button className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
            حذف حساب کاربری
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <Head>
        <title>پروفایل کاربری - مجتبی تحریر</title>
        <meta name="description" content="مدیریت اطلاعات حساب کاربری" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center">
                      <UserIcon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="mr-4">
                    <h1 className="text-xl font-semibold text-gray-900">
                      {user.profile?.name || 'کاربر'}
                    </h1>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4 ml-2" />
                  خروج
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="px-6">
              <nav className="-mb-px flex space-x-8 space-x-reverse">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="h-5 w-5 ml-2" />
                      {tab.name}
                      {tab.count && (
                        <span className="mr-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'profile' && renderProfileTab()}
            {activeTab === 'orders' && renderOrdersTab()}
            {activeTab === 'wishlist' && renderWishlistTab()}
            {activeTab === 'settings' && renderSettingsTab()}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;