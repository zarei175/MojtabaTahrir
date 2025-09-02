'use client'

import { useState, useEffect, useCallback } from 'react'
import { createOrder, getUserOrders } from '@/lib/database'
import { useAuth } from './useAuth'
import { useCart, type CartItem } from './useCart'
import { Order } from '@/types'
import { generateOrderCode } from '@/lib/utils'

interface OrderFormData {
  shipping_address: string
  notes?: string
  payment_method?: string
}

interface OrdersState {
  orders: Order[]
  loading: boolean
  error: string | null
}

interface CreateOrderState {
  loading: boolean
  error: string | null
  success: boolean
}

// Hook اصلی برای مدیریت سفارشات
export function useOrders() {
  const { user } = useAuth()
  const [state, setState] = useState<OrdersState>({
    orders: [],
    loading: false,
    error: null
  })

  // بارگذاری سفارشات کاربر
  const loadOrders = useCallback(async () => {
    if (!user) return

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const result = await getUserOrders(user.id)
      
      if (result.success && result.data) {
        setState({
          orders: result.data,
          loading: false,
          error: null
        })
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: result.error || 'خطا در بارگذاری سفارشات'
        }))
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'خطا در بارگذاری سفارشات'
      }))
    }
  }, [user])

  // بارگذاری اولیه
  useEffect(() => {
    if (user) {
      loadOrders()
    }
  }, [user, loadOrders])

  // رفرش سفارشات
  const refresh = useCallback(() => {
    loadOrders()
  }, [loadOrders])

  return {
    ...state,
    refresh,
    hasOrders: state.orders.length > 0
  }
}

// Hook برای ایجاد سفارش جدید
export function useCreateOrder() {
  const { user } = useAuth()
  const { items: cartItems, totalAmount, clearCart } = useCart()
  const [state, setState] = useState<CreateOrderState>({
    loading: false,
    error: null,
    success: false
  })

  const createNewOrder = useCallback(async (orderData: OrderFormData) => {
    if (!user) {
      setState({
        loading: false,
        error: 'برای ثبت سفارش باید وارد شوید',
        success: false
      })
      return { success: false, error: 'برای ثبت سفارش باید وارد شوید' }
    }

    if (cartItems.length === 0) {
      setState({
        loading: false,
        error: 'سبد خرید خالی است',
        success: false
      })
      return { success: false, error: 'سبد خرید خالی است' }
    }

    setState({
      loading: true,
      error: null,
      success: false
    })

    try {
      const result = await createOrder({
        user_id: user.id,
        items: cartItems,
        total_amount: totalAmount,
        shipping_address: orderData.shipping_address,
        notes: orderData.notes
      })

      if (result.success) {
        // پاک کردن سبد خرید پس از ثبت موفق سفارش
        await clearCart()
        
        setState({
          loading: false,
          error: null,
          success: true
        })

        return { 
          success: true, 
          order: result.data,
          orderCode: generateOrderCode()
        }
      } else {
        setState({
          loading: false,
          error: result.error || 'خطا در ثبت سفارش',
          success: false
        })

        return { success: false, error: result.error }
      }
    } catch (error: any) {
      const errorMessage = error.message || 'خطا در ثبت سفارش'
      
      setState({
        loading: false,
        error: errorMessage,
        success: false
      })

      return { success: false, error: errorMessage }
    }
  }, [user, cartItems, totalAmount, clearCart])

  // ریست کردن وضعیت
  const resetState = useCallback(() => {
    setState({
      loading: false,
      error: null,
      success: false
    })
  }, [])

  return {
    ...state,
    createOrder: createNewOrder,
    resetState,
    canCreateOrder: !!user && cartItems.length > 0
  }
}

// Hook برای جزئیات یک سفارش خاص
export function useOrder(orderId: string) {
  const { orders, loading: ordersLoading } = useOrders()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (orderId && orders.length > 0) {
      const foundOrder = orders.find(o => o.id === orderId)
      setOrder(foundOrder || null)
    }
  }, [orderId, orders])

  return {
    order,
    loading: loading || ordersLoading,
    notFound: !loading && !ordersLoading && !order
  }
}

// Hook برای آمار سفارشات
export function useOrderStats() {
  const { orders, loading } = useOrders()

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    totalAmount: orders.reduce((sum, order) => sum + order.total_amount, 0),
    averageAmount: orders.length > 0 
      ? orders.reduce((sum, order) => sum + order.total_amount, 0) / orders.length 
      : 0
  }

  return {
    stats,
    loading,
    hasOrders: orders.length > 0
  }
}

// Hook برای فیلتر و جستجوی سفارشات
export function useOrderFilters() {
  const { orders } = useOrders()
  const [filters, setFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  })

  const filteredOrders = orders.filter(order => {
    // فیلتر بر اساس وضعیت
    if (filters.status && order.status !== filters.status) {
      return false
    }

    // فیلتر بر اساس تاریخ
    if (filters.dateFrom) {
      const orderDate = new Date(order.created_at)
      const fromDate = new Date(filters.dateFrom)
      if (orderDate < fromDate) return false
    }

    if (filters.dateTo) {
      const orderDate = new Date(order.created_at)
      const toDate = new Date(filters.dateTo)
      if (orderDate > toDate) return false
    }

    // فیلتر بر اساس جستجو (شماره سفارش یا آدرس)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const matchesId = order.id.toLowerCase().includes(searchLower)
      const matchesAddress = order.shipping_address.toLowerCase().includes(searchLower)
      
      if (!matchesId && !matchesAddress) return false
    }

    return true
  })

  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      status: '',
      dateFrom: '',
      dateTo: '',
      search: ''
    })
  }

  return {
    filters,
    filteredOrders,
    updateFilter,
    clearFilters,
    hasActiveFilters: Object.values(filters).some(value => value !== '')
  }
}

// Hook برای تکرار سفارش
export function useReorderItems() {
  const { addItem } = useCart()
  const [loading, setLoading] = useState(false)

  const reorderItems = useCallback(async (order: Order) => {
    if (!order.order_items || order.order_items.length === 0) {
      return { success: false, error: 'آیتم‌های سفارش یافت نشد' }
    }

    setLoading(true)
    
    try {
      const addPromises = order.order_items.map(item => {
        if (item.products) {
          return addItem(item.products as any, item.quantity, item.price)
        }
        return Promise.resolve({ success: false, error: 'اطلاعات محصول یافت نشد' })
      })

      const results = await Promise.all(addPromises)
      const failedItems = results.filter(result => !result.success)

      if (failedItems.length === 0) {
        return { success: true, message: 'تمام آیتم‌ها به سبد خرید اضافه شدند' }
      } else {
        return { 
          success: false, 
          error: `${failedItems.length} آیتم اضافه نشد` 
        }
      }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'خطا در افزودن آیتم‌ها به سبد خرید' 
      }
    } finally {
      setLoading(false)
    }
  }, [addItem])

  return {
    reorderItems,
    loading
  }
}