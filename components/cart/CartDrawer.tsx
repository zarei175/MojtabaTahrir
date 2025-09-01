'use client';

import React, { useEffect } from 'react';
import { XMarkIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import CartItem from './CartItem';
import CartSummary from './CartSummary';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: Array<{
    id: string;
    product: any;
    price: any;
    quantity: number;
    total: number;
  }>;
  userType: 'b2b' | 'b2c';
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onCheckout: () => void;
  isUpdating?: boolean;
}

const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  userType,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  isUpdating = false
}) => {
  // بستن drawer با کلید Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // جلوگیری از اسکرول صفحه هنگام باز بودن drawer
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute left-0 top-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <ShoppingCartIcon className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              سبد خرید ({items.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col h-full">
          {items.length === 0 ? (
            /* سبد خالی */
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <ShoppingCartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  سبد خرید شما خالی است
                </h3>
                <p className="text-gray-500 mb-6">
                  محصولات مورد نظر خود را به سبد خرید اضافه کنید
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  ادامه خرید
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* لیست محصولات */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    userType={userType}
                    onUpdateQuantity={onUpdateQuantity}
                    onRemoveItem={onRemoveItem}
                    isUpdating={isUpdating}
                  />
                ))}
              </div>

              {/* خلاصه سفارش */}
              <div className="border-t border-gray-200 p-4">
                <CartSummary
                  items={items}
                  userType={userType}
                  onCheckout={() => {
                    onCheckout();
                    onClose();
                  }}
                  isLoading={isUpdating}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;