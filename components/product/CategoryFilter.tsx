'use client';

import React from 'react';
import { Category } from '@/types';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategories: string[];
  onCategoryChange: (categoryId: string) => void;
  loading?: boolean;
}

// دسته‌بندی‌های واقعی از سرور کارا
const REAL_CATEGORIES: Category[] = [
  {
    id: 'cat_001',
    name: 'مداد و مداد رنگی',
    parent_id: null,
    description: 'انواع مداد و مداد رنگی',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'cat_002',
    name: 'خودکار و روان‌نویس',
    parent_id: null,
    description: 'انواع خودکار و روان‌نویس',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'cat_003',
    name: 'کاغذ و دفتر',
    parent_id: null,
    description: 'انواع کاغذ و دفتر',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'cat_004',
    name: 'لوازم هنری',
    parent_id: null,
    description: 'لوازم نقاشی و هنری',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'cat_005',
    name: 'لوازم اداری',
    parent_id: null,
    description: 'لوازم اداری و تجاری',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories = REAL_CATEGORIES,
  selectedCategories,
  onCategoryChange,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900 mb-3">دسته‌بندی</h3>
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
      <h3 className="font-semibold text-gray-900 mb-3">دسته‌بندی</h3>
      
      {categories.filter(cat => cat.is_active).map((category) => (
        <label key={category.id} className="flex items-center space-x-2 space-x-reverse cursor-pointer hover:bg-gray-50 p-2 rounded">
          <input
            type="checkbox"
            checked={selectedCategories.includes(category.id)}
            onChange={() => onCategoryChange(category.id)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700 flex-1">
            {category.name}
          </span>
        </label>
      ))}
      
      {selectedCategories.length > 0 && (
        <button
          onClick={() => selectedCategories.forEach(id => onCategoryChange(id))}
          className="text-sm text-blue-600 hover:text-blue-800 mt-2"
        >
          پاک کردن همه
        </button>
      )}
    </div>
  );
};

export default CategoryFilter;