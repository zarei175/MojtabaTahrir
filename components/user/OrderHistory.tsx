'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  TruckIcon,
  EyeIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { supabase } from '../../lib/supabase';

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_code: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Order {
  id: string;
  order_number: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  items_count: number;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  shipping_address?: string;
  notes?: string;
}

interface OrderHistoryProps {
  className?: string;
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ className = '' }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('کاربر وارد نشده است');
        return;
      }

      const { data, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_id,
            product_name,
            product_code,
            quantity,
            unit_price,
            total_price
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (ordersError) {
        throw ordersError;
      }

      const formattedOrders: Order[] = data.map(order => ({
        ...order,
        items: order.order_items || [],
        items_count: order.order_items?.length || 0
      }));

      setOrders(formattedOrders);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError('خطا در بارگذاری سفارشات');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusInfo = (status: Order['status']) => {
    const statusMap = {
      pending: { label: 'در انتظار تأیید', color: 'text-yellow-600 bg-yellow-100', icon: ClockIcon },
      confirmed: { label: 'تأیید شده', color: 'text-blue-600 bg-blue-100', icon: CheckCircleIcon },
      processing: { label: 'در حال پردازش', color: 'text-purple-600 bg-purple-100', icon: ArrowPathIcon },
      shipped: { label: 'ارسال شده', color: 'text-indigo-600 bg-indigo-100', icon: TruckIcon },
      delivered: { label: 'تحویل داده شده', color: 'text-green-600 bg-green-100', icon: CheckCircleIcon },
      cancelled: { label: 'لغو شده', color: 'text-red-600 bg-red-100', icon: XCircleIcon }
    };
    return statusMap[status];
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.items.some(item => 
                           item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.product_code.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`max-w-6xl mx-auto ${className}`}>
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">تاریخچه سفارشات</h1>
            <div className="text-sm text-gray-500">
              {orders.length} سفارش
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="جستجو در سفارشات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Status Filter */}
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">همه وضعیت‌ها</option>
                <option value="pending">در انتظار تأیید</option>
                <option value="confirmed">تأیید شده</option>
                <option value="processing">در حال پردازش</option>
                <option value="shipped">ارسال شده</option>
                <option value="delivered">تحویل داده شده</option>
                <option value="cancelled">لغو شده</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Orders List */}
        <div className="divide-y divide-gray-200">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <ClockIcon className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || statusFilter !== 'all' ? 'سفارشی یافت نشد' : 'هنوز سفارشی ندارید'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || statusFilter !== 'all' 
                  ? 'فیلترهای جستجو را تغییر دهید'
                  : 'اولین سفارش خود را ثبت کنید'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Link
                  href="/products"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  مشاهده محصولات
                </Link>
              )}
            </div>
          ) : (
            filteredOrders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              const StatusIcon = statusInfo.icon;
              const isExpanded = expandedOrder === order.id;

              return (
                <div key={order.id} className="p-6">
                  {/* Order Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4 space-x-reverse">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          سفارش #{order.order_number}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString('fa-IR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 space-x-reverse">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                        <StatusIcon className="w-4 h-4 ml-1" />
                        {statusInfo.label}
                      </div>
                      <button
                        onClick={() => toggleOrderExpansion(order.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-500">تعداد اقلام</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {order.items_count} قلم
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-500">مبلغ کل</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {order.total_amount.toLocaleString('fa-IR')} تومان
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-500">آخرین به‌روزرسانی</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {new Date(order.updated_at).toLocaleDateString('fa-IR')}
                      </div>
                    </div>
                  </div>

                  {/* Order Details (Expandable) */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 pt-4">
                      {/* Order Items */}
                      <div className="mb-6">
                        <h4 className="text-md font-semibold text-gray-900 mb-3">اقلام سفارش</h4>
                        <div className="space-y-3">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex-1">
                                <h5 className="font-medium text-gray-900">{item.product_name}</h5>
                                <p className="text-sm text-gray-500">کد محصول: {item.product_code}</p>
                              </div>
                              <div className="text-left">
                                <div className="text-sm text-gray-500">
                                  {item.quantity} × {item.unit_price.toLocaleString('fa-IR')} تومان
                                </div>
                                <div className="font-semibold text-gray-900">
                                  {item.total_price.toLocaleString('fa-IR')} تومان
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Shipping Address */}
                      {order.shipping_address && (
                        <div className="mb-4">
                          <h4 className="text-md font-semibold text-gray-900 mb-2">آدرس تحویل</h4>
                          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                            {order.shipping_address}
                          </p>
                        </div>
                      )}

                      {/* Notes */}
                      {order.notes && (
                        <div className="mb-4">
                          <h4 className="text-md font-semibold text-gray-900 mb-2">یادداشت</h4>
                          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                            {order.notes}
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center space-x-4 space-x-reverse pt-4 border-t border-gray-200">
                        <Link
                          href={`/orders/${order.id}`}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <EyeIcon className="w-4 h-4 ml-2" />
                          مشاهده جزئیات
                        </Link>
                        
                        {order.status === 'delivered' && (
                          <Link
                            href={`/orders/${order.id}/reorder`}
                            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <ArrowPathIcon className="w-4 h-4 ml-2" />
                            سفارش مجدد
                          </Link>
                        )}
                        
                        {['pending', 'confirmed'].includes(order.status) && (
                          <button className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                            <XCircleIcon className="w-4 h-4 ml-2" />
                            لغو سفارش
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;