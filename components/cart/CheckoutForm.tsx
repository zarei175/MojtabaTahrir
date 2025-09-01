'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  UserIcon, 
  PhoneIcon, 
  MapPinIcon, 
  CreditCardIcon,
  TruckIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

interface CheckoutFormData {
  // اطلاعات شخصی
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  
  // آدرس
  address: string;
  city: string;
  postalCode: string;
  
  // روش پرداخت
  paymentMethod: 'online' | 'cash' | 'transfer';
  
  // روش ارسال
  shippingMethod: 'standard' | 'express' | 'pickup';
  
  // یادداشت
  notes?: string;
}

interface CheckoutFormProps {
  userType: 'b2b' | 'b2c';
  cartTotal: number;
  onSubmit: (data: CheckoutFormData) => void;
  isLoading?: boolean;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({
  userType,
  cartTotal,
  onSubmit,
  isLoading = false
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<CheckoutFormData>();

  const watchedPaymentMethod = watch('paymentMethod');
  const watchedShippingMethod = watch('shippingMethod');

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount);
  };

  const getShippingCost = (method: string) => {
    switch (method) {
      case 'standard': return userType === 'b2b' ? 0 : 25000;
      case 'express': return userType === 'b2b' ? 50000 : 45000;
      case 'pickup': return 0;
      default: return 0;
    }
  };

  const shippingCost = getShippingCost(watchedShippingMethod);
  const finalTotal = cartTotal + shippingCost;

  const steps = [
    { id: 1, title: 'اطلاعات شخصی', icon: UserIcon },
    { id: 2, title: 'آدرس و ارسال', icon: MapPinIcon },
    { id: 3, title: 'پرداخت', icon: CreditCardIcon }
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">اطلاعات شخصی</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  نام *
                </label>
                <input
                  type="text"
                  {...register('firstName', { required: 'نام الزامی است' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="نام خود را وارد کنید"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  نام خانوادگی *
                </label>
                <input
                  type="text"
                  {...register('lastName', { required: 'نام خانوادگی الزامی است' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="نام خانوادگی خود را وارد کنید"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                شماره تلفن *
              </label>
              <input
                type="tel"
                {...register('phone', { 
                  required: 'شماره تلفن الزامی است',
                  pattern: {
                    value: /^09\d{9}$/,
                    message: 'شماره تلفن معتبر نیست'
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="09123456789"
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ایمیل
              </label>
              <input
                type="email"
                {...register('email')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="example@email.com"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">آدرس تحویل</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    آدرس کامل *
                  </label>
                  <textarea
                    {...register('address', { required: 'آدرس الزامی است' })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="آدرس کامل خود را وارد کنید"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      شهر *
                    </label>
                    <input
                      type="text"
                      {...register('city', { required: 'شهر الزامی است' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="نام شهر"
                    />
                    {errors.city && (
                      <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      کد پستی *
                    </label>
                    <input
                      type="text"
                      {...register('postalCode', { 
                        required: 'کد پستی الزامی است',
                        pattern: {
                          value: /^\d{10}$/,
                          message: 'کد پستی باید 10 رقم باشد'
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="1234567890"
                    />
                    {errors.postalCode && (
                      <p className="text-red-500 text-xs mt-1">{errors.postalCode.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">روش ارسال</h3>
              
              <div className="space-y-3">
                <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    value="standard"
                    {...register('shippingMethod', { required: true })}
                    className="ml-3"
                  />
                  <TruckIcon className="w-5 h-5 text-gray-400 ml-2" />
                  <div className="flex-1">
                    <div className="font-medium">ارسال عادی</div>
                    <div className="text-sm text-gray-500">3-5 روز کاری</div>
                  </div>
                  <div className="text-sm font-medium">
                    {getShippingCost('standard') === 0 ? 'رایگان' : `${formatPrice(getShippingCost('standard'))} تومان`}
                  </div>
                </label>

                <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    value="express"
                    {...register('shippingMethod', { required: true })}
                    className="ml-3"
                  />
                  <TruckIcon className="w-5 h-5 text-blue-500 ml-2" />
                  <div className="flex-1">
                    <div className="font-medium">ارسال سریع</div>
                    <div className="text-sm text-gray-500">1-2 روز کاری</div>
                  </div>
                  <div className="text-sm font-medium">
                    {formatPrice(getShippingCost('express'))} تومان
                  </div>
                </label>

                <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    value="pickup"
                    {...register('shippingMethod', { required: true })}
                    className="ml-3"
                  />
                  <MapPinIcon className="w-5 h-5 text-green-500 ml-2" />
                  <div className="flex-1">
                    <div className="font-medium">تحویل حضوری</div>
                    <div className="text-sm text-gray-500">از فروشگاه</div>
                  </div>
                  <div className="text-sm font-medium">رایگان</div>
                </label>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">روش پرداخت</h3>
              
              <div className="space-y-3">
                <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    value="online"
                    {...register('paymentMethod', { required: true })}
                    className="ml-3"
                  />
                  <CreditCardIcon className="w-5 h-5 text-blue-500 ml-2" />
                  <div className="flex-1">
                    <div className="font-medium">پرداخت آنلاین</div>
                    <div className="text-sm text-gray-500">کارت بانکی، اینترنت بانک</div>
                  </div>
                </label>

                {userType === 'b2b' && (
                  <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      value="transfer"
                      {...register('paymentMethod', { required: true })}
                      className="ml-3"
                    />
                    <DocumentTextIcon className="w-5 h-5 text-green-500 ml-2" />
                    <div className="flex-1">
                      <div className="font-medium">واریز به حساب</div>
                      <div className="text-sm text-gray-500">انتقال وجه، چک</div>
                    </div>
                  </label>
                )}

                <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    value="cash"
                    {...register('paymentMethod', { required: true })}
                    className="ml-3"
                  />
                  <div className="w-5 h-5 bg-yellow-500 rounded ml-2"></div>
                  <div className="flex-1">
                    <div className="font-medium">پرداخت نقدی</div>
                    <div className="text-sm text-gray-500">هنگام تحویل</div>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                یادداشت سفارش
              </label>
              <textarea
                {...register('notes')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="توضیحات اضافی در مورد سفارش..."
              />
            </div>

            {/* خلاصه نهایی */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">خلاصه سفارش</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>مبلغ کالاها:</span>
                  <span>{formatPrice(cartTotal)} تومان</span>
                </div>
                <div className="flex justify-between">
                  <span>هزینه ارسال:</span>
                  <span>{shippingCost === 0 ? 'رایگان' : `${formatPrice(shippingCost)} تومان`}</span>
                </div>
                <div className="flex justify-between font-semibold text-base border-t pt-1">
                  <span>مبلغ نهایی:</span>
                  <span className="text-blue-600">{formatPrice(finalTotal)} تومان</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Progress Steps */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= step.id 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {currentStep > step.id ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <step.icon className="w-4 h-4" />
                )}
              </div>
              <span className={`mr-2 text-sm font-medium ${
                currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-4 ${
                  currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit(onSubmit)} className="p-6">
        {renderStepContent()}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className={`px-4 py-2 rounded-md font-medium ${
              currentStep === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            مرحله قبل
          </button>

          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
              className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700"
            >
              مرحله بعد
            </button>
          ) : (
            <button
              type="submit"
              disabled={isLoading}
              className={`px-6 py-2 rounded-md font-medium ${
                isLoading
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isLoading ? 'در حال ثبت...' : 'ثبت سفارش'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CheckoutForm;