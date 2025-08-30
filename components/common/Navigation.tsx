'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { Category } from '../../types';

interface NavigationProps {
  categories?: Category[];
}

const Navigation: React.FC<NavigationProps> = ({ categories = [] }) => {
  const router = useRouter();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const mainCategories = categories.filter(cat => !cat.parent_id);

  const getSubCategories = (parentId: string) => {
    return categories.filter(cat => cat.parent_id === parentId);
  };

  const handleMouseEnter = (categoryId: string) => {
    setActiveDropdown(categoryId);
  };

  const handleMouseLeave = () => {
    setActiveDropdown(null);
  };

  const isActive = (path: string) => {
    return router.pathname === path || router.asPath.startsWith(path);
  };

  return (
    <nav className="hidden lg:block bg-white border-t border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <ul className="flex items-center space-x-8 space-x-reverse">
            {/* Home */}
            <li>
              <Link
                href="/"
                className={`block py-4 text-sm font-medium transition-colors ${
                  isActive('/') 
                    ? 'text-primary-600 border-b-2 border-primary-600' 
                    : 'text-gray-700 hover:text-primary-600'
                }`}
              >
                صفحه اصلی
              </Link>
            </li>

            {/* All Products */}
            <li>
              <Link
                href="/products"
                className={`block py-4 text-sm font-medium transition-colors ${
                  isActive('/products') && router.pathname === '/products'
                    ? 'text-primary-600 border-b-2 border-primary-600' 
                    : 'text-gray-700 hover:text-primary-600'
                }`}
              >
                همه محصولات
              </Link>
            </li>

            {/* Categories with Dropdown */}
            {mainCategories.slice(0, 6).map((category) => {
              const subCategories = getSubCategories(category.id);
              const hasSubCategories = subCategories.length > 0;

              return (
                <li
                  key={category.id}
                  className="relative"
                  onMouseEnter={() => hasSubCategories && handleMouseEnter(category.id)}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link
                    href={`/products/category/${category.slug}`}
                    className={`flex items-center space-x-1 space-x-reverse py-4 text-sm font-medium transition-colors ${
                      isActive(`/products/category/${category.slug}`)
                        ? 'text-primary-600 border-b-2 border-primary-600' 
                        : 'text-gray-700 hover:text-primary-600'
                    }`}
                  >
                    <span>{category.name}</span>
                    {hasSubCategories && (
                      <ChevronDownIcon className="w-4 h-4" />
                    )}
                  </Link>

                  {/* Dropdown Menu */}
                  {hasSubCategories && activeDropdown === category.id && (
                    <div className="absolute top-full right-0 z-50 w-64 bg-white border border-gray-200 rounded-lg shadow-lg py-2">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-900">{category.name}</h3>
                      </div>
                      <div className="py-2">
                        {subCategories.map((subCategory) => (
                          <Link
                            key={subCategory.id}
                            href={`/products/category/${subCategory.slug}`}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors"
                          >
                            {subCategory.name}
                          </Link>
                        ))}
                      </div>
                      <div className="border-t border-gray-100 pt-2">
                        <Link
                          href={`/products/category/${category.slug}`}
                          className="block px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 transition-colors"
                        >
                          مشاهده همه {category.name}
                        </Link>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}

            {/* More Categories */}
            {mainCategories.length > 6 && (
              <li
                className="relative"
                onMouseEnter={() => handleMouseEnter('more')}
                onMouseLeave={handleMouseLeave}
              >
                <button className="flex items-center space-x-1 space-x-reverse py-4 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors">
                  <span>سایر دسته‌ها</span>
                  <ChevronDownIcon className="w-4 h-4" />
                </button>

                {activeDropdown === 'more' && (
                  <div className="absolute top-full right-0 z-50 w-64 bg-white border border-gray-200 rounded-lg shadow-lg py-2">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-900">سایر دسته‌ها</h3>
                    </div>
                    <div className="py-2 max-h-64 overflow-y-auto">
                      {mainCategories.slice(6).map((category) => (
                        <Link
                          key={category.id}
                          href={`/products/category/${category.slug}`}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors"
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </li>
            )}
          </ul>

          {/* Special Offers */}
          <div className="flex items-center space-x-4 space-x-reverse">
            <Link
              href="/offers"
              className="text-sm font-medium text-error-600 hover:text-error-700 transition-colors"
            >
              🔥 پیشنهادات ویژه
            </Link>
            <Link
              href="/quick-order"
              className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
            >
              سفارش سریع
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;