'use client';

import React from 'react';
import ProductCard from './ProductCard';
import { Product, ProductPrice, Inventory } from '@/types';

interface ProductGridProps {
  products: Product[];
  prices: ProductPrice[];
  inventory: Inventory[];
  userType?: 'b2b' | 'b2c';
  wishlistedProducts?: string[];
  onAddToCart?: (productId: string) => void;
  onToggleWishlist?: (productId: string) => void;
  loading?: boolean;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  prices,
  inventory,
  userType = 'b2c',
  wishlistedProducts = [],
  onAddToCart,
  onToggleWishlist,
  loading = false
}) => {
  // پیدا کردن قیمت محصول
  const getProductPrice = (productId: string): ProductPrice | undefined => {
    return prices.find(p => 
      p.product_id === productId && 
      p.price_type === (userType === 'b2b' ? 'wholesale' : 'retail')
    );
  };

  // پیدا کردن موجودی محصول
  const getProductInventory = (productId: string): Inventory | undefined => {
    return inventory.find(i => i.product_id === productId);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
            <div className="aspect-square bg-gray-200"></div>
            <div className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-2 w-1/2"></div>
              <div className="h-6 bg-gray-200 rounded mb-3 w-1/3"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">📦</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          محصولی یافت نشد
        </h3>
        <p className="text-gray-500">
          متأسفانه محصولی با این مشخصات پیدا نشد. لطفاً فیلترها را تغییر دهید.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          price={getProductPrice(product.id)}
          inventory={getProductInventory(product.id)}
          userType={userType}
          isWishlisted={wishlistedProducts.includes(product.id)}
          onAddToCart={onAddToCart}
          onToggleWishlist={onToggleWishlist}
        />
      ))}
    </div>
  );
};

export default ProductGrid;