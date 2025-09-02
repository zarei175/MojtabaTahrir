'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../hooks/useAuth';
import { useOrders } from '../../hooks/useOrders';
import { formatPrice, formatDate } from '../../utils/formatters';
import { Order, OrderStatus } from '../../types';

interface OrderFilters {
  status: OrderStatus | 'all';
  dateFrom: string;
  dateTo: string;
  minAmount: string;
  maxAmount: string;
  search: string;
}

const OrdersPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { 
    orders, 
    isLoading, 
    error, 
    fetchOrders, 
    totalCount,
    currentPage,
    totalPages 
  } = useOrders();

  const [filters, setFilters] = useState<OrderFilters>({
    status: 'all',
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: '',
    search: ''
  });

  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  // بررسی احراز هویت
  useEffect(() => {
    if (!user) {
      router.push('/auth/login?redirect=/orders');
      return;
    }
  }, [user, router]);

  // بارگذاری سفارشات
  useEffect(() => {
    if (user) {
      fetchOrders(page, filters);
    }
  }, [user, page, filters, fetchOrders]);

  // تغییر فیلترها
  const handleFilterChange = (field: keyof OrderFilters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(1); // بازگشت به صفحه اول هنگام تغییر فیلتر
  };

  // پاک کردن فیلترها
  const clearFilters = () => {
    setFilters({
      status: 'all',
      dateFrom: '',
      dateTo: '',
      minAmount: '',
      maxAmount: '',
      search: ''
    });
    setPage(1);
  };

  // آیکون وضعیت سفارش
  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircleIcon className="w-5 h-5 text-blue-500" />;
      case 'processing':
        return <ExclamationTriangleIcon className="w-5 h-5 text-orange-500" />;
      case 'shipped':
        return <TruckIcon className="w-5 h-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  // متن وضعیت سفارش
  const getStatusText = (status: OrderStatus) => {
    const statusMap = {
      pending: 'در انتظار تأیید',
      confirmed: 'تأیید شده',
      processing: 'در حال پردازش',
      shipped: 'ارسال شده',
      delivered: 'تحویل داده شده',
      cancelled: 'لغو شده'
    };
    return statusMap[status] || 'نامشخص';
  };

  // رنگ وضعیت سفارش
  const getStatusColor = (status: OrderStatus) => {
    const colorMap = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-orange-100 text-orange-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  if (!user) {
    return null; // Loading handled by useEffect redirect
  }

  if (isLoading && orders.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-48 mb-8"></div>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="bg-white rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-6 bg-gray-300 rounded w-32"></div>
                      <div className="h-6 bg-gray-300 rounded w-24"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="h-4 bg-gray-300 rounded"></div>
                      <div className="h-4 bg-gray-300 rounded"></div>
                      <div className="h-4 bg-gray-300 rounded"></div>
                      <div className="h-4 bg-gray-300 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              سفارشات من
            </h1>
            <nav className="text-sm text-gray-600">
              <Link href="/" className="hover:text-gray-900">خانه</Link>
              <span className="mx-2">/</span>
              <Link href="/profile" className="hover:text-gray-900">پروفایل</Link>
              <span className="mx-2">/</span>
              <span>سفارشات</span>
            </nav>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="جستجو در سفارشات..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FunnelIcon className="w-5 h-5 ml-2" />
                فیلترها
              </button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="border-t border-gray-200 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      وضعیت
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">همه</option>
                      <option value="pending">در انتظار تأیید</option>
                      <option value="confirmed">تأیید شده</option>
                      <option value="processing">در حال پردازش</option>
                      <option value="shipped">ارسال شده</option>
                      <option value="delivered">تحویل داده شده</option>
                      <option value="cancelled">لغو شده</option>
                    </select>
                  </div>

                  {/* Date From */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      از تاریخ
                    </label>
                    <input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Date To */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      تا تاریخ
                    </label>
                    <input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Min Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      حداقل مبلغ
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={filters.minAmount}
                      onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Max Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      حداکثر مبلغ
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={filters.maxAmount}
                      onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    پاک کردن فیلترها
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Orders List */}
          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-red-900 mb-2">خطا در بارگذاری سفارشات</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <button
                onClick={() => fetchOrders(page, filters)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                تلاش مجدد
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <ShoppingBagIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                هیچ سفارشی یافت نشد
              </h3>
              <p className="text-gray-600 mb-6">
                {filters.search || filters.status !== 'all' || filters.dateFrom || filters.dateTo
                  ? 'با فیلترهای انتخابی سفارشی یافت نشد'
                  : 'هنوز سفارشی ثبت نکرده‌اید'}
              </p>
              <div className="space-y-3">
                {(filters.search || filters.status !== 'all' || filters.dateFrom || filters.dateTo) && (
                  <button
                    onClick={clearFilters}
                    className="block mx-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    پاک کردن فیلترها
                  </button>
                )}
                <Link
                  href="/products"
                  className="block mx-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  شروع خرید
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order: Order) => (
                <div key={order.id} className="bg-white rounded-lg shadow-sm p-6">
                  {/* Order Header */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div className="flex items-center space-x-4 space-x-reverse mb-4 md:mb-0">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          سفارش #{order.orderNumber}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 space-x-reverse">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="mr-2">{getStatusText(order.status)}</span>
                      </span>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <ShoppingBagIcon className="w-4 h-4 ml-2" />
                      {order.items.length} محصول
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <CurrencyDollarIcon className="w-4 h-4 ml-2" />
                      {formatPrice(order.total)}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <CalendarDaysIcon className="w-4 h-4 ml-2" />
                      {formatDate(order.createdAt)}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <TruckIcon className="w-4 h-4 ml-2" />
                      {order.shippingMethod === 'express' ? 'ارسال سریع' : 'ارسال عادی'}
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <div className="flex items-center space-x-4 space-x-reverse">
                      {order.items.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex items-center space-x-2 space-x-reverse">
                          <Image
                            src={item.product.image || '/images/placeholder.jpg'}
                            alt={item.product.name}
                            width={40}
                            height={40}
                            className="w-10 h-10 object-cover rounded"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                              {item.product.name}
                            </p>
                            <p className="text-xs text-gray-600">
                              تعداد: {item.quantity}
                            </p>
                          </div>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="text-sm text-gray-600">
                          و {order.items.length - 3} محصول دیگر
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-3 space-x-reverse mb-3 sm:mb-0">
                      <Link
                        href={`/orders/${order.id}`}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <EyeIcon className="w-4 h-4 ml-2" />
                        مشاهده جزئیات
                      </Link>
                      
                      <Link
                        href={`/orders/${order.id}/invoice`}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <DocumentTextIcon className="w-4 h-4 ml-2" />
                        فاکتور
                      </Link>
                    </div>

                    {order.status === 'pending' && (
                      <button className="text-sm text-red-600 hover:text-red-700 transition-colors">
                        لغو سفارش
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-8">
              <div className="text-sm text-gray-600">
                نمایش {((page - 1) * 10) + 1} تا {Math.min(page * 10, totalCount)} از {totalCount} سفارش
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  قبلی
                </button>
                
                <div className="flex items-center space-x-1 space-x-reverse">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          page === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  بعدی
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default OrdersPage;