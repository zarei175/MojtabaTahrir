'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCartIcon, HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { Product, ProductPrice, Inventory } from '@/types';
import { formatPrice } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  price?: ProductPrice;
  inventory?: Inventory;
  userType?: 'b2b' | 'b2c';
  isWishlisted?: boolean;
  onAddToCart?: (productId: string) => void;
  onToggleWishlist?: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  price,
  inventory,
  userType = 'b2c',
  isWishlisted = false,
  onAddToCart,
  onToggleWishlist
}) => {
  // محاسبه قیمت بر اساس نوع کاربر
  const getDisplayPrice = () => {
    if (!price) return null;
    
    if (userType === 'b2b' && price.price_type === 'wholesale') {
      return {
        current: price.price,
        compare: price.compare_price,
        minQuantity: price.min_quantity
      };
    } else if (userType === 'b2c' && price.price_type === 'retail') {
      return {
        current: price.price,
        compare: price.compare_price,
        minQuantity: price.min_quantity
      };
    }
    return null;
  };

  // بررسی موجودی
  const isInStock = inventory ? 
    inventory.quantity > inventory.reserved_quantity : true;
  
  const availableQuantity = inventory ? 
    inventory.quantity - inventory.reserved_quantity : 0;

  const displayPrice = getDisplayPrice();

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group">
      {/* تصویر محصول */}
      <div className="relative aspect-square overflow-hidden">
        <Link href={`/products/${product.id}`}>
          <Image
            src={`/images/products/${product.sku}.jpg`}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </Link>
        
        {/* دکمه علاقه‌مندی */}
        <button
          onClick={() => onToggleWishlist?.(product.id)}
          className="absolute top-2 left-2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
        >
          {isWishlisted ? (
            <HeartSolidIcon className="w-5 h-5 text-red-500" />
          ) : (
            <HeartIcon className="w-5 h-5 text-gray-600" />
          )}
        </button>

        {/* برچسب موجودی */}
        {!isInStock && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs">
            ناموجود
          </div>
        )}

        {/* برچسب تخفیف */}
        {displayPrice && displayPrice.compare > displayPrice.current && (
          <div className="absolute bottom-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs">
            {Math.round(((displayPrice.compare - displayPrice.current) / displayPrice.compare) * 100)}% تخفیف
          </div>
        )}
      </div>

      {/* اطلاعات محصول */}
      <div className="p-4">
        {/* نام محصول */}
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* کد محصول */}
        <p className="text-sm text-gray-500 mb-2">کد: {product.sku}</p>

        {/* قیمت */}
        {displayPrice && (
          <div className="mb-3">
            <div className="flex items-center space-x-2 space-x-reverse">
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(displayPrice.current)} تومان
              </span>
              {displayPrice.compare > displayPrice.current && (
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(displayPrice.compare)}
                </span>
              )}
            </div>
            
            {userType === 'b2b' && displayPrice.minQuantity > 1 && (
              <p className="text-xs text-blue-600 mt-1">
                حداقل سفارش: {displayPrice.minQuantity} عدد
              </p>
            )}
          </div>
        )}

        {/* موجودی */}
        {inventory && (
          <div className="mb-3">
            {isInStock ? (
              <p className="text-sm text-green-600">
                موجود ({availableQuantity} عدد)
              </p>
            ) : (
              <p className="text-sm text-red-600">ناموجود</p>
            )}
          </div>
        )}

        {/* دکمه افزودن به سبد خرید */}
        <button
          onClick={() => onAddToCart?.(product.id)}
          disabled={!isInStock}
          className={`w-full flex items-center justify-center space-x-2 space-x-reverse py-2 px-4 rounded-md transition-colors ${
            isInStock
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <ShoppingCartIcon className="w-5 h-5" />
          <span>{isInStock ? 'افزودن به سبد' : 'ناموجود'}</span>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;