import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  ChevronLeftIcon,
  HomeIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

import Layout from '../../../components/layout/Layout';
import ProductCard from '../../../components/products/ProductCard';
import FilterSidebar from '../../../components/products/FilterSidebar';
import Pagination from '../../../components/common/Pagination';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  category_id: string;
  brand_id: string;
  weight: number;
  dimensions: string;
  is_active: boolean;
  created_at: string;
  categories: {
    id: string;
    name: string;
    description: string;
  };
  brands: {
    id: string;
    name: string;
    country: string;
  };
  product_prices: Array<{
    price_type: 'wholesale' | 'retail';
    price: number;
    compare_price: number;
    min_quantity: number;
  }>;
  inventory: Array<{
    quantity: number;
    reserved_quantity: number;
    min_stock_level: number;
  }>;
}

interface Category {
  id: string;
  name: string;
  description: string;
  parent_id: string | null;
  is_active: boolean;
}

interface Brand {
  id: string;
  name: string;
  description: string;
  country: string;
  is_active: boolean;
}

interface CategoryPageProps {
  category: Category | null;
  products: Product[];
  brands: Brand[];
  subcategories: Category[];
  totalProducts: number;
  currentPage: number;
  totalPages: number;
  filters: {
    search?: string;
    brand_id?: string;
    min_price?: number;
    max_price?: number;
    in_stock?: boolean;
    sort_by?: string;
    sort_order?: string;
  };
  breadcrumbs: Array<{
    name: string;
    href: string;
  }>;
}

const CategoryPage: React.FC<CategoryPageProps> = ({
  category,
  products,
  brands,
  subcategories,
  totalProducts,
  currentPage,
  totalPages,
  filters,
  breadcrumbs
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(filters.search || '');

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const newQuery = { ...router.query };
    if (searchQuery.trim()) {
      newQuery.search = searchQuery.trim();
    } else {
      delete newQuery.search;
    }
    newQuery.page = '1';
    
    router.push({
      pathname: router.asPath.split('?')[0],
      query: newQuery
    });
  };

  // Handle filter changes
  const handleFilterChange = (filterKey: string, value: any) => {
    setLoading(true);
    
    const newQuery = { ...router.query };
    if (value && value !== '') {
      newQuery[filterKey] = value;
    } else {
      delete newQuery[filterKey];
    }
    newQuery.page = '1';
    
    router.push({
      pathname: router.asPath.split('?')[0],
      query: newQuery
    });
  };

  // Handle sort change
  const handleSortChange = (sortBy: string, sortOrder: string) => {
    setLoading(true);
    
    const newQuery = { ...router.query };
    newQuery.sort_by = sortBy;
    newQuery.sort_order = sortOrder;
    newQuery.page = '1';
    
    router.push({
      pathname: router.asPath.split('?')[0],
      query: newQuery
    });
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setLoading(true);
    
    const newQuery = { ...router.query };
    newQuery.page = page.toString();
    
    router.push({
      pathname: router.asPath.split('?')[0],
      query: newQuery
    });
  };

  useEffect(() => {
    setLoading(false);
  }, [products]);

  if (!category) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">دسته‌بندی یافت نشد</h1>
          <p className="text-gray-600 mb-8">متأسفانه دسته‌بندی مورد نظر شما یافت نشد.</p>
          <Link
            href="/products"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            بازگشت به محصولات
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>{category.name} - فروشگاه مجتبی تحریر</title>
        <meta name="description" content={category.description} />
        <meta name="keywords" content={`${category.name}, لوازم التحریر, نوشت افزار`} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumbs */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex items-center space-x-2 space-x-reverse text-sm">
              {breadcrumbs.map((item, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <ChevronLeftIcon className="w-4 h-4 text-gray-400" />}
                  {index === breadcrumbs.length - 1 ? (
                    <span className="text-gray-900 font-medium">{item.name}</span>
                  ) : (
                    <Link
                      href={item.href}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {item.name}
                    </Link>
                  )}
                </React.Fragment>
              ))}
            </nav>
          </div>
        </div>

        {/* Category Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {category.name}
                </h1>
                <p className="text-gray-600 mb-4">{category.description}</p>
                <p className="text-sm text-gray-500">
                  {totalProducts.toLocaleString('fa-IR')} محصول یافت شد
                </p>
              </div>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="flex-1 max-w-md">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="جستجو در این دسته‌بندی..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Subcategories */}
        {subcategories.length > 0 && (
          <div className="bg-white border-b border-gray-200">
            <div className="container mx-auto px-4 py-4">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-700 ml-4">زیردسته‌ها:</span>
                {subcategories.map((subcat) => (
                  <Link
                    key={subcat.id}
                    href={`/products/category/${subcat.id}`}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    {subcat.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Filters Sidebar */}
            <div className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <FilterSidebar
                categories={[]} // Don't show category filter on category page
                brands={brands}
                filters={filters}
                onFilterChange={handleFilterChange}
              />
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {/* Mobile Filter Toggle */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <FunnelIcon className="h-5 w-5" />
                    فیلترها
                  </button>

                  {/* View Mode Toggle */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg ${
                        viewMode === 'grid'
                          ? 'bg-blue-100 text-blue-600'
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      <Squares2X2Icon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg ${
                        viewMode === 'list'
                          ? 'bg-blue-100 text-blue-600'
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      <ListBulletIcon className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Sort Options */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">مرتب‌سازی:</span>
                    <select
                      value={`${filters.sort_by || 'created_at'}_${filters.sort_order || 'desc'}`}
                      onChange={(e) => {
                        const [sortBy, sortOrder] = e.target.value.split('_');
                        handleSortChange(sortBy, sortOrder);
                      }}
                      className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="created_at_desc">جدیدترین</option>
                      <option value="created_at_asc">قدیمی‌ترین</option>
                      <option value="name_asc">نام (الف - ی)</option>
                      <option value="name_desc">نام (ی - الف)</option>
                      <option value="price_asc">قیمت (کم به زیاد)</option>
                      <option value="price_desc">قیمت (زیاد به کم)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex justify-center py-12">
                  <LoadingSpinner />
                </div>
              )}

              {/* Products Grid/List */}
              {!loading && (
                <>
                  {products.length > 0 ? (
                    <div
                      className={
                        viewMode === 'grid'
                          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                          : 'space-y-4'
                      }
                    >
                      {products.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          viewMode={viewMode}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-gray-400 mb-4">
                        <MagnifyingGlassIcon className="h-16 w-16 mx-auto" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        محصولی در این دسته‌بندی یافت نشد
                      </h3>
                      <p className="text-gray-600">
                        لطفاً فیلترهای خود را تغییر دهید یا جستجوی دیگری انجام دهید
                      </p>
                    </div>
                  )}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-8">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ params, query }) => {
  try {
    const { slug } = params!;
    const {
      search,
      brand_id,
      min_price,
      max_price,
      in_stock,
      sort_by = 'created_at',
      sort_order = 'desc',
      page = '1'
    } = query;

    // Get category details
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('*')
      .eq('id', slug)
      .eq('is_active', true)
      .single();

    if (categoryError || !category) {
      return {
        notFound: true
      };
    }

    const limit = 20;
    const offset = (parseInt(page as string) - 1) * limit;

    // Build products query
    let productsQuery = supabase
      .from('products')
      .select(`
        *,
        categories (
          id,
          name,
          description
        ),
        brands (
          id,
          name,
          country
        ),
        product_prices (
          price_type,
          price,
          compare_price,
          min_quantity
        ),
        inventory (
          quantity,
          reserved_quantity,
          min_stock_level
        )
      `, { count: 'exact' })
      .eq('category_id', category.id)
      .eq('is_active', true);

    // Apply filters
    if (search) {
      productsQuery = productsQuery.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (brand_id) {
      productsQuery = productsQuery.eq('brand_id', brand_id);
    }

    if (in_stock === 'true') {
      productsQuery = productsQuery.gt('inventory.quantity', 0);
    }

    // Apply sorting
    const sortColumn = sort_by === 'price' ? 'product_prices.price' : sort_by as string;
    productsQuery = productsQuery.order(sortColumn, { ascending: sort_order === 'asc' });

    // Apply pagination
    productsQuery = productsQuery.range(offset, offset + limit - 1);

    const { data: products, error: productsError, count } = await productsQuery;

    if (productsError) {
      throw productsError;
    }

    // Get brands for filters (only brands that have products in this category)
    const { data: brands } = await supabase
      .from('brands')
      .select(`
        *,
        products!inner (category_id)
      `)
      .eq('products.category_id', category.id)
      .eq('is_active', true)
      .order('name');

    // Get subcategories
    const { data: subcategories } = await supabase
      .from('categories')
      .select('*')
      .eq('parent_id', category.id)
      .eq('is_active', true)
      .order('name');

    // Build breadcrumbs
    const breadcrumbs = [
      { name: 'خانه', href: '/' },
      { name: 'محصولات', href: '/products' },
      { name: category.name, href: `/products/category/${category.id}` }
    ];

    const totalPages = Math.ceil((count || 0) / limit);

    return {
      props: {
        category,
        products: products || [],
        brands: brands || [],
        subcategories: subcategories || [],
        totalProducts: count || 0,
        currentPage: parseInt(page as string),
        totalPages,
        filters: {
          search: search || null,
          brand_id: brand_id || null,
          min_price: min_price ? parseInt(min_price as string) : null,
          max_price: max_price ? parseInt(max_price as string) : null,
          in_stock: in_stock === 'true' || null,
          sort_by: sort_by as string,
          sort_order: sort_order as string
        },
        breadcrumbs
      }
    };
  } catch (error) {
    console.error('Error fetching category page:', error);
    
    return {
      notFound: true
    };
  }
};

export default CategoryPage;