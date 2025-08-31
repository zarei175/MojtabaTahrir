'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  CubeIcon,
  UserIcon,
  ShoppingCartIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import { Category } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';

interface MobileMenuProps {
  categories?: Category[];
}

const MobileMenu: React.FC<MobileMenuProps> = ({ categories = [] }) => {
  const router = useRouter();
  const { user } = useAuth();
  const { totalItems } = useCart();
  const { items: wishlistItems } = useWishlist();
  
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const mainCategories = categories.filter(cat => !cat.parent_id);

  const getSubCategories = (parentId: string) => {
    return categories.filter(cat => cat.parent_id === parentId);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
    setExpandedCategory(null);
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const isActive = (path: string) => {
    return router.pathname === path || router.asPath.startsWith(path);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMenu}
        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="منوی موبایل"
      >
        {isOpen ? (
          <XMarkIcon className="w-6 h-6" />
        ) : (
          <Bars3Icon className="w-6 h-6" />
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMenu}
        />
      )}

      {/* Mobile Menu */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">منو</h2>
            <button
              onClick={closeMenu}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* User Section */}
          <div className="p-4 border-b border-gray-200">
            {user ? (
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-primary-600" />
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
                  onClick={closeMenu}
                >
                  ورود به حساب
                </Link>
                <Link
                  href="/auth/register"
                  className="block w-full text-center py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  onClick={closeMenu}
                >
                  ثبت‌نام
                </Link>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Quick Actions */}
            <div className="p-4 border-b border-gray-200">
              <div className="grid grid-cols-3 gap-3">
                <Link
                  href="/search"
                  className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={closeMenu}
                >
                  <MagnifyingGlassIcon className="w-6 h-6 text-gray-600 mb-1" />
                  <span className="text-xs text-gray-600">جستجو</span>
                </Link>
                
                <Link
                  href="/cart"
                  className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 transition-colors relative"
                  onClick={closeMenu}
                >
                  <ShoppingCartIcon className="w-6 h-6 text-gray-600 mb-1" />
                  <span className="text-xs text-gray-600">سبد خرید</span>
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Link>
                
                <Link
                  href="/wishlist"
                  className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 transition-colors relative"
                  onClick={closeMenu}
                >
                  <HeartIcon className="w-6 h-6 text-gray-600 mb-1" />
                  <span className="text-xs text-gray-600">علاقه‌مندی</span>
                  {wishlistItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-error-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {wishlistItems.length}
                    </span>
                  )}
                </Link>
              </div>
            </div>

            {/* Main Navigation */}
            <div className="py-4">
              <Link
                href="/"
                className={`flex items-center space-x-3 space-x-reverse px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors ${
                  isActive('/') ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600' : ''
                }`}
                onClick={closeMenu}
              >
                <HomeIcon className="w-5 h-5" />
                <span>صفحه اصلی</span>
              </Link>

              <Link
                href="/products"
                className={`flex items-center space-x-3 space-x-reverse px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors ${
                  isActive('/products') && router.pathname === '/products' ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600' : ''
                }`}
                onClick={closeMenu}
              >
                <CubeIcon className="w-5 h-5" />
                <span>همه محصولات</span>
              </Link>

              {/* Categories */}
              <div className="mt-4">
                <div className="px-4 py-2">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    دسته‌بندی محصولات
                  </h3>
                </div>
                
                {mainCategories.map((category) => {
                  const subCategories = getSubCategories(category.id);
                  const hasSubCategories = subCategories.length > 0;
                  const isExpanded = expandedCategory === category.id;

                  return (
                    <div key={category.id}>
                      <div className="flex items-center">
                        <Link
                          href={`/products/category/${category.slug}`}
                          className={`flex-1 flex items-center space-x-3 space-x-reverse px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors ${
                            isActive(`/products/category/${category.slug}`) ? 'bg-primary-50 text-primary-700' : ''
                          }`}
                          onClick={closeMenu}
                        >
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <span>{category.name}</span>
                        </Link>
                        
                        {hasSubCategories && (
                          <button
                            onClick={() => toggleCategory(category.id)}
                            className="p-3 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronUpIcon className="w-4 h-4" />
                            ) : (
                              <ChevronDownIcon className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>

                      {/* Sub Categories */}
                      {hasSubCategories && isExpanded && (
                        <div className="bg-gray-50">
                          {subCategories.map((subCategory) => (
                            <Link
                              key={subCategory.id}
                              href={`/products/category/${subCategory.slug}`}
                              className={`block px-8 py-2 text-sm text-gray-600 hover:bg-gray-100 transition-colors ${
                                isActive(`/products/category/${subCategory.slug}`) ? 'text-primary-700 bg-primary-100' : ''
                              }`}
                              onClick={closeMenu}
                            >
                              {subCategory.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Special Links */}
              <div className="mt-4 border-t border-gray-200 pt-4">
                <Link
                  href="/quick-order"
                  className="flex items-center space-x-3 space-x-reverse px-4 py-3 text-primary-600 font-medium hover:bg-primary-50 transition-colors"
                  onClick={closeMenu}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>سفارش سریع</span>
                </Link>

                <Link
                  href="/offers"
                  className="flex items-center space-x-3 space-x-reverse px-4 py-3 text-error-600 font-medium hover:bg-error-50 transition-colors"
                  onClick={closeMenu}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  </svg>
                  <span>🔥 پیشنهادات ویژه</span>
                </Link>

                <Link
                  href="/about"
                  className="flex items-center space-x-3 space-x-reverse px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={closeMenu}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>درباره ما</span>
                </Link>

                <Link
                  href="/contact"
                  className="flex items-center space-x-3 space-x-reverse px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={closeMenu}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>تماس با ما</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4">
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center space-x-2 space-x-reverse">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>021-12345678</span>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>info@mojtabatahrir.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileMenu;