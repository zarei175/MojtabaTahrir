import { supabase } from './supabase'
import { Product, Category, Brand, CartItem, Order } from '@/types'

// دریافت تمام دسته‌بندی‌ها
export const getCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'خطا در دریافت دسته‌بندی‌ها'
    }
  }
}

// دریافت تمام برندها
export const getBrands = async () => {
  try {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'خطا در دریافت برندها'
    }
  }
}

// دریافت محصولات با فیلتر
export const getProducts = async (filters?: {
  category_id?: string
  brand_id?: string
  search?: string
  limit?: number
  offset?: number
}) => {
  try {
    let query = supabase
      .from('products')
      .select(`
        *,
        categories(name),
        brands(name),
        product_prices(*),
        inventory(*)
      `)
      .eq('is_active', true)

    if (filters?.category_id) {
      query = query.eq('category_id', filters.category_id)
    }

    if (filters?.brand_id) {
      query = query.eq('brand_id', filters.brand_id)
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }

    const { data, error } = await query.order('name')

    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'خطا در دریافت محصولات'
    }
  }
}

// دریافت جزئیات یک محصول
export const getProduct = async (productId: string) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories(name),
        brands(name),
        product_prices(*),
        inventory(*)
      `)
      .eq('id', productId)
      .eq('is_active', true)
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'خطا در دریافت اطلاعات محصول'
    }
  }
}

// دریافت سبد خرید کاربر
export const getCart = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        products(
          *,
          categories(name),
          brands(name),
          product_prices(*),
          inventory(*)
        )
      `)
      .eq('user_id', userId)

    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'خطا در دریافت سبد خرید'
    }
  }
}

// افزودن محصول به سبد خرید
export const addToCart = async (cartItem: {
  user_id: string
  product_id: string
  quantity: number
  price: number
}) => {
  try {
    // بررسی وجود محصول در سبد
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', cartItem.user_id)
      .eq('product_id', cartItem.product_id)
      .single()

    if (existingItem) {
      // بروزرسانی تعداد
      const { data, error } = await supabase
        .from('cart_items')
        .update({
          quantity: existingItem.quantity + cartItem.quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingItem.id)
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } else {
      // افزودن محصول جدید
      const { data, error } = await supabase
        .from('cart_items')
        .insert(cartItem)
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'خطا در افزودن به سبد خرید'
    }
  }
}

// حذف محصول از سبد خرید
export const removeFromCart = async (cartItemId: string) => {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId)

    if (error) throw error
    return { success: true }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'خطا در حذف از سبد خرید'
    }
  }
}

// بروزرسانی تعداد محصول در سبد
export const updateCartQuantity = async (cartItemId: string, quantity: number) => {
  try {
    const { data, error } = await supabase
      .from('cart_items')
      .update({
        quantity,
        updated_at: new Date().toISOString()
      })
      .eq('id', cartItemId)
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'خطا در بروزرسانی سبد خرید'
    }
  }
}

// ایجاد سفارش جدید
export const createOrder = async (orderData: {
  user_id: string
  items: CartItem[]
  total_amount: number
  shipping_address: string
  notes?: string
}) => {
  try {
    // ایجاد سفارش
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: orderData.user_id,
        total_amount: orderData.total_amount,
        shipping_address: orderData.shipping_address,
        notes: orderData.notes,
        status: 'pending'
      })
      .select()
      .single()

    if (orderError) throw orderError

    // افزودن آیتم‌های سفارش
    const orderItems = orderData.items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) throw itemsError

    // پاک کردن سبد خرید
    const { error: clearCartError } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', orderData.user_id)

    if (clearCartError) throw clearCartError

    return { success: true, data: order }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'خطا در ایجاد سفارش'
    }
  }
}

// دریافت سفارشات کاربر
export const getUserOrders = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(
          *,
          products(name, sku)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'خطا در دریافت سفارشات'
    }
  }
}