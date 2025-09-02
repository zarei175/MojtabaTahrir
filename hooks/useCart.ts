'use client'

import { useState, useEffect, useContext, createContext, ReactNode } from 'react'
import { 
  getCart, 
  addToCart as addToCartDB, 
  removeFromCart as removeFromCartDB, 
  updateCartQuantity as updateCartQuantityDB 
} from '@/lib/database'
import { useAuth } from './useAuth'
import { Product } from '@/types'
import { STORAGE_KEYS, MAX_CART_ITEMS, MAX_PRODUCT_QUANTITY } from '@/lib/constants'

export interface CartItem {
  id: string
  user_id: string
  product_id: string
  quantity: number
  price: number
  created_at: string
  updated_at: string
  product?: Product
}

interface CartContextType {
  items: CartItem[]
  loading: boolean
  totalItems: number
  totalAmount: number
  addItem: (product: Product, quantity: number, price: number) => Promise<{ success: boolean; error?: string }>
  removeItem: (cartItemId: string) => Promise<{ success: boolean; error?: string }>
  updateQuantity: (cartItemId: string, quantity: number) => Promise<{ success: boolean; error?: string }>
  clearCart: () => Promise<{ success: boolean; error?: string }>
  refreshCart: () => Promise<void>
  isInCart: (productId: string) => boolean
  getItemQuantity: (productId: string) => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

// Provider کامپوننت
export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)

  // محاسبه مقادیر
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.price), 0)

  // بارگذاری سبد خرید
  const loadCart = async () => {
    if (!user) {
      // برای کاربران مهمان، از localStorage استفاده کن
      const savedCart = localStorage.getItem(STORAGE_KEYS.cart)
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart)
          setItems(parsedCart)
        } catch (error) {
          console.error('خطا در بارگذاری سبد خرید از localStorage:', error)
        }
      }
      return
    }

    setLoading(true)
    try {
      const result = await getCart(user.id)
      if (result.success && result.data) {
        setItems(result.data)
      }
    } catch (error) {
      console.error('خطا در بارگذاری سبد خرید:', error)
    } finally {
      setLoading(false)
    }
  }

  // ذخیره در localStorage برای کاربران مهمان
  const saveToLocalStorage = (cartItems: CartItem[]) => {
    if (!user) {
      localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cartItems))
    }
  }

  // بارگذاری اولیه
  useEffect(() => {
    loadCart()
  }, [user])

  // افزودن محصول به سبد
  const addItem = async (product: Product, quantity: number, price: number) => {
    // بررسی محدودیت‌ها
    if (items.length >= MAX_CART_ITEMS) {
      return {
        success: false,
        error: `حداکثر ${MAX_CART_ITEMS} آیتم در سبد خرید مجاز است`
      }
    }

    if (quantity > MAX_PRODUCT_QUANTITY) {
      return {
        success: false,
        error: `حداکثر تعداد مجاز برای هر محصول ${MAX_PRODUCT_QUANTITY} عدد است`
      }
    }

    if (!user) {
      // برای کاربران مهمان
      const existingItemIndex = items.findIndex(item => item.product_id === product.id)
      let newItems: CartItem[]

      if (existingItemIndex >= 0) {
        // بروزرسانی تعداد
        newItems = [...items]
        newItems[existingItemIndex].quantity += quantity
      } else {
        // افزودن آیتم جدید
        const newItem: CartItem = {
          id: `temp_${Date.now()}`,
          user_id: 'guest',
          product_id: product.id,
          quantity,
          price,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          product
        }
        newItems = [...items, newItem]
      }

      setItems(newItems)
      saveToLocalStorage(newItems)
      
      return { success: true }
    }

    // برای کاربران وارد شده
    setLoading(true)
    try {
      const result = await addToCartDB({
        user_id: user.id,
        product_id: product.id,
        quantity,
        price
      })

      if (result.success) {
        await loadCart() // بارگذاری مجدد سبد
      }

      return result
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'خطا در افزودن به سبد خرید'
      }
    } finally {
      setLoading(false)
    }
  }

  // حذف محصول از سبد
  const removeItem = async (cartItemId: string) => {
    if (!user) {
      // برای کاربران مهمان
      const newItems = items.filter(item => item.id !== cartItemId)
      setItems(newItems)
      saveToLocalStorage(newItems)
      return { success: true }
    }

    setLoading(true)
    try {
      const result = await removeFromCartDB(cartItemId)
      
      if (result.success) {
        await loadCart()
      }

      return result
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'خطا در حذف از سبد خرید'
      }
    } finally {
      setLoading(false)
    }
  }

  // بروزرسانی تعداد
  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      return removeItem(cartItemId)
    }

    if (quantity > MAX_PRODUCT_QUANTITY) {
      return {
        success: false,
        error: `حداکثر تعداد مجاز ${MAX_PRODUCT_QUANTITY} عدد است`
      }
    }

    if (!user) {
      // برای کاربران مهمان
      const newItems = items.map(item => 
        item.id === cartItemId 
          ? { ...item, quantity, updated_at: new Date().toISOString() }
          : item
      )
      setItems(newItems)
      saveToLocalStorage(newItems)
      return { success: true }
    }

    setLoading(true)
    try {
      const result = await updateCartQuantityDB(cartItemId, quantity)
      
      if (result.success) {
        await loadCart()
      }

      return result
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'خطا در بروزرسانی سبد خرید'
      }
    } finally {
      setLoading(false)
    }
  }

  // پاک کردن سبد خرید
  const clearCart = async () => {
    if (!user) {
      setItems([])
      localStorage.removeItem(STORAGE_KEYS.cart)
      return { success: true }
    }

    setLoading(true)
    try {
      // حذف تمام آیتم‌ها
      const deletePromises = items.map(item => removeFromCartDB(item.id))
      await Promise.all(deletePromises)
      
      setItems([])
      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'خطا در پاک کردن سبد خرید'
      }
    } finally {
      setLoading(false)
    }
  }

  // بروزرسانی سبد خرید
  const refreshCart = async () => {
    await loadCart()
  }

  // بررسی وجود محصول در سبد
  const isInCart = (productId: string): boolean => {
    return items.some(item => item.product_id === productId)
  }

  // دریافت تعداد محصول در سبد
  const getItemQuantity = (productId: string): number => {
    const item = items.find(item => item.product_id === productId)
    return item?.quantity || 0
  }

  const value: CartContextType = {
    items,
    loading,
    totalItems,
    totalAmount,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    refreshCart,
    isInCart,
    getItemQuantity
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

// Hook اصلی
export function useCart() {
  const context = useContext(CartContext)
  
  if (context === undefined) {
    throw new Error('useCart باید درون CartProvider استفاده شود')
  }
  
  return context
}

// Hook ساده برای نمایش اطلاعات سبد
export function useCartSummary() {
  const { items, totalItems, totalAmount, loading } = useCart()
  
  return {
    itemCount: totalItems,
    totalAmount,
    isEmpty: items.length === 0,
    loading,
    items: items.slice(0, 3) // نمایش 3 آیتم اول برای پیش‌نمایش
  }
}

// Hook برای مدیریت محصول خاص در سبد
export function useCartItem(productId: string) {
  const { items, addItem, removeItem, updateQuantity, isInCart, getItemQuantity } = useCart()
  
  const cartItem = items.find(item => item.product_id === productId)
  
  const incrementQuantity = async () => {
    if (cartItem) {
      return updateQuantity(cartItem.id, cartItem.quantity + 1)
    }
  }
  
  const decrementQuantity = async () => {
    if (cartItem && cartItem.quantity > 1) {
      return updateQuantity(cartItem.id, cartItem.quantity - 1)
    } else if (cartItem) {
      return removeItem(cartItem.id)
    }
  }
  
  return {
    cartItem,
    isInCart: isInCart(productId),
    quantity: getItemQuantity(productId),
    incrementQuantity,
    decrementQuantity,
    removeFromCart: cartItem ? () => removeItem(cartItem.id) : undefined
  }
}