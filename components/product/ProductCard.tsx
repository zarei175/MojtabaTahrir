'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { HeartIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { Product, ProductPrice } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../lib/utils';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product & {
    prices: ProductPrice[];
    inventory: { available_quantity: number; is_in_stock: boolean };
    category: { name: string; color: string };
    brand?: { name: string };
  };
  isWishlisted?: boolean;
  onToggleWishlist?: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isWishlisted = false,
  onToggleWishlist,
}) => {
  const { user } = useAuth();
  const { addItem } = useCart();

  const getPrice = () => {
    if (!user) return null;
    
    const priceType = user.user_type === 'b2b' ? 'wholesale' : 'retail';
    const price = product.prices.find(p => p.price_type === priceType && p.is_active);
    
    return price || product.prices.find(p => p.is_active);
  };

  const price = getPrice();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('برای افزودن به سبد خرید، ابتدا وارد شوید');
      return;
    }

    if (!product.inventory.is_in_stock) {
      toast.error('این محصول موجود نیست');
      return;
    }

    if (!price) {
      toast.error('قیمت این محصول تعریف نشده است');
      return;
    }

    try {
      await addItem({
        product_id: product.id,
        quantity: 1,
        price: price.price,
        price_type: price.price_type,
      });
      toast.success('محصول به سبد خرید اضافه شد');
    } catch (error) {
      toast.error('خطا در افزودن به سبد خرید');
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('برای افزودن به علاقه‌مندی‌ها، ابتدا وارد شوید');
      return;
    }

    onToggleWishlist?.(product.id);
  };

  return (
    <Link href={`/products/${product.slug}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={product.images[0] || '/images/placeholder-product.jpg'}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col space-y-1">
            {product.is_featured && (
              <span className="bg-primary-500 text-white text-xs px-2 py-1 rounded">
                ویژه
              </span>
            )}
            {!product.inventory.is_in_stock && (
              <span className="bg-error-500 text-white text-xs px-2 py-1 rounded">
                ناموجود
              </span>
            )}
            {product.inventory.available_quantity <= 5 && product.inventory.is_in_stock && (
              <span className="bg-warning-500 text-white text-xs px-2 py-1 rounded">
                کم موجود
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleToggleWishlist}
            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
          >
            {isWishlisted ? (
              <HeartSolidIcon className="w-5 h-5 text-error-500" />
            ) : (
              <HeartIcon className="w-5 h-5 text-gray-400 hover:text-error-500 transition-colors" />
            )}
          </button>

          {/* Quick Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={!product.inventory.is_in_stock || !price}
            className="absolute bottom-2 right-2 p-2 bg-primary-500 text-white rounded-full shadow-md hover:bg-primary-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ShoppingCartIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Category Badge */}
          <div className="mb-2">
            <span
              className="inline-block text-xs px-2 py-1 rounded text-white"
              style={{ backgroundColor: product.category.color }}
            >
              {product.category.name}
            </span>
          </div>

          {/* Product Name */}
          <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {product.name}
          </h3>

          {/* Brand */}
          {product.brand && (
            <p className="text-sm text-gray-500 mb-2">{product.brand.name}</p>
          )}

          {/* SKU */}
          <p className="text-xs text-gray-400 mb-3">کد: {product.sku}</p>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div>
              {price ? (
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-primary-600">
                    {formatPrice(price.price)} تومان
                  </span>
                  {user?.user_type === 'b2b' && price.min_quantity && (
                    <span className="text-xs text-gray-500">
                      حداقل {price.min_quantity} عدد
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-sm text-gray-500">تماس بگیرید</span>
              )}
            </div>

            {/* Stock Status */}
            <div className="text-left">
              {product.inventory.is_in_stock ? (
                <span className="text-xs text-success-600">موجود</span>
              ) : (
                <span className="text-xs text-error-600">ناموجود</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;