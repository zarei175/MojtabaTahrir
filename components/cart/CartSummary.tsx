'use client';

import React from 'react';
import { ShoppingBagIcon, TruckIcon, CalculatorIcon } from '@heroicons/react/24/outline';

interface CartSummaryProps {
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  userType: 'b2b' | 'b2c';
  shippingCost?: number;
  taxRate?: number;
  discountAmount?: number;
  onCheckout: () => void;
  isLoading?: boolean;
}

const CartSummary: React.FC<CartSummaryProps> = ({
  items,
  userType,
  shippingCost = 0,
  taxRate = 0.09, // 9% مالیات
  discountAmount = 0,
  onCheckout,
  isLoading = false
}) => {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount);
  };

  // محاسبات
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  
  // تخفیف عمده برای B2B
  const bulkDiscountRate = userType === 'b2b' && subtotal > 1000000 ? 0.05 : 0; // 5% تخفیف برای خرید بالای 1 میلیون
  const bulkDiscount = subtotal * bulkDiscountRate;
  
  const taxableAmount = subtotal - discountAmount - bulkDiscount;
  const taxAmount = taxableAmount * taxRate;
  const finalTotal = taxableAmount + taxAmount + shippingCost;

  // حداقل مبلغ سفارش
  const minOrderAmount = userType === 'b2b' ? 500000 : 50000;
  const canCheckout = subtotal >= minOrderAmount && items.length > 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* عنوان */}
      <div className="flex items-center gap-2 mb-4">
        <ShoppingBagIcon className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">خلاصه سفارش</h3>
      </div>

      {/* آمار کلی */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">تعداد اقلام:</span>
          <span className="font-medium">{totalItems} عدد</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">جمع کل اقلام:</span>
          <span className="font-medium">{formatPrice(subtotal)} تومان</span>
        </div>

        {/* تخفیف‌ها */}
        {discountAmount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>تخفیف:</span>
            <span>-{formatPrice(discountAmount)} تومان</span>
          </div>
        )}

        {bulkDiscount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>تخفیف عمده ({(bulkDiscountRate * 100).toFixed(0)}%):</span>
            <span>-{formatPrice(bulkDiscount)} تومان</span>
          </div>
        )}

        {/* مالیات */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 flex items-center gap-1">
            <CalculatorIcon className="w-4 h-4" />
            مالیات ({(taxRate * 100).toFixed(0)}%):
          </span>
          <span className="font-medium">{formatPrice(taxAmount)} تومان</span>
        </div>

        {/* هزینه ارسال */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 flex items-center gap-1">
            <TruckIcon className="w-4 h-4" />
            هزینه ارسال:
          </span>
          <span className="font-medium">
            {shippingCost === 0 ? 'رایگان' : `${formatPrice(shippingCost)} تومان`}
          </span>
        </div>
      </div>

      {/* خط جداکننده */}
      <div className="border-t border-gray-200 pt-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-900">مبلغ نهایی:</span>
          <span className="text-xl font-bold text-blue-600">
            {formatPrice(finalTotal)} تومان
          </span>
        </div>
      </div>

      {/* پیام‌های راهنما */}
      {!canCheckout && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            {subtotal < minOrderAmount 
              ? `حداقل مبلغ سفارش ${formatPrice(minOrderAmount)} تومان است.`
              : 'سبد خرید شما خالی است.'
            }
          </p>
        </div>
      )}

      {/* ارسال رایگان */}
      {userType === 'b2c' && subtotal > 0 && subtotal < 200000 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            برای ارسال رایگان {formatPrice(200000 - subtotal)} تومان دیگر خرید کنید!
          </p>
        </div>
      )}

      {/* دکمه تسویه حساب */}
      <button
        onClick={onCheckout}
        disabled={!canCheckout || isLoading}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
          canCheckout && !isLoading
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {isLoading ? 'در حال پردازش...' : 'ادامه خرید'}
      </button>

      {/* اطلاعات تکمیلی */}
      <div className="mt-4 text-xs text-gray-500 space-y-1">
        <p>• قیمت‌ها شامل مالیات بر ارزش افزوده است</p>
        {userType === 'b2b' && (
          <p>• تخفیف عمده برای خرید بالای 1 میلیون تومان اعمال می‌شود</p>
        )}
        <p>• هزینه ارسال بر اساس وزن و مقصد محاسبه می‌شود</p>
      </div>
    </div>
  );
};

export default CartSummary;