'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  HomeIcon,
  CubeIcon,
  TagIcon,
  FireIcon,
  PhoneIcon,
  InformationCircleIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { Category } from '../../types';

interface SidebarProps {
  categories?: Category[];
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  categories = [],
  isOpen,
  onClose
}) => {
  const router = useRouter();

  const mainCategories = categories.filter(cat => !cat.parent_id);

  const getSubCategories = (parentId: string) => {
    return categories.filter(cat => cat.parent_id === parentId);
  };

  const isActive = (path: string) => {
    return router.pathname === path || router.asPath.startsWith(path);
  };

  const menuItems = [
    { name: 'صفحه اصلی', href: '/', icon: HomeIcon },
    { name: 'همه محصولات', href: '/products', icon: CubeIcon },
    { name: 'پیشنهادات ویژه', href: '/offers', icon: FireIcon },
    { name: 'درباره ما', href: '/about', icon: InformationCircleIcon },
    { name: 'تماس با ما', href: '/contact', icon: PhoneIcon },
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 lg:hidden ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">منو</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Main Menu Items */}
            <div className="py-4">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 space-x-reverse px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors ${
                    isActive(item.href) ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600' : ''
                  }`}
                  onClick={onClose}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>

            {/* Categories */}
            <div className="border-t border-gray-200">
              <div className="px-4 py-3">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                  دسته‌بندی محصولات
                </h3>
              </div>
              
              <div className="pb-4">
                {mainCategories.map((category) => {
                  const subCategories = getSubCategories(category.id);
                  const hasSubCategories = subCategories.length > 0;

                  return (
                    <div key={category.id}>
                      <Link
                        href={`/products/category/${category.slug}`}
                        className={`flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors ${
                          isActive(`/products/category/${category.slug}`) ? 'bg-primary-50 text-primary-700' : ''
                        }`}
                        onClick={onClose}
                      >
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <span>{category.name}</span>
                        </div>
                        {hasSubCategories && (
                          <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                        )}
                      </Link>

                      {/* Sub Categories */}
                      {hasSubCategories && (
                        <div className="bg-gray-50">
                          {subCategories.map((subCategory) => (
                            <Link
                              key={subCategory.id}
                              href={`/products/category/${subCategory.slug}`}
                              className={`block px-8 py-2 text-sm text-gray-600 hover:bg-gray-100 transition-colors ${
                                isActive(`/products/category/${subCategory.slug}`) ? 'text-primary-700 bg-primary-50' : ''
                              }`}
                              onClick={onClose}
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
            </div>

            {/* Quick Actions */}
            <div className="border-t border-gray-200 p-4">
              <Link
                href="/quick-order"
                className="block w-full bg-primary-600 text-white text-center py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                onClick={onClose}
              >
                سفارش سریع
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4">
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center space-x-2 space-x-reverse">
                <PhoneIcon className="w-4 h-4" />
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

export default Sidebar;