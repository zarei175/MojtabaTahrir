'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { getProducts, getProduct, getCategories, getBrands } from '@/lib/database'
import { karaApi, type KaraProduct, type KaraPrice, type KaraInventory } from '@/lib/kara-api'
import { Product, Category, Brand } from '@/types'
import { PAGINATION, CACHE_CONFIG } from '@/lib/constants'
import { useAuth } from './useAuth'

interface ProductFilters {
  category_id?: string
  brand_id?: string
  search?: string
  price_min?: number
  price_max?: number
  in_stock?: boolean
}

interface ProductsState {
  products: Product[]
  loading: boolean
  error: string | null
  hasMore: boolean
  total: number
}

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiry: number
}

// کش ساده برای داده‌ها
class SimpleCache {
  private cache = new Map<string, CacheEntry<any>>()

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry || Date.now() > entry.expiry) {
      this.cache.delete(key)
      return null
    }
    return entry.data
  }

  clear() {
    this.cache.clear()
  }
}

const cache = new SimpleCache()

// Hook اصلی برای محصولات
export function useProducts(filters: ProductFilters = {}, options: {
  limit?: number
  autoLoad?: boolean
  useKara?: boolean
} = {}) {
  const { limit = PAGINATION.defaultLimit, autoLoad = true, useKara = false } = options
  
  const [state, setState] = useState<ProductsState>({
    products: [],
    loading: false,
    error: null,
    hasMore: true,
    total: 0
  })
  
  const [offset, setOffset] = useState(0)

  // تولید کلید کش
  const cacheKey = useMemo(() => {
    return `products_${JSON.stringify(filters)}_${limit}_${offset}_${useKara}`
  }, [filters, limit, offset, useKara])

  // بارگذاری محصولات
  const loadProducts = useCallback(async (reset = false) => {
    const currentOffset = reset ? 0 : offset
    
    // بررسی کش
    if (!reset) {
      const cachedData = cache.get<ProductsState>(cacheKey)
      if (cachedData) {
        setState(cachedData)
        return
      }
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      let result

      if (useKara) {
        // استفاده از API کارا
        const karaProducts = await karaApi.getProducts({
          category_id: filters.category_id,
          brand_id: filters.brand_id,
          search: filters.search
        })
        
        result = {
          success: true,
          data: karaProducts.slice(currentOffset, currentOffset + limit)
        }
      } else {
        // استفاده از پایگاه داده محلی
        result = await getProducts({
          ...filters,
          limit,
          offset: currentOffset
        })
      }

      if (result.success && result.data) {
        const newProducts = result.data
        
        setState(prev => ({
          products: reset ? newProducts : [...prev.products, ...newProducts],
          loading: false,
          error: null,
          hasMore: newProducts.length === limit,
          total: reset ? newProducts.length : prev.total + newProducts.length
        }))

        // ذخیره در کش
        cache.set(cacheKey, {
          products: reset ? newProducts : [...state.products, ...newProducts],
          loading: false,
          error: null,
          hasMore: newProducts.length === limit,
          total: reset ? newProducts.length : state.total + newProducts.length
        }, CACHE_CONFIG.products)

        if (reset) {
          setOffset(limit)
        } else {
          setOffset(prev => prev + limit)
        }
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: result.error || 'خطا در بارگذاری محصولات'
        }))
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'خطا در بارگذاری محصولات'
      }))
    }
  }, [filters, limit, offset, useKara, cacheKey])

  // بارگذاری اولیه
  useEffect(() => {
    if (autoLoad) {
      loadProducts(true)
    }
  }, [filters, useKara]) // فقط وقتی فیلترها تغییر کنند

  // بارگذاری صفحه بعدی
  const loadMore = useCallback(() => {
    if (!state.loading && state.hasMore) {
      loadProducts(false)
    }
  }, [loadProducts, state.loading, state.hasMore])

  // رفرش محصولات
  const refresh = useCallback(() => {
    setOffset(0)
    loadProducts(true)
  }, [loadProducts])

  return {
    ...state,
    loadMore,
    refresh,
    canLoadMore: !state.loading && state.hasMore
  }
}

// Hook برای یک محصول خاص
export function useProduct(productId: string, useKara = false) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!productId) return

    const loadProduct = async () => {
      // بررسی کش
      const cacheKey = `product_${productId}_${useKara}`
      const cachedProduct = cache.get<Product>(cacheKey)
      if (cachedProduct) {
        setProduct(cachedProduct)
        return
      }

      setLoading(true)
      setError(null)

      try {
        if (useKara) {
          // استفاده از API کارا
          const karaProducts = await karaApi.getProducts()
          const foundProduct = karaProducts.find(p => p.id === productId)
          
          if (foundProduct) {
            setProduct(foundProduct as any) // تبدیل نوع
            cache.set(cacheKey, foundProduct as any, CACHE_CONFIG.products)
          } else {
            setError('محصول یافت نشد')
          }
        } else {
          // استفاده از پایگاه داده محلی
          const result = await getProduct(productId)
          
          if (result.success && result.data) {
            setProduct(result.data)
            cache.set(cacheKey, result.data, CACHE_CONFIG.products)
          } else {
            setError(result.error || 'محصول یافت نشد')
          }
        }
      } catch (error: any) {
        setError(error.message || 'خطا در بارگذاری محصول')
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [productId, useKara])

  return { product, loading, error }
}

// Hook برای دسته‌بندی‌ها
export function useCategories(useKara = false) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadCategories = async () => {
      // بررسی کش
      const cacheKey = `categories_${useKara}`
      const cachedCategories = cache.get<Category[]>(cacheKey)
      if (cachedCategories) {
        setCategories(cachedCategories)
        return
      }

      setLoading(true)
      setError(null)

      try {
        if (useKara) {
          const karaCategories = await karaApi.getCategories()
          setCategories(karaCategories as any)
          cache.set(cacheKey, karaCategories as any, CACHE_CONFIG.categories)
        } else {
          const result = await getCategories()
          
          if (result.success && result.data) {
            setCategories(result.data)
            cache.set(cacheKey, result.data, CACHE_CONFIG.categories)
          } else {
            setError(result.error || 'خطا در بارگذاری دسته‌بندی‌ها')
          }
        }
      } catch (error: any) {
        setError(error.message || 'خطا در بارگذاری دسته‌بندی‌ها')
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
  }, [useKara])

  return { categories, loading, error }
}

// Hook برای برندها
export function useBrands(useKara = false) {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadBrands = async () => {
      // بررسی کش
      const cacheKey = `brands_${useKara}`
      const cachedBrands = cache.get<Brand[]>(cacheKey)
      if (cachedBrands) {
        setBrands(cachedBrands)
        return
      }

      setLoading(true)
      setError(null)

      try {
        if (useKara) {
          const karaBrands = await karaApi.getBrands()
          setBrands(karaBrands as any)
          cache.set(cacheKey, karaBrands as any, CACHE_CONFIG.brands)
        } else {
          const result = await getBrands()
          
          if (result.success && result.data) {
            setBrands(result.data)
            cache.set(cacheKey, result.data, CACHE_CONFIG.brands)
          } else {
            setError(result.error || 'خطا در بارگذاری برندها')
          }
        }
      } catch (error: any) {
        setError(error.message || 'خطا در بارگذاری برندها')
      } finally {
        setLoading(false)
      }
    }

    loadBrands()
  }, [useKara])

  return { brands, loading, error }
}

// Hook برای جستجوی محصولات
export function useProductSearch(initialQuery = '') {
  const [query, setQuery] = useState(initialQuery)
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery)
  const { user } = useAuth()

  // Debounce برای جستجو
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // استفاده از hook محصولات با فیلتر جستجو
  const productsResult = useProducts(
    { search: debouncedQuery },
    { autoLoad: debouncedQuery.length >= 2 }
  )

  return {
    query,
    setQuery,
    ...productsResult,
    isSearching: query !== debouncedQuery || productsResult.loading
  }
}

// Hook برای محصولات پیشنهادی
export function useRecommendedProducts(productId?: string, limit = 4) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadRecommended = async () => {
      setLoading(true)
      
      try {
        // در حال حاضر محصولات تصادفی برمی‌گرداند
        // در آینده می‌توان الگوریتم پیشنهاد پیچیده‌تری پیاده‌سازی کرد
        const result = await getProducts({ limit })
        
        if (result.success && result.data) {
          setProducts(result.data)
        }
      } catch (error) {
        console.error('خطا در بارگذاری محصولات پیشنهادی:', error)
      } finally {
        setLoading(false)
      }
    }

    loadRecommended()
  }, [productId, limit])

  return { products, loading }
}

// Hook برای قیمت‌گذاری بر اساس نوع کاربر
export function useProductPricing(productId: string) {
  const { user } = useAuth()
  const [pricing, setPricing] = useState<{
    price: number
    comparePrice?: number
    minQuantity: number
    priceType: 'wholesale' | 'retail'
  } | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!productId) return

    const loadPricing = async () => {
      setLoading(true)
      
      try {
        const prices = await karaApi.getPrices([productId])
        const userType = user?.user_type || 'b2c'
        
        const relevantPrice = prices.find(p => 
          p.product_id === productId && 
          p.price_type === (userType === 'b2b' ? 'wholesale' : 'retail')
        )

        if (relevantPrice) {
          setPricing({
            price: relevantPrice.price,
            comparePrice: relevantPrice.compare_price,
            minQuantity: relevantPrice.min_quantity,
            priceType: relevantPrice.price_type
          })
        }
      } catch (error) {
        console.error('خطا در بارگذاری قیمت:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPricing()
  }, [productId, user?.user_type])

  return { pricing, loading }
}