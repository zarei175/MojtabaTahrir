'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import {
  Bars3Icon,
  XMarkIcon,
  ShoppingCartIcon,
  UserIcon,
  HeartIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  UserPlusIcon,
  Cog6ToothIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import SearchBar from './SearchBar';
import Navigation from './Navigation';
import { Category } from '../../types';
import { supabase } from '../../lib/supabase';

interface HeaderProps {
  categories?: Category[];
}

const Header: React.FC<HeaderProps> = ({ categories = [] }) => {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { items: cartItems, totalItems } = useCart();
  const { items: wishlistItems } = useWishlist();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    const handleRouteChange = () => {
      setIsMobileMenuOpen(false);
      setIsUserMenuOpen(false);
    };

    router.events?.on('routeChangeStart', handleRouteChange);
    return () => router.events?.off('routeChangeStart', handleRouteChange);
  }, [router.events]);

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsUserMenuOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  return (
    <header className={`sticky top-0 z-50 bg-white transition-shadow duration-200 ${
      isScrolled ? 'shadow-md' : 'shadow-sm'
    }`}>
      {/* Top Bar - Contact Info */}
      <div className="hidden lg:block bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-2 text-sm">
            <div className="flex items-center space-x-6 space-x-reverse text-gray-600">
              <div className="flex items-center space-x-2 space-x-reverse">
                <PhoneIcon className="w-4 h-4" />
                <span>021-12345678</span>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <EnvelopeIcon className="w-4 h-4" />
                <span>info@mojtabatahrir.com</span>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <MapPinIcon className="w-4 h-4" />
                <span>تهران، خیابان انقلاب</span>
              </div>
            </div>
            <div className="flex items-center space-x-4 space-x-reverse text-gray-600">
              <span>ساعات کاری: شنبه تا پنج‌شنبه ۸:۰۰ - ۱۸:۰۰</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="منوی موبایل"
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 space-x-reverse">
            <Image
              src="/images/logo.png"
              alt="مجتبی تحریر"
              width={48}
              height={48}
              className="w-12 h-12"
              priority
            />
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900">مجتبی تحریر</h1>
              <p className="text-sm text-gray-500">فروشگاه لوازم التحریر</p>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:block flex-1 max-w-2xl mx-8">
            <SearchBar />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4 space-x-reverse">
            {/* Search Button - Mobile */}
            <button
              onClick={() => router.push('/search')}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="جستجو"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="علاقه‌مندی‌ها"
            >
              <HeartIcon className="w-6 h-6" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-error-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Shopping Cart */}
            <Link
              href="/cart"
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="سبد خرید"
            >
              <ShoppingCartIcon className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* User Menu */}
            <div className="relative">
              {user ? (
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-2 space-x-reverse p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="منوی کاربری"
                >
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    {user.user_metadata?.avatar_url ? (
                      <Image
                        src={user.user_metadata.avatar_url}
                        alt={user.user_metadata?.full_name || 'کاربر'}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <UserIcon className="w-5 h-5 text-primary-600" />
                    )}
                  </div>
                  <div className="hidden md:block text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {user.user_metadata?.full_name || 'کاربر'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user.user_metadata?.user_type === 'b2b' ? 'مشتری عمده' : 'مشتری'}
                    </p>
                  </div>
                  <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                </button>
              ) : (
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Link
                    href="/auth/login"
                    className="hidden sm:flex items-center space-x-1 space-x-reverse px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4" />
                    <span>ورود</span>
                  </Link>
                  <Link
                    href="/auth/register"
                    className="flex items-center space-x-1 space-x-reverse px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <UserPlusIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">ثبت‌نام</span>
                  </Link>
                </div>
              )}

              {/* User Dropdown Menu */}
              {user && isUserMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="font-medium text-gray-900">
                      {user.user_metadata?.full_name || 'کاربر'}
                    </p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    {user.user_metadata?.user_type === 'b2b' && (
                      <span className="inline-block mt-1 px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full">
                        مشتری عمده
                      </span>
                    )}
                  </div>
                  
                  <div className="py-2">
                    <Link
                      href="/profile"
                      className="flex items-center space-x-3 space-x-reverse px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <UserIcon className="w-4 h-4" />
                      <span>پروفایل من</span>
                    </Link>
                    
                    <Link
                      href="/orders"
                      className="flex items-center space-x-3 space-x-reverse px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <ClipboardDocumentListIcon className="w-4 h-4" />
                      <span>سفارشات من</span>
                    </Link>
                    
                    <Link
                      href="/wishlist"
                      className="flex items-center space-x-3 space-x-reverse px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <HeartIcon className="w-4 h-4" />
                      <span>علاقه‌مندی‌ها</span>
                      {wishlistItems.length > 0 && (
                        <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                          {wishlistItems.length}
                        </span>
                      )}
                    </Link>
                    
                    <Link
                      href="/settings"
                      className="flex items-center space-x-3 space-x-reverse px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Cog6ToothIcon className="w-4 h-4" />
                      <span>تنظیمات</span>
                    </Link>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-2">
                    <button
                      onClick={handleSignOut}
                      className="flex items-center space-x-3 space-x-reverse w-full px-4 py-2 text-sm text-error-600 hover:bg-error-50 transition-colors"
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4" />
                      <span>خروج از حساب</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search Bar - Mobile */}
        <div className="lg:hidden pb-4">
          <SearchBar />
        </div>
      </div>

      {/* Navigation - Desktop */}
      <Navigation categories={categories} />

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={toggleMobileMenu} />
          
          <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">منو</h2>
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="overflow-y-auto h-full pb-20">
              {/* User Section */}
              <div className="p-4 border-b border-gray-200">
                {user ? (
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      {user.user_metadata?.avatar_url ? (
                        <Image
                          src={user.user_metadata.avatar_url}
                          alt={user.user_metadata?.full_name || 'کاربر'}
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-full"
                        />
                      ) : (
                        <UserIcon className="w-6 h-6 text-primary-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {user.user_metadata?.full_name || 'کاربر'}
                      </p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      href="/auth/login"
                      className="block w-full text-center py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={toggleMobileMenu}
                    >
                      ورود به حساب
                    </Link>
                    <Link
                      href="/auth/register"
                      className="block w-full text-center py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                      onClick={toggleMobileMenu}
                    >
                      ثبت‌نام
                    </Link>
                  </div>
                )}
              </div>

              {/* Navigation Links */}
              <div className="py-4">
                <Link
                  href="/"
                  className="block px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={toggleMobileMenu}
                >
                  صفحه اصلی
                </Link>
                
                <Link
                  href="/products"
                  className="block px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={toggleMobileMenu}
                >
                  همه محصولات
                </Link>

                {/* Categories */}
                {categories.filter(cat => !cat.parent_id).map((category) => (
                  <div key={category.id}>
                    <Link
                      href={`/products/category/${category.slug}`}
                      className="block px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={toggleMobileMenu}
                    >
                      {category.name}
                    </Link>
                    
                    {/* Sub Categories */}
                    {categories
                      .filter(cat => cat.parent_id === category.id)
                      .map((subCategory) => (
                        <Link
                          key={subCategory.id}
                          href={`/products/category/${subCategory.slug}`}
                          className="block px-8 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                          onClick={toggleMobileMenu}
                        >
                          {subCategory.name}
                        </Link>
                      ))}
                  </div>
                ))}

                <Link
                  href="/quick-order"
                  className="block px-4 py-3 text-primary-600 font-medium hover:bg-primary-50 transition-colors"
                  onClick={toggleMobileMenu}
                >
                  سفارش سریع
                </Link>

                <Link
                  href="/offers"
                  className="block px-4 py-3 text-error-600 font-medium hover:bg-error-50 transition-colors"
                  onClick={toggleMobileMenu}
                >
                  🔥 پیشنهادات ویژه
                </Link>

                <Link
                  href="/about"
                  className="block px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={toggleMobileMenu}
                >
                  درباره ما
                </Link>

                <Link
                  href="/contact"
                  className="block px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={toggleMobileMenu}
                >
                  تماس با ما
                </Link>
              </div>

              {/* User Menu Items */}
              {user && (
                <div className="border-t border-gray-200 py-4">
                  <Link
                    href="/profile"
                    className="block px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={toggleMobileMenu}
                  >
                    پروفایل من
                  </Link>
                  
                  <Link
                    href="/orders"
                    className="block px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={toggleMobileMenu}
                  >
                    سفارشات من
                  </Link>
                  
                  <Link
                    href="/wishlist"
                    className="flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={toggleMobileMenu}
                  >
                    <span>علاقه‌مندی‌ها</span>
                    {wishlistItems.length > 0 && (
                      <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                        {wishlistItems.length}
                      </span>
                    )}
                  </Link>
                  
                  <Link
                    href="/settings"
                    className="block px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={toggleMobileMenu}
                  >
                    تنظیمات
                  </Link>
                  
                  <button
                    onClick={() => {
                      handleSignOut();
                      toggleMobileMenu();
                    }}
                    className="block w-full text-right px-4 py-3 text-error-600 hover:bg-error-50 transition-colors"
                  >
                    خروج از حساب
                  </button>
                </div>
              )}

              {/* Contact Info */}
              <div className="border-t border-gray-200 p-4 space-y-3">
                <div className="flex items-center space-x-3 space-x-reverse text-sm text-gray-600">
                  <PhoneIcon className="w-4 h-4" />
                  <span>021-12345678</span>
                </div>
                <div className="flex items-center space-x-3 space-x-reverse text-sm text-gray-600">
                  <EnvelopeIcon className="w-4 h-4" />
                  <span>info@mojtabatahrir.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close user menu */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;