'use client';

import React, { useState } from 'react';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import CategoryFilter from './CategoryFilter';
import BrandFilter from './BrandFilter';
import { Category, Brand } from '@/types';

interface ProductFilterProps {
  categories: Category[];
  brands: Brand[];
  selectedCategories: string[];
  selectedBrands: string[];
  priceRange: [number, number];
  onCategoryChange: (categoryId: string) => void;
  onBrandChange: (brandId: string) => void;
  onPriceRangeChange: (range: [number, number]) => void;
  onClearFilters: () => void;
  loading?: boolean;
}

const ProductFilter: React.FC<ProductFilterProps> = ({
  categories,
  brands,
  selectedCategories,
  selectedBrands,
  priceRange,
  onCategoryChange,
  onBrandChange,
  onPriceRangeChange,
  onClearFilters,
  loading = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempPriceRange, setTempPriceRange] = useState<[number, number]>(priceRange);

  const hasActiveFilters = selectedCategories.length > 0 || 
                          selectedBrands.length > 0 || 
                          priceRange[0] > 0 || 
                          priceRange[1] < 1000000;

  const handlePriceChange = (index: 0 | 1, value: number) => {
    const newRange: [number, number] = [...tempPriceRange];
    newRange[index] = value;
    setTempPriceRange(newRange);
  };

  const applyPriceFilter = () => {
    onPriceRangeChange(tempPriceRange);
  };

  return (
    <>
      {/* دکمه فیلتر موبایل */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center space-x-2 space-x-reverse bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <FunnelIcon className="w-5 h-5" />
          <span>فیلترها</span>
          {hasActiveFilters && (
            <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1">
              {selectedCategories.length + selectedBrands.length}
            </span>
          )}
        </button>
      </div>

      {/* فیلتر دسکتاپ */}
      <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2 space-x-reverse">
            <FunnelIcon className="w-5 h-5" />
            <span>فیلترها</span>
          </h2>
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              پاک کردن همه
            </button>
          )}
        </div>

        <div className="space-y-6">
          {/* فیلتر دسته‌بندی */}
          <CategoryFilter
            categories={categories}
            selectedCategories={selectedCategories}
            onCategoryChange={onCategoryChange}
            loading={loading}
          />

          {/* فیلتر برند */}
          <BrandFilter
            brands={brands}
            selectedBrands={selectedBrands}
            onBrandChange={onBrandChange}
            loading={loading}
          />

          {/* فیلتر قیمت */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">محدوده قیمت (تومان)</h3>
            <div className="space-y-2">
              <div>
                <label className="block text-sm text-gray-600 mb-1">از</label>
                <input
                  type="number"
                  value={tempPriceRange[0]}
                  onChange={(e) => handlePriceChange(0, Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="حداقل قیمت"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">تا</label>
                <input
                  type="number"
                  value={tempPriceRange[1]}
                  onChange={(e) => handlePriceChange(1, Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="حداکثر قیمت"
                />
              </div>
              <button
                onClick={applyPriceFilter}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm hover:bg-blue-700 transition-colors"
              >
                اعمال فیلتر قیمت
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* فیلتر موبایل (Modal) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-lg max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">فیلترها</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-4 space-y-6">
              <CategoryFilter
                categories={categories}
                selectedCategories={selectedCategories}
                onCategoryChange={onCategoryChange}
                loading={loading}
              />
              
              <BrandFilter
                brands={brands}
                selectedBrands={selectedBrands}
                onBrandChange={onBrandChange}
                loading={loading}
              />
              
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">محدوده قیمت (تومان)</h3>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={tempPriceRange[0]}
                    onChange={(e) => handlePriceChange(0, Number(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="حداقل"
                  />
                  <input
                    type="number"
                    value={tempPriceRange[1]}
                    onChange={(e) => handlePriceChange(1, Number(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="حداکثر"
                  />
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 flex space-x-3 space-x-reverse">
              <button
                onClick={onClearFilters}
                className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-md font-medium"
              >
                پاک کردن همه
              </button>
              <button
                onClick={() => {
                  applyPriceFilter();
                  setIsOpen(false);
                }}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md font-medium"
              >
                اعمال فیلترها
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductFilter;