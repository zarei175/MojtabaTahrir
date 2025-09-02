'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import { 
  CreditCardIcon,
  BanknotesIcon,
  TruckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import Layout from '../../components/layout/Layout';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { formatPrice } from '../../utils/formatters';
import { createOrder } from '../../services/orderService';
import { CartItem, Order, PaymentMethod, ShippingMethod } from '../../types';

interface CheckoutForm {
  // اطلاعات شخصی
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // آدرس ارسال
  address: string;
  city: string;
  state: string;
  postalCode: string;
  
  // اطلاعات شرکت (برای B2B)
  companyName?: string;
  companyCode?: string;
  
  // روش پرداخت و ارسال
  paymentMethod: PaymentMethod;
  shippingMethod: ShippingMethod;
  
  // یادداشت
  notes?: string;
}

const CheckoutPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { items, getTotalPrice, clearCart } = useCart();
  
  const [form, setForm] = useState<CheckoutForm>({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    companyName: '',
    companyCode: '',
    paymentMethod: 'online',
    shippingMethod: 'standard',
    notes: ''
  });
  
  const [errors, setErrors] = useState<Partial<CheckoutForm>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string>('');

  // محاسبه قیمت‌ها
  const subtotal = getTotalPrice();
  const shippingCost = form.shippingMethod === 'express' ? 100000 : (subtotal > 500000 ? 0 : 50000);
  const tax = Math.round(subtotal * 0.09);
  const total = subtotal + shippingCost + tax;

  // بررسی دسترسی
  useEffect(() => {
    if (!user) {
      router.push('/auth/login?redirect=/cart/checkout');
      return;
    }
    
    if (items.length === 0) {
      router.push('/cart');
      return;
    }
  }, [user, items, router]);

  // تغییر مقادیر فرم
  const handleInputChange = (field: keyof CheckoutForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    
    // پاک کردن خطا هنگام تایپ
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // اعتبارسنجی فرم
  const validateForm = (): boolean => {
    const newErrors: Partial<CheckoutForm> = {};

    // فیلدهای اجباری
    if (!form.firstName.trim()) newErrors.firstName = 'نام الزامی است';
    if (!form.lastName.trim()) newErrors.lastName = 'نام خانوادگی الزامی است';
    if (!form.email.trim()) newErrors.email = 'ایمیل الزامی است';
    if (!form.phone.trim()) newErrors.phone = 'شماره تلفن الزامی است';
    if (!form.address.trim()) newErrors.address = 'آدرس الزامی است';
    if (!form.city.trim()) newErrors.city = 'شهر الزامی است';
    if (!form.state.trim()) newErrors.state = 'استان الزامی است';
    if (!form.postalCode.trim()) newErrors.postalCode = 'کد پستی الزامی است';

    // اعتبارسنجی ایمیل
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (form.email && !emailRegex.test(form.email)) {
      newErrors.email = 'فرمت ایمیل صحیح نیست';
    }

    // اعتبارسنجی شماره تلفن
    const phoneRegex = /^09\d{9}$/;
    if (form.phone && !phoneRegex.test(form.phone)) {
      newErrors.phone = 'شماره تلفن باید با 09 شروع شود و 11 رقم باشد';
    }

    // اعتبارسنجی کد پستی
    const postalCodeRegex = /^\d{10}$/;
    if (form.postalCode && !postalCodeRegex.test(form.postalCode)) {
      newErrors.postalCode = 'کد پستی باید 10 رقم باشد';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ثبت سفارش
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const orderData = {
        items: items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price
        })),
        customerInfo: {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          companyName: form.companyName,
          companyCode: form.companyCode
        },
        shippingAddress: {
          address: form.address,
          city: form.city,
          state: form.state,
          postalCode: form.postalCode
        },
        paymentMethod: form.paymentMethod,
        shippingMethod: form.shippingMethod,
        subtotal,
        shippingCost,
        tax,
        total,
        notes: form.notes
      };

      const order = await createOrder(orderData);
      
      setOrderNumber(order.orderNumber);
      setOrderSuccess(true);
      
      // پاک کردن سبد خرید
      await clearCart();
      
      // هدایت به صفحه پرداخت (در صورت انتخاب پرداخت آنلاین)
      if (form.paymentMethod === 'online') {
        // اینجا باید به درگاه پرداخت هدایت شود
        // router.push(`/payment/${order.id}`);
      }
      
    } catch (error) {
      console.error('خطا در ثبت سفارش:', error);
      alert('خطا در ثبت سفارش. لطفاً دوباره تلاش کنید.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // نمایش صفحه موفقیت
  if (orderSuccess) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto text-center">
              <div className="bg-white rounded-lg p-8 shadow-sm">
                <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  سفارش شما با موفقیت ثبت شد
                </h2>
                <p className="text-gray-600 mb-4">
                  شماره سفارش: <span className="font-medium">{orderNumber}</span>
                </p>
                <p className="text-sm text-gray-600 mb-6">
                  جزئیات سفارش به ایمیل شما ارسال شد
                </p>
                <div className="space-y-3">
                  <Link
                    href="/profile/orders"
                    className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    مشاهده سفارشات من
                  </Link>
                  <Link
                    href="/"
                    className="block w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    بازگشت به خانه
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user || items.length === 0) {
    return null; // Loading state handled by useEffect redirects
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              تسویه حساب
            </h1>
            <nav className="text-sm text-gray-600">
              <Link href="/" className="hover:text-gray-900">خانه</Link>
              <span className="mx-2">/</span>
              <Link href="/cart" className="hover:text-gray-900">سبد خرید</Link>
              <span className="mx-2">/</span>
              <span>تسویه حساب</span>
            </nav>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Checkout Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* اطلاعات شخصی */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    اطلاعات شخصی
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        نام *
                      </label>
                      <input
                        type="text"
                        value={form.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.firstName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="نام خود را وارد کنید"
                      />
                      {errors.firstName && (
                        <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        نام خانوادگی *
                      </label>
                      <input
                        type="text"
                        value={form.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.lastName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="نام خانوادگی خود را وارد کنید"
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ایمیل *
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="example@email.com"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        شماره تلفن *
                      </label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="09123456789"
                      />
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                      )}
                    </div>
                  </div>

                  {/* اطلاعات شرکت (اختیاری) */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-md font-medium text-gray-900 mb-4">
                      اطلاعات شرکت (اختیاری)
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          نام شرکت
                        </label>
                        <input
                          type="text"
                          value={form.companyName}
                          onChange={(e) => handleInputChange('companyName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="نام شرکت"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          کد اقتصادی
                        </label>
                        <input
                          type="text"
                          value={form.companyCode}
                          onChange={(e) => handleInputChange('companyCode', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="کد اقتصادی شرکت"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* آدرس ارسال */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    آدرس ارسال
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        آدرس کامل *
                      </label>
                      <textarea
                        value={form.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        rows={3}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.address ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="آدرس کامل خود را وارد کنید"
                      />
                      {errors.address && (
                        <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          شهر *
                        </label>
                        <input
                          type="text"
                          value={form.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.city ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="شهر"
                        />
                        {errors.city && (
                          <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          استان *
                        </label>
                        <input
                          type="text"
                          value={form.state}
                          onChange={(e) => handleInputChange('state', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.state ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="استان"
                        />
                        {errors.state && (
                          <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          کد پستی *
                        </label>
                        <input
                          type="text"
                          value={form.postalCode}
                          onChange={(e) => handleInputChange('postalCode', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.postalCode ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="1234567890"
                        />
                        {errors.postalCode && (
                          <p className="mt-1 text-sm text-red-600">{errors.postalCode}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* روش ارسال */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    روش ارسال
                  </h2>
                  
                  <div className="space-y-3">
                    <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="shippingMethod"
                        value="standard"
                        checked={form.shippingMethod === 'standard'}
                        onChange={(e) => handleInputChange('shippingMethod', e.target.value)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <div className="mr-3 flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <TruckIcon className="w-5 h-5 text-gray-400 ml-2" />
                            <span className="font-medium text-gray-900">ارسال عادی</span>
                          </div>
                          <span className="text-gray-600">
                            {subtotal > 500000 ? 'رایگان' : formatPrice(50000)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          ۳-۵ روز کاری
                        </p>
                      </div>
                    </label>
                    
                    <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="shippingMethod"
                        value="express"
                        checked={form.shippingMethod === 'express'}
                        onChange={(e) => handleInputChange('shippingMethod', e.target.value)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <div className="mr-3 flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <TruckIcon className="w-5 h-5 text-blue-500 ml-2" />
                            <span className="font-medium text-gray-900">ارسال سریع</span>
                          </div>
                          <span className="text-gray-600">{formatPrice(100000)}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          ۱-۲ روز کاری
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* روش پرداخت */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    روش پرداخت
                  </h2>
                  
                  <div className="space-y-3">
                    <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="online"
                        checked={form.paymentMethod === 'online'}
                        onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <div className="mr-3 flex-1">
                        <div className="flex items-center">
                          <CreditCardIcon className="w-5 h-5 text-blue-500 ml-2" />
                          <span className="font-medium text-gray-900">پرداخت آنلاین</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          پرداخت امن با کارت بانکی
                        </p>
                      </div>
                    </label>
                    
                    <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash"
                        checked={form.paymentMethod === 'cash'}
                        onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <div className="mr-3 flex-1">
                        <div className="flex items-center">
                          <BanknotesIcon className="w-5 h-5 text-green-500 ml-2" />
                          <span className="font-medium text-gray-900">پرداخت در محل</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          پرداخت هنگام تحویل
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* یادداشت */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    یادداشت سفارش (اختیاری)
                  </h2>
                  
                  <textarea
                    value={form.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="توضیحات اضافی در مورد سفارش..."
                  />
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    خلاصه سفارش
                  </h2>

                  {/* محصولات */}
                  <div className="space-y-3 mb-6">
                    {items.map((item: CartItem) => (
                      <div key={item.id} className="flex items-center space-x-3 space-x-reverse">
                        <Image
                          src={item.product.image || '/images/placeholder.jpg'}
                          alt={item.product.name}
                          width={50}
                          height={50}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.product.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {item.quantity} × {formatPrice(item.product.price)}
                          </p>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* محاسبات */}
                  <div className="space-y-3 mb-6 pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-gray-600">
                      <span>جمع کل محصولات:</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    
                    <div className="flex justify-between text-gray-600">
                      <span>هزینه ارسال:</span>
                      <span>
                        {shippingCost === 0 ? (
                          <span className="text-green-600">رایگان</span>
                        ) : (
                          formatPrice(shippingCost)
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

                  {/* دکمه ثبت سفارش */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-4"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white ml-2"></div>
                        در حال ثبت سفارش...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <LockClosedIcon className="w-5 h-5 ml-2" />
                        ثبت سفارش
                      </div>
                    )}
                  </button>

                  <Link
                    href="/cart"
                    className="block w-full text-center border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    <ArrowRightIcon className="w-5 h-5 inline ml-2" />
                    بازگشت به سبد خرید
                  </Link>

                  {/* Security Info */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center text-sm text-gray-600">
                      <LockClosedIcon className="w-4 h-4 text-green-500 ml-2" />
                      اطلاعات شما به صورت امن رمزنگاری می‌شود
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutPage;