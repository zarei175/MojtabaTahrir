// اطلاعات پروژه
export const PROJECT_INFO = {
  name: 'مجتبی تحریر',
  description: 'فروشگاه آنلاین لوازم التحریر و نوشت‌افزار',
  version: '1.0.0',
  author: 'تیم توسعه مجتبی تحریر'
} as const

// اطلاعات تماس
export const CONTACT_INFO = {
  phone: '021-12345678',
  mobile: '09123456789',
  email: 'info@mojtabatahrir.com',
  address: 'تهران، خیابان انقلاب، نرسیده به چهارراه کالج، پلاک ۱۲۳',
  workingHours: {
    weekdays: 'شنبه تا پنج‌شنبه: ۸:۰۰ - ۱۸:۰۰',
    friday: 'جمعه: ۹:۰۰ - ۱۳:۰۰'
  }
} as const

// رنگ‌های دسته‌بندی‌ها
export const CATEGORY_COLORS = {
  'cat_001': 'bg-red-100 text-red-800',      // مداد و مداد رنگی
  'cat_002': 'bg-blue-100 text-blue-800',    // خودکار و روان‌نویس
  'cat_003': 'bg-green-100 text-green-800',  // کاغذ و دفتر
  'cat_004': 'bg-purple-100 text-purple-800', // لوازم هنری
  'cat_005': 'bg-yellow-100 text-yellow-800', // لوازم اداری
  default: 'bg-gray-100 text-gray-800'
} as const

// آیکون‌های دسته‌بندی‌ها
export const CATEGORY_ICONS = {
  'cat_001': '✏️', // مداد و مداد رنگی
  'cat_002': '🖊️', // خودکار و روان‌نویس
  'cat_003': '📄', // کاغذ و دفتر
  'cat_004': '🎨', // لوازم هنری
  'cat_005': '📎', // لوازم اداری
  default: '📦'
} as const

// وضعیت‌های سفارش
export const ORDER_STATUS = {
  pending: 'در انتظار تایید',
  confirmed: 'تایید شده',
  processing: 'در حال آماده‌سازی',
  shipped: 'ارسال شده',
  delivered: 'تحویل داده شده',
  cancelled: 'لغو شده',
  returned: 'مرجوع شده'
} as const

// رنگ‌های وضعیت سفارش
export const ORDER_STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-orange-100 text-orange-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  returned: 'bg-gray-100 text-gray-800'
} as const

// انواع کاربر
export const USER_TYPES = {
  b2b: 'عمده',
  b2c: 'تکی'
} as const

// حداقل تعداد برای خرید عمده
export const WHOLESALE_MIN_QUANTITY = 10

// حداکثر تعداد آیتم در سبد خرید
export const MAX_CART_ITEMS = 100

// حداکثر تعداد هر محصول در سبد
export const MAX_PRODUCT_QUANTITY = 1000

// تنظیمات صفحه‌بندی
export const PAGINATION = {
  defaultLimit: 12,
  maxLimit: 100,
  pageSizes: [12, 24, 48, 96]
} as const

// تنظیمات جستجو
export const SEARCH_CONFIG = {
  minLength: 2,
  debounceDelay: 300,
  maxResults: 50
} as const

// تنظیمات فایل
export const FILE_CONFIG = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp']
} as const

// پیام‌های خطا
export const ERROR_MESSAGES = {
  network: 'خطا در اتصال به شبکه',
  server: 'خطا در سرور',
  notFound: 'موردی یافت نشد',
  unauthorized: 'دسترسی غیرمجاز',
  validation: 'اطلاعات وارد شده صحیح نیست',
  fileSize: 'حجم فایل بیش از حد مجاز است',
  fileType: 'نوع فایل پشتیبانی نمی‌شود'
} as const

// پیام‌های موفقیت
export const SUCCESS_MESSAGES = {
  login: 'با موفقیت وارد شدید',
  logout: 'با موفقیت خارج شدید',
  register: 'ثبت نام با موفقیت انجام شد',
  update: 'اطلاعات با موفقیت بروزرسانی شد',
  delete: 'با موفقیت حذف شد',
  addToCart: 'محصول به سبد خرید اضافه شد',
  removeFromCart: 'محصول از سبد خرید حذف شد',
  orderCreated: 'سفارش با موفقیت ثبت شد'
} as const

// تنظیمات کش
export const CACHE_CONFIG = {
  products: 5 * 60 * 1000,      // 5 دقیقه
  categories: 30 * 60 * 1000,   // 30 دقیقه
  brands: 30 * 60 * 1000,       // 30 دقیقه
  prices: 2 * 60 * 1000,        // 2 دقیقه
  inventory: 1 * 60 * 1000      // 1 دقیقه
} as const

// تنظیمات همگام‌سازی با کارا
export const KARA_SYNC_CONFIG = {
  interval: 5 * 60 * 1000,      // 5 دقیقه
  retryAttempts: 3,
  retryDelay: 10 * 1000,        // 10 ثانیه
  timeout: 30 * 1000           // 30 ثانیه
} as const

// URL های مهم
export const URLS = {
  home: '/',
  products: '/products',
  categories: '/categories',
  brands: '/brands',
  cart: '/cart',
  checkout: '/checkout',
  orders: '/orders',
  profile: '/profile',
  login: '/auth/login',
  register: '/auth/register'
} as const

// کلیدهای localStorage
export const STORAGE_KEYS = {
  cart: 'mojtaba-tahrir-cart',
  wishlist: 'mojtaba-tahrir-wishlist',
  user: 'mojtaba-tahrir-user',
  theme: 'mojtaba-tahrir-theme',
  language: 'mojtaba-tahrir-language'
} as const

// تنظیمات SEO
export const SEO_CONFIG = {
  defaultTitle: 'مجتبی تحریر - فروشگاه لوازم التحریر',
  titleTemplate: '%s | مجتبی تحریر',
  defaultDescription: 'فروشگاه آنلاین لوازم التحریر و نوشت‌افزار با بهترین قیمت و کیفیت',
  keywords: 'لوازم التحریر، نوشت افزار، مداد، خودکار، کاغذ، دفتر، فروش عمده',
  author: 'مجتبی تحریر',
  siteUrl: 'https://mojtabatahrir.com'
} as const

// تنظیمات شبکه‌های اجتماعی
export const SOCIAL_LINKS = {
  telegram: 'https://t.me/mojtabatahrir',
  instagram: 'https://instagram.com/mojtabatahrir',
  whatsapp: 'https://wa.me/989123456789'
} as const