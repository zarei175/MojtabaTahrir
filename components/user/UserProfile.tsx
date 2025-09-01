'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  BuildingOfficeIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  CameraIcon
} from '@heroicons/react/24/outline';
import { supabase } from '../../lib/supabase';

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  user_type: 'individual' | 'business';
  company_name?: string;
  avatar_url?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  created_at: string;
  updated_at: string;
}

interface UserProfileProps {
  className?: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ className = '' }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('کاربر وارد نشده است');
        return;
      }

      const { data, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      setProfile(data);
      setEditData(data);
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError('خطا در بارگذاری اطلاعات کاربری');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          ...editData,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (updateError) {
        throw updateError;
      }

      setProfile({ ...profile, ...editData } as UserProfile);
      setIsEditing(false);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError('خطا در به‌روزرسانی اطلاعات');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData(profile || {});
    setIsEditing(false);
    setError(null);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('user-avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('user-avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id);

      if (updateError) {
        throw updateError;
      }

      setProfile({ ...profile, avatar_url: publicUrl });
    } catch (err: any) {
      console.error('Error uploading avatar:', err);
      setError('خطا در آپلود تصویر');
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={`text-center p-8 ${className}`}>
        <p className="text-gray-600">اطلاعات کاربری یافت نشد</p>
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-l from-blue-600 to-blue-700 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="relative">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-white">
                  {profile.avatar_url ? (
                    <Image
                      src={profile.avatar_url}
                      alt="تصویر پروفایل"
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <UserIcon className="w-10 h-10 text-gray-400" />
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2 cursor-pointer hover:bg-blue-600 transition-colors">
                  <CameraIcon className="w-4 h-4 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="text-white">
                <h1 className="text-2xl font-bold">
                  {profile.first_name} {profile.last_name}
                </h1>
                <p className="text-blue-100">
                  {profile.user_type === 'business' ? 'کاربر حقوقی' : 'کاربر شخصی'}
                </p>
                {profile.company_name && (
                  <p className="text-blue-100 text-sm">{profile.company_name}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center"
                >
                  <PencilIcon className="w-4 h-4 ml-2" />
                  ویرایش
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
                  >
                    <CheckIcon className="w-4 h-4 ml-2" />
                    {isSaving ? 'در حال ذخیره...' : 'ذخیره'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center"
                  >
                    <XMarkIcon className="w-4 h-4 ml-2" />
                    لغو
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-8 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Profile Information */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                اطلاعات شخصی
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نام
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="first_name"
                      value={editData.first_name || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.first_name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نام خانوادگی
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="last_name"
                      value={editData.last_name || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.last_name}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <EnvelopeIcon className="w-4 h-4 inline ml-1" />
                  ایمیل
                </label>
                <p className="text-gray-900" dir="ltr">{profile.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <PhoneIcon className="w-4 h-4 inline ml-1" />
                  شماره تلفن
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={editData.phone || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    dir="ltr"
                  />
                ) : (
                  <p className="text-gray-900" dir="ltr">{profile.phone}</p>
                )}
              </div>

              {profile.user_type === 'business' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <BuildingOfficeIcon className="w-4 h-4 inline ml-1" />
                    نام شرکت
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="company_name"
                      value={editData.company_name || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.company_name}</p>
                  )}
                </div>
              )}
            </div>

            {/* Address Information */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                اطلاعات آدرس
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  آدرس
                </label>
                {isEditing ? (
                  <textarea
                    name="address"
                    value={editData.address || ''}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="آدرس کامل خود را وارد کنید"
                  />
                ) : (
                  <p className="text-gray-900">{profile.address || 'وارد نشده'}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    شهر
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="city"
                      value={editData.city || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.city || 'وارد نشده'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    کد پستی
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="postal_code"
                      value={editData.postal_code || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      dir="ltr"
                    />
                  ) : (
                    <p className="text-gray-900" dir="ltr">{profile.postal_code || 'وارد نشده'}</p>
                  )}
                </div>
              </div>

              {/* Account Information */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-md font-medium text-gray-900 mb-4">اطلاعات حساب</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>تاریخ عضویت: {new Date(profile.created_at).toLocaleDateString('fa-IR')}</p>
                  <p>آخرین به‌روزرسانی: {new Date(profile.updated_at).toLocaleDateString('fa-IR')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;