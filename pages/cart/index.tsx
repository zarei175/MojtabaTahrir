'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import { 
  TrashIcon, 
  PlusIcon, 
  MinusIcon,
  ShoppingBagIcon,
  ArrowRightIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import Layout from '../../components/layout/Layout';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { useWishlist } from '../../hooks/useWishlist';
import { formatPrice } from '../../utils/formatters';
import { CartItem, Product } from '../../types';

const CartPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { 
    items, 
    updateQuantity, 
    removeItem, 
    clearCart, 
    getTotalPrice, 
    getTotalItems,
    isLoading 
  } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // محاسبه قیمت‌ها
  const subtotal = getTotalPrice();
  const shipping = subtotal > 500000 ? 0 : 50000; // ارسال رایگان برای خرید بالای 500 هزار تومان
  const tax = Math.round(subtotal * 0.09); // 9% مالیات
  const total = subtotal + shipping + tax;

  // تغییر تعداد محصول
  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setIsUpdating(itemId);
    try {
      await updateQuantity(itemId, newQuantity);
    } catch (error) {
      console.error('خطا در به‌روزرسانی تعداد:', error);
    } finally {
      setIsUpdating(null);
    }
  };

  // حذف محصول از سبد خرید
  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeItem(itemId);
    } catch (error) {
      console.error('خطا در حذف محصول:', error);
    }
  };

  // افزودن/حذف از لیست علاقه‌مندی‌ها
  const handleWishlistToggle = async (product: Product) => {
    try {
      if (isInWishlist(product.id)) {
        await removeFromWishlist(product.id);
      } else {
        await addToWishlist(product);
      }
    } catch (error) {
      console.error('خطا در مدیریت لیست علاقه‌مندی‌ها:', error);
    }
  };

  // ادامه فرآیند خرید
  const handleProceedToCheckout = () => {
    if (!user) {
      router.push('/auth/login?redirect=/cart/checkout');
      return;
    }
    router.push('/cart/checkout');
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-48 mb-8"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-lg p-6">
                      <div className="flex items-center space-x-4 space-x-reverse">
                        <div className="w-20 h-20 bg-gray-300 rounded"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-white rounded-lg p-6 h-fit">
                  <div className="space-y-4">
                    <div className="h-6 bg-gray-300 rounded w-32"></div>
                    <div className="space-y-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex justify-between">
                          <div className="h-4 bg-gray-300 rounded w-20"></div>
                          <div className="h-4 bg-gray-300 rounded w-16"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (items.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto text-center">
              <div className="bg-white rounded-lg p-8 shadow-sm">
                <ShoppingBagIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  سبد خرید شما خالی است
                </h2>
                <p className="text-gray-600 mb-6">
                  هنوز محصولی به سبد خرید خود اضافه نکرده‌اید
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                  مشاهده محصولات
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              سبد خرید ({getTotalItems()} محصول)
            </h1>
            <nav className="text-sm text-gray-600">
              <Link href="/" className="hover:text-gray-900">خانه</Link>
              <span className="mx-2">/</span>
              <span>سبد خرید</span>
            </nav>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">
                      محصولات سبد خرید
                    </h2>
                    <button
                      onClick={() => clearCart()}
                      className="text-sm text-red-600 hover:text-red-700 transition-colors"
                    >
                      پاک کردن سبد خرید
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-gray-200">
                  {items.map((item: CartItem) => (
                    <div key={item.id} className="p-6">
                      <div className="flex items-start space-x-4 space-x-reverse">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <Image
                            src={item.product.image || '/images/placeholder.jpg'}
                            alt={item.product.name}
                            width={80}
                            height={80}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-medium text-gray-900 mb-1">
                                <Link 
                                  href={`/products/${item.product.slug}`}
                                  className="hover:text-blue-600 transition-colors"
                                >
                                  {item.product.name}
                                </Link>
                              </h3>
                              
                              <p className="text-sm text-gray-600 mb-2">
                                کد محصول: {item.product.code}
                              </p>

                              {item.product.brand && (
                                <p className="text-sm text-gray-600 mb-2">
                                  برند: {item.product.brand.name}
                                </p>
                              )}

                              <div className="flex items-center space-x-4 space-x-reverse">
                                {/* Quantity Controls */}
                                <div className="flex items-center border border-gray-300 rounded-lg">
                                  <button
                                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                    disabled={item.quantity <= 1 || isUpdating === item.id}
                                    className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <MinusIcon className="w-4 h-4" />
                                  </button>
                                  
                                  <span className="px-4 py-2 text-gray-900 font-medium min-w-[3rem] text-center">
                                    {isUpdating === item.id ? '...' : item.quantity}
                                  </span>
                                  
                                  <button
                                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                    disabled={isUpdating === item.id}
                                    className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <PlusIcon className="w-4 h-4" />
                                  </button>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center space-x-2 space-x-reverse">
                                  <button
                                    onClick={() => handleWishlistToggle(item.product)}
                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                    title={isInWishlist(item.product.id) ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
                                  >
                                    {isInWishlist(item.product.id) ? (
                                      <HeartSolidIcon className="w-5 h-5 text-red-500" />
                                    ) : (
                                      <HeartIcon className="w-5 h-5" />
                                    )}
                                  </button>
                                  
                                  <button
                                    onClick={() => handleRemoveItem(item.id)}
                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                    title="حذف از سبد خرید"
                                  >
                                    <TrashIcon className="w-5 h-5" />
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Price */}
                            <div className="text-left ml-4">
                              <div className="text-lg font-semibold text-gray-900">
                                {formatPrice(item.product.price * item.quantity)}
                              </div>
                              {item.quantity > 1 && (
                                <div className="text-sm text-gray-600">
                                  {formatPrice(item.product.price)} × {item.quantity}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  خلاصه سفارش
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>جمع کل محصولات:</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-600">
                    <span>هزینه ارسال:</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="text-green-600">رایگان</span>
                      ) : (
                        formatPrice(shipping)
                      )}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-gray-600">
                    <span>مالیات:</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-semibold text-gray-900">
                      <span>مجموع نهایی:</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>

                {shipping > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                    <p className="text-sm text-blue-800">
                      برای ارسال رایگان {formatPrice(500000 - subtotal)} بیشتر خرید کنید
                    </p>
                  </div>
                )}

                <button
                  onClick={handleProceedToCheckout}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors mb-4"
                >
                  ادامه فرآیند خرید
                </button>

                <Link
                  href="/products"
                  className="block w-full text-center border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  ادامه خرید
                </Link>

                {/* Security Badge */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-center text-sm text-gray-600">
                    <svg className="w-4 h-4 text-green-500 ml-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    خرید امن و مطمئن
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CartPage;