import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// ترکیب کلاس‌های CSS
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// فرمت کردن قیمت به ریال
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('fa-IR').format(price) + ' ریال'
}

// فرمت کردن قیمت به تومان
export const formatPriceToToman = (price: number): string => {
  return new Intl.NumberFormat('fa-IR').format(Math.floor(price / 10)) + ' تومان'
}

// فرمت کردن تاریخ فارسی
export const formatPersianDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(dateObj)
}

// فرمت کردن تاریخ و زمان فارسی
export const formatPersianDateTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj)
}

// تبدیل متن انگلیسی به فارسی
export const toPersianDigits = (str: string): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  return str.replace(/[0-9]/g, (digit) => persianDigits[parseInt(digit)])
}

// تبدیل متن فارسی به انگلیسی
export const toEnglishDigits = (str: string): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']
  
  let result = str
  
  persianDigits.forEach((digit, index) => {
    result = result.replace(new RegExp(digit, 'g'), index.toString())
  })
  
  arabicDigits.forEach((digit, index) => {
    result = result.replace(new RegExp(digit, 'g'), index.toString())
  })
  
  return result
}

// اعتبارسنجی ایمیل
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// اعتبارسنجی شماره موبایل ایران
export const isValidIranianMobile = (mobile: string): boolean => {
  const mobileRegex = /^(\+98|0)?9\d{9}$/
  return mobileRegex.test(mobile)
}

// تولید شناسه یکتا
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9)
}

// تولید کد سفارش
export const generateOrderCode = (): string => {
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.random().toString(36).substr(2, 4).toUpperCase()
  return `MT${timestamp}${random}`
}

// محاسبه درصد تخفیف
export const calculateDiscountPercentage = (originalPrice: number, salePrice: number): number => {
  if (originalPrice <= salePrice) return 0
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100)
}

// محاسبه مجموع قیمت سبد خرید
export const calculateCartTotal = (items: Array<{ quantity: number; price: number }>): number => {
  return items.reduce((total, item) => total + (item.quantity * item.price), 0)
}

// تبدیل بایت به واحد قابل خواندن
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 بایت'
  
  const k = 1024
  const sizes = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// کوتاه کردن متن
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.substr(0, maxLength) + '...'
}

// حذف تگ‌های HTML از متن
export const stripHtml = (html: string): string => {
  return html.replace(/<[^>]*>/g, '')
}

// تبدیل slug به متن قابل خواندن
export const slugToTitle = (slug: string): string => {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// تبدیل متن به slug
export const titleToSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// تاخیر در اجرا (برای debouncing)
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// debounce تابع
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// throttle تابع
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// کپی متن در کلیپ‌بورد
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error('خطا در کپی کردن:', error)
    return false
  }
}

// بررسی پشتیبانی از WebP
export const supportsWebP = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const webP = new Image()
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2)
    }
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA'
  })
}