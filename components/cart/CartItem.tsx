'use client';

import React from 'react';
import Image from 'next/image';
import { MinusIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Product, ProductPrice } from '@/types/product';

interface CartItemProps {
  item: {
    id: string;
    product: Product;
    price: ProductPrice;
    quantity: number;
    total: number;
  };
  userType: 'b2b' | 'b2c';
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  isUpdating?: boolean;
}

const CartItem: React.FC<CartItemProps> = ({
  item,
  userType,
  onUpdateQuantity,
  onRemoveItem,
  isUpdating = false
}) => {
  const { product, price, quantity, total } = item;
  
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    
    // بررسی حداقل مقدار سفارش برای B2B
    if (userType === 'b2b' && newQuantity < price.min_quantity) {
      return;
    }
    
    onUpdateQuantity(item.id, newQuantity);
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount);
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
      {/* تصویر محصول */}
      <div className="flex-shrink-0">
        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
          <Image
            src={`/images/products/${product.id}.jpg`}
            alt={product.name}
            width={64}
            height={64}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/images/placeholder-product.jpg';
            }}
          />
        </div>
      </div>

      {/* اطلاعات محصول */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-gray-900 truncate">
          {product.name}
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          کد محصول: {product.sku}
        </p>
        
        {/* قیمت واحد */}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-semibold text-blue-600">
            {formatPrice(price.price)} تومان
          </span>
          {price.compare_price > price.price && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(price.compare_price)}
            </span>
          )}
        </div>

        {/* نوع قیمت */}
        <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
          price.price_type === 'wholesale' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-blue-100 text-blue-800'
        }`}>
          {price.price_type === 'wholesale' ? 'عمده' : 'تکی'}
        </span>
      </div>

      {/* کنترل تعداد */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleQuantityChange(quantity - 1)}
          disabled={isUpdating || quantity <= 1 || (userType === 'b2b' && quantity <= price.min_quantity)}
          className="p-1 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <MinusIcon className="w-4 h-4" />
        </button>
        
        <span className="w-12 text-center text-sm font-medium">
          {quantity}
        </span>
        
        <button
          onClick={() => handleQuantityChange(quantity + 1)}
          disabled={isUpdating}
          className="p-1 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <PlusIcon className="w-4 h-4" />
        </button>
      </div>

      {/* قیمت کل */}
      <div className="text-left min-w-0">
        <div className="text-sm font-semibold text-gray-900">
          {formatPrice(total)} تومان
        </div>
        {userType === 'b2b' && (
          <div className="text-xs text-gray-500 mt-1">
            حداقل: {price.min_quantity}
          </div>
        )}
      </div>

      {/* دکمه حذف */}
      <button
        onClick={() => onRemoveItem(item.id)}
        disabled={isUpdating}
        className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="حذف از سبد خرید"
      >
        <TrashIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

export default CartItem;