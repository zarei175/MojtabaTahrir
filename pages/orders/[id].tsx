'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowRightIcon,
  PrinterIcon,
  TruckIcon,
  MapPinIcon,
  CreditCardIcon,
  BanknotesIcon,
  PhoneIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../hooks/useAuth';
import { useOrder } from '../../hooks/useOrder';
import { formatPrice, formatDate } from '../../utils/formatters';
import { Order, OrderStatus, OrderItem } from '../../types';

const OrderDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const { 
    order, 
    isLoading, 
    error, 
    fetchOrder, 
    cancelOrder,
    trackOrder 
  } = useOrder();

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  // بررسی احراز هویت
  useEffect(() => {
    if (!user) {
      router.push('/auth/login?redirect=' + router.asPath);
      return;
    }
  }, [user, router]);

  // بارگذاری سفارش
  useEffect(() => {
    if (user && id && typeof id === 'string') {
      fetchOrder(id);
    }
  }, [user, id, fetchOrder]);

  // آیکون وضعیت سفارش
  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="w-6 h-6 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircleIcon className="w-6 h-6 text-blue-500" />;
      case 'processing':
        return <ExclamationTriangleIcon className="w-6 h-6 text-orange-500" />;
      case 'shipped':
        return <TruckIcon className="w-6 h-6 text-purple-500" />;
      case 'delivered':
        return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
      case 'cancelled':
        return <XCircleIcon className="w-6 h-6 text-red-500" />;
      default:
        return <ClockIcon className="w-6 h-6 text-gray-500" />;
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
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      processing: 'bg-orange-100 text-orange-800 border-orange-200',
      shipped: 'bg-purple-100 text-purple-800 border-purple-200',
      delivered: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // لغو سفارش
  const handleCancelOrder = async () => {
    if (!order || !cancelReason.trim()) return;
    
    setIsCancelling(true);
    try {
      await cancelOrder(order.id, cancelReason);
      setShowCancelModal(false);
      setCancelReason('');
      // بارگذاری مجدد سفارش
      fetchOrder(order.id);
    } catch (error) {
      console.error('خطا در لغو سفارش:', error);
      alert('خطا در لغو سفارش. لطفاً دوباره تلاش کنید.');
    } finally {
      setIsCancelling(false);
    }
  };

  // چاپ فاکتور
  const handlePrintInvoice = () => {
    window.open(`/orders/${order?.id}/invoice`, '_blank');
  };

  if (!user) {
    return null; // Loading handled by useEffect redirect
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-48 mb-8"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white rounded-lg p-6">
                    <div className="h-6 bg-gray-300 rounded w-32 mb-4"></div>
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center space-x-4 space-x-reverse">
                          <div className="w-16 h-16 bg-gray-300 rounded"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="bg-white rounded-lg p-6">
                    <div className="h-6 bg-gray-300 rounded w-32 mb-4"></div>
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex justify-between">
                          <div className="h-4 bg-gray-300 rounded w-20"></div>
                          <div className="h-4 bg-gray-300 rounded w-16"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !order) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto text-center">
              <div className="bg-white rounded-lg p-8 shadow-sm">
                <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  خطا در بارگذاری سفارش
                </h2>
                <p className="text-gray-600 mb-6">
                  {error || 'سفارش مورد نظر یافت نشد'}
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => fetchOrder(id as string)}
                    className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    تلاش مجدد
                  </button>
                  <Link
                    href="/orders"
                    className="block w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    بازگشت به لیست سفارشات
                  </Link>
                </div>
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
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  سفارش #{order.orderNumber}
                </h1>
                <nav className="text-sm text-gray-600">
                  <Link href="/" className="hover:text-gray-900">خانه</Link>
                  <span className="mx-2">/</span>
                  <Link href="/orders" className="hover:text-gray-900">سفارشات</Link>
                  <span className="mx-2">/</span>
                  <span>#{order.orderNumber}</span>
                </nav>
              </div>

              <div className="flex items-center space-x-3 space-x-reverse">
                <button
                  onClick={handlePrintInvoice}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <PrinterIcon className="w-4 h-4 ml-2" />
                  چاپ فاکتور
                </button>
                
                <Link
                  href="/orders"
                  className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <ArrowRightIcon className="w-4 h-4 ml-2" />
                  بازگشت
                </Link>
              </div>
            </div>

            {/* Order Status */}
            <div className={`inline-flex items-center px-4 py-2 rounded-lg border ${getStatusColor(order.status)}`}>
              {getStatusIcon(order.status)}
              <span className="mr-3 font-medium">{getStatusText(order.status)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Items */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  محصولات سفارش ({order.items.length} محصول)
                </h2>
                
                <div className="divide-y divide-gray-200">
                  {order.items.map((item: OrderItem) => (
                    <div key={item.id} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex items-start space-x-4 space-x-reverse">
                        <Image
                          src={item.product.image || '/images/placeholder.jpg'}
                          alt={item.product.name}
                          width={80}
                          height={80}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-gray-900 mb-1">
                            <Link 
                              href={`/products/${item.product.slug}`}
                              className="hover:text-blue-600 transition-colors"
                            >
                              {item.product.name}
                            </Link>
                          </h3>
                          
                          <p className="text-sm text-gray-600 mb-2">
                            کد محصول: {item.product.code}
                          </p>

                          {item.product.brand && (
                            <p className="text-sm text-gray-600 mb-2">
                              برند: {item.product.brand.name}
                            </p>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                              تعداد: {item.quantity}
                            </div>
                            <div className="text-left">
                              <div className="text-lg font-semibold text-gray-900">
                                {formatPrice(item.price * item.quantity)}
                              </div>
                              <div className="text-sm text-gray-600">
                                {formatPrice(item.price)} × {item.quantity}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Timeline */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  تاریخچه سفارش
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="flex-shrink-0">
                      <CheckCircleIcon className="w-6 h-6 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">سفارش ثبت شد</p>
                      <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>

                  {order.status !== 'pending' && (
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className="flex-shrink-0">
                        <CheckCircleIcon className="w-6 h-6 text-green-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">سفارش تأیید شد</p>
                        <p className="text-sm text-gray-600">{formatDate(order.confirmedAt || order.createdAt)}</p>
                      </div>
                    </div>
                  )}

                  {(order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered') && (
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className="flex-shrink-0">
                        <CheckCircleIcon className="w-6 h-6 text-green-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">در حال پردازش</p>
                        <p className="text-sm text-gray-600">{formatDate(order.processingAt || order.createdAt)}</p>
                      </div>
                    </div>
                  )}

                  {(order.status === 'shipped' || order.status === 'delivered') && (
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className="flex-shrink-0">
                        <CheckCircleIcon className="w-6 h-6 text-green-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">سفارش ارسال شد</p>
                        <p className="text-sm text-gray-600">{formatDate(order.shippedAt || order.createdAt)}</p>
                        {order.trackingNumber && (
                          <p className="text-sm text-blue-600">
                            کد پیگیری: {order.trackingNumber}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {order.status === 'delivered' && (
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className="flex-shrink-0">
                        <CheckCircleIcon className="w-6 h-6 text-green-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">سفارش تحویل داده شد</p>
                        <p className="text-sm text-gray-600">{formatDate(order.deliveredAt || order.createdAt)}</p>
                      </div>
                    </div>
                  )}

                  {order.status === 'cancelled' && (
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className="flex-shrink-0">
                        <XCircleIcon className="w-6 h-6 text-red-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">سفارش لغو شد</p>
                        <p className="text-sm text-gray-600">{formatDate(order.cancelledAt || order.createdAt)}</p>
                        {order.cancelReason && (
                          <p className="text-sm text-red-600">
                            دلیل لغو: {order.cancelReason}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  خلاصه سفارش
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>جمع کل محصولات:</span>
                    <span>{formatPrice(order.subtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-600">
                    <span>هزینه ارسال:</span>
                    <span>
                      {order.shippingCost === 0 ? (
                        <span className="text-green-600">رایگان</span>
                      ) : (
                        formatPrice(order.shippingCost)
                      )}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-gray-600">
                    <span>مالیات:</span>
                    <span>{formatPrice(order.tax)}</span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-semibold text-gray-900">
                      <span>مجموع نهایی:</span>
                      <span>{formatPrice(order.total)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-gray-600 space-y-2">
                  <div className="flex items-center">
                    <CalendarDaysIcon className="w-4 h-4 ml-2" />
                    تاریخ ثبت: {formatDate(order.createdAt)}
                  </div>
                  
                  <div className="flex items-center">
                    <TruckIcon className="w-4 h-4 ml-2" />
                    روش ارسال: {order.shippingMethod === 'express' ? 'ارسال سریع' : 'ارسال عادی'}
                  </div>
                  
                  <div className="flex items-center">
                    {order.paymentMethod === 'online' ? (
                      <CreditCardIcon className="w-4 h-4 ml-2" />
                    ) : (
                      <BanknotesIcon className="w-4 h-4 ml-2" />
                    )}
                    روش پرداخت: {order.paymentMethod === 'online' ? 'پرداخت آنلاین' : 'پرداخت در محل'}
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  اطلاعات مشتری
                </h2>

                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-900">نام:</span>
                    <span className="mr-2 text-gray-600">
                      {order.customerInfo.firstName} {order.customerInfo.lastName}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <EnvelopeIcon className="w-4 h-4 ml-2 text-gray-400" />
                    <span className="text-gray-600">{order.customerInfo.email}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <PhoneIcon className="w-4 h-4 ml-2 text-gray-400" />
                    <span className="text-gray-600">{order.customerInfo.phone}</span>
                  </div>

                  {order.customerInfo.companyName && (
                    <div className="flex items-center">
                      <BuildingOfficeIcon className="w-4 h-4 ml-2 text-gray-400" />
                      <span className="text-gray-600">{order.customerInfo.companyName}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  آدرس ارسال
                </h2>

                <div className="flex items-start space-x-3 space-x-reverse">
                  <MapPinIcon className="w-5 h-5 text-gray-400 mt-1" />
                  <div className="text-sm text-gray-600">
                    <p>{order.shippingAddress.address}</p>
                    <p className="mt-1">
                      {order.shippingAddress.city}، {order.shippingAddress.state}
                    </p>
                    <p className="mt-1">
                      کد پستی: {order.shippingAddress.postalCode}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {order.status === 'pending' && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    عملیات
                  </h2>
                  
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    لغو سفارش
                  </button>
                </div>
              )}

              {order.trackingNumber && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    پیگیری مرسوله
                  </h2>
                  
                  <div className="text-sm text-gray-600 mb-4">
                    <p>کد پیگیری: <span className="font-medium">{order.trackingNumber}</span></p>
                  </div>
                  
                  <button
                    onClick={() => trackOrder(order.trackingNumber!)}
                    className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <EyeIcon className="w-4 h-4 inline ml-2" />
                    پیگیری مرسوله
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-right overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:mr-4 sm:text-right">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      لغو سفارش
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 mb-4">
                        آیا از لغو این سفارش اطمینان دارید؟ این عمل قابل بازگشت نیست.
                      </p>
                      <textarea
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        placeholder="دلیل لغو سفارش را بنویسید..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleCancelOrder}
                  disabled={isCancelling || !cancelReason.trim()}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCancelling ? 'در حال لغو...' : 'لغو سفارش'}
                </button>
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancelReason('');
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:mr-3 sm:w-auto sm:text-sm"
                >
                  انصراف
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default OrderDetailPage;