'use client';

import React from 'react';
import { Brand } from '@/types';

interface BrandFilterProps {
  brands: Brand[];
  selectedBrands: string[];
  onBrandChange: (brandId: string) => void;
  loading?: boolean;
}

// برندهای واقعی از سرور کارا
const REAL_BRANDS: Brand[] = [
  {
    id: 'brand_001',
    name: 'فابر کاستل',
    description: 'برند معتبر آلمانی لوازم التحریر',
    country: 'آلمان',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'brand_002',
    name: 'استدلر',
    description: 'برند آلمانی لوازم التحریر و هنری',
    country: 'آلمان',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'brand_003',
    name: 'پایلوت',
    description: 'برند ژاپنی خودکار و روان‌نویس',
    country: 'ژاپن',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'brand_004',
    name: 'بیک',
    description: 'برند فرانسوی خودکار',
    country: 'فرانسه',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'brand_005',
    name: 'پنتل',
    description: 'برند ژاپنی لوازم التحریر',
    country: 'ژاپن',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

const BrandFilter: React.FC<BrandFilterProps> = ({
  brands = REAL_BRANDS,
  selectedBrands,
  onBrandChange,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900 mb-3">برند</h3>
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center space-x-2 space-x-reverse animate-pulse">
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded flex-1"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-gray-900 mb-3">برند</h3>
      
      {brands.filter(brand => brand.is_active).map((brand) => (
        <label key={brand.id} className="flex items-center space-x-2 space-x-reverse cursor-pointer hover:bg-gray-50 p-2 rounded">
          <input
            type="checkbox"
            checked={selectedBrands.includes(brand.id)}
            onChange={() => onBrandChange(brand.id)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <div className="flex-1">
            <span className="text-sm text-gray-700 block">
              {brand.name}
            </span>
            <span className="text-xs text-gray-500">
              {brand.country}
            </span>
          </div>
        </label>
      ))}
      
      {selectedBrands.length > 0 && (
        <button
          onClick={() => selectedBrands.forEach(id => onBrandChange(id))}
          className="text-sm text-blue-600 hover:text-blue-800 mt-2"
        >
          پاک کردن همه
        </button>
      )}
    </div>
  );
};

export default BrandFilter;