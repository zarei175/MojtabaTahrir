// تایپ‌های مربوط به API کارا
export interface KaraApiResponse<T> {
  success: boolean
  data: T[]
  total?: number
  timestamp: string
}

export interface KaraCategory {
  id: string
  name: string
  parent_id: string | null
  description: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface KaraBrand {
  id: string
  name: string
  description: string
  country: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface KaraProduct {
  id: string
  name: string
  sku: string
  barcode: string
  description: string
  category_id: string
  brand_id: string | null
  is_active: boolean
  weight: number
  dimensions: string
  created_at: string
  updated_at: string
}

export interface KaraPrice {
  product_id: string
  price_type: 'wholesale' | 'retail'
  price: number
  compare_price: number
  min_quantity: number
  effective_from: string
}

export interface KaraInventory {
  product_id: string
  warehouse_id: string
  quantity: number
  reserved_quantity: number
  min_stock_level: number
  last_updated: string
}

class KaraAPI {
  private baseUrl: string
  private apiKey: string

  constructor() {
    this.baseUrl = process.env.KARA_API_URL || 'http://localhost:3001/api'
    this.apiKey = process.env.KARA_API_KEY || ''
  }

  // متد عمومی برای درخواست‌ها
  private async request<T>(endpoint: string): Promise<KaraApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}/${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error(`خطا در درخواست ${endpoint}:`, error)
      throw error
    }
  }

  // بررسی وضعیت سرور کارا
  async healthCheck(): Promise<{ success: boolean; message: string; version: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/health`)
      const data = await response.json()
      return data
    } catch (error) {
      console.error('خطا در بررسی وضعیت سرور کارا:', error)
      return {
        success: false,
        message: 'عدم دسترسی به سرور کارا',
        version: 'unknown'
      }
    }
  }

  // دریافت دسته‌بندی‌ها از کارا
  async getCategories(): Promise<KaraCategory[]> {
    try {
      const response = await this.request<KaraCategory>('categories')
      return response.data
    } catch (error) {
      console.error('خطا در دریافت دسته‌بندی‌ها از کارا:', error)
      return []
    }
  }

  // دریافت برندها از کارا
  async getBrands(): Promise<KaraBrand[]> {
    try {
      const response = await this.request<KaraBrand>('brands')
      return response.data
    } catch (error) {
      console.error('خطا در دریافت برندها از کارا:', error)
      return []
    }
  }

  // دریافت محصولات از کارا
  async getProducts(filters?: {
    category_id?: string
    brand_id?: string
    search?: string
  }): Promise<KaraProduct[]> {
    try {
      let endpoint = 'products'
      
      if (filters) {
        const params = new URLSearchParams()
        if (filters.category_id) params.append('category_id', filters.category_id)
        if (filters.brand_id) params.append('brand_id', filters.brand_id)
        if (filters.search) params.append('search', filters.search)
        
        if (params.toString()) {
          endpoint += `?${params.toString()}`
        }
      }

      const response = await this.request<KaraProduct>(endpoint)
      return response.data
    } catch (error) {
      console.error('خطا در دریافت محصولات از کارا:', error)
      return []
    }
  }

  // دریافت قیمت‌ها از کارا
  async getPrices(productIds?: string[]): Promise<KaraPrice[]> {
    try {
      let endpoint = 'prices'
      
      if (productIds && productIds.length > 0) {
        endpoint += `?product_ids=${productIds.join(',')}`
      }

      const response = await this.request<KaraPrice>(endpoint)
      return response.data
    } catch (error) {
      console.error('خطا در دریافت قیمت‌ها از کارا:', error)
      return []
    }
  }

  // دریافت موجودی از کارا
  async getInventory(productIds?: string[]): Promise<KaraInventory[]> {
    try {
      let endpoint = 'inventory'
      
      if (productIds && productIds.length > 0) {
        endpoint += `?product_ids=${productIds.join(',')}`
      }

      const response = await this.request<KaraInventory>(endpoint)
      return response.data
    } catch (error) {
      console.error('خطا در دریافت موجودی از کارا:', error)
      return []
    }
  }

  // همگام‌سازی کامل داده‌ها
  async syncAllData(): Promise<{
    categories: KaraCategory[]
    brands: KaraBrand[]
    products: KaraProduct[]
    prices: KaraPrice[]
    inventory: KaraInventory[]
  }> {
    try {
      const [categories, brands, products, prices, inventory] = await Promise.all([
        this.getCategories(),
        this.getBrands(),
        this.getProducts(),
        this.getPrices(),
        this.getInventory()
      ])

      return {
        categories,
        brands,
        products,
        prices,
        inventory
      }
    } catch (error) {
      console.error('خطا در همگام‌سازی داده‌ها:', error)
      throw error
    }
  }
}

// نمونه singleton از کلاس KaraAPI
export const karaApi = new KaraAPI()

// تابع کمکی برای بررسی دسترسی به کارا
export const checkKaraConnection = async (): Promise<boolean> => {
  try {
    const health = await karaApi.healthCheck()
    return health.success
  } catch (error) {
    return false
  }
}

// تابع کمکی برای دریافت قیمت محصول بر اساس نوع کاربر
export const getProductPrice = (
  prices: KaraPrice[],
  productId: string,
  userType: 'b2b' | 'b2c'
): KaraPrice | null => {
  const productPrices = prices.filter(p => p.product_id === productId)
  
  if (userType === 'b2b') {
    return productPrices.find(p => p.price_type === 'wholesale') || null
  } else {
    return productPrices.find(p => p.price_type === 'retail') || null
  }
}

// تابع کمکی برای بررسی موجودی محصول
export const checkProductAvailability = (
  inventory: KaraInventory[],
  productId: string,
  requestedQuantity: number
): boolean => {
  const productInventory = inventory.find(i => i.product_id === productId)
  
  if (!productInventory) return false
  
  const availableQuantity = productInventory.quantity - productInventory.reserved_quantity
  return availableQuantity >= requestedQuantity
}