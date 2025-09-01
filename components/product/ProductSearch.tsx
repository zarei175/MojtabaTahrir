'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Product } from '@/types';

interface ProductSearchProps {
  onSearch: (query: string) => void;
  suggestions?: Product[];
  loading?: boolean;
  placeholder?: string;
}

const ProductSearch: React.FC<ProductSearchProps> = ({
  onSearch,
  suggestions = [],
  loading = false,
  placeholder = 'جستجو در محصولات...'
}) => {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // محصولات نمونه برای پیشنهادات (داده‌های واقعی کارا)
  const sampleProducts: Product[] = [
    {
      id: 'prod_001',
      name: 'مداد رنگی فابر کاستل 24 رنگ',
      sku: 'FC-CP-24',
      barcode: '1234567890123',
      description: 'مداد رنگی با کیفیت بالا فابر کاستل 24 رنگ در جعبه فلزی',
      category_id: 'cat_001',
      brand_id: 'brand_001',
      is_active: true,
      weight: 300,
      dimensions: '20x15x2',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prod_002',
      name: 'خودکار پایلوت آبی',
      sku: 'PIL-BP-BL',
      barcode: '2345678901234',
      description: 'خودکار آبی پایلوت با جوهر روان',
      category_id: 'cat_002',
      brand_id: 'brand_003',
      is_active: true,
      weight: 15,
      dimensions: '14x1x1',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prod_003',
      name: 'دفتر 100 برگ خط‌دار',
      sku: 'NB-100-L',
      barcode: '3456789012345',
      description: 'دفتر 100 برگ با خط‌های راهنما',
      category_id: 'cat_003',
      brand_id: null,
      is_active: true,
      weight: 200,
      dimensions: '21x15x1',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ];

  const displaySuggestions = suggestions.length > 0 ? suggestions : sampleProducts;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(value.length > 0);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < displaySuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(displaySuggestions[selectedIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSearch = () => {
    onSearch(query);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (product: Product) => {
    setQuery(product.name);
    onSearch(product.name);
    setShowSuggestions(false);
  };

  const clearSearch = () => {
    setQuery('');
    onSearch('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const filteredSuggestions = displaySuggestions.filter(product =>
    product.name.toLowerCase().includes(query.toLowerCase()) ||
    product.sku.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  return (
    <div className="relative w-full max-w-md mx-auto" ref={suggestionsRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length > 0 && setShowSuggestions(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
        />
        
        <button
          onClick={handleSearch}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
          ) : (
            <MagnifyingGlassIcon className="w-5 h-5" />
          )}
        </button>

        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* پیشنهادات */}
      {showSuggestions && query && filteredSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {filteredSuggestions.map((product, index) => (
            <button
              key={product.id}
              onClick={() => handleSuggestionClick(product)}
              className={`w-full px-4 py-3 text-right hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                index === selectedIndex ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {product.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    کد: {product.sku}
                  </p>
                </div>
                <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 mr-2" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductSearch;