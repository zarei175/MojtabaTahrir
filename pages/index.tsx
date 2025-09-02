'use client';

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ChevronLeftIcon,
  ChevronRightIcon,
  StarIcon,
  ShoppingCartIcon,
  HeartIcon,
  EyeIcon,
  TruckIcon,
  ShieldCheckIcon,
  PhoneIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import Layout from '../components/layout/Layout';
import ProductCard from '../components/product/ProductCard';
import CategoryCard from '../components/category/CategoryCard';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { formatPrice } from '../utils/formatters';
import { Product, Category } from '../types';

const HomePage: React.FC = () => {
  const { products, featuredProducts, isLoading: productsLoading } = useProducts();
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState<'featured' | 'newest' | 'bestseller'>('featured');

  // Hero Slider Data
  const heroSlides = [
    {
      id: 1,
      title: 'مجموعه کامل لوازم التحریر',
      subtitle: 'بهترین کیفیت با قیمت مناسب',
      description: 'تمام نیازهای اداری و تحصیلی خود را از ما تهیه کنید',
      image: '/images/hero/slide-1.jpg',
      buttonText: 'مشاهده محصولات',
      buttonLink: '/products',
      badge: 'تخفیف ویژه'
    },
    {
      id: 2,
      title: 'فروش عمده با تخفیف استثنایی',
      subtitle: 'ویژه مشتریان عمده و سازمانی',
      description: 'قیمت‌های ویژه برای خرید بالای ۵ میلیون تومان',
      image: '/images/hero/slide-2.jpg',
      buttonText: 'درخواست قیمت عمده',
      buttonLink: '/wholesale',
      badge: 'B2B'
    },
    {
      id: 3,
      title: 'ارسال رایگان در سراسر کشور',
      subtitle: 'برای خریدهای بالای ۵۰۰ هزار تومان',
      description: 'تحویل سریع و امن تا درب منزل',
      image: '/images/hero/slide-3.jpg',
      buttonText: 'شروع خرید',
      buttonLink: '/products',
      badge: 'ارسال رایگان'
    }
  ];

  // Auto slide
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [heroSlides.length]);

  // Handle add to cart
  const handleAddToCart = async (product: Product) => {
    try {
      await addToCart(product, 1);
    } catch (error) {
      console.error('خطا در افزودن به سبد خرید:', error);
    }
  };

  // Handle wishlist toggle
  const handleWishlistToggle = async (product: Product) => {
    try {
      if (isInWishlist(product.id)) {
        await removeFromWishlist(product.id);
      } else {
        await addToWishlist(product);
      }
    } catch (error) {
      console.error('خطا در مدیریت لیست علاقه‌مندی‌ها:', error);
    }
  };

  return (
    <>
      <Head>
        <title>مجتبی تحریر - فروشگاه آنلاین لوازم التحریر و نوشت‌افزار</title>
        <meta 
          name="description" 
          content="فروشگاه آنلاین مجتبی تحریر، ارائه‌دهنده انواع لوازم التحریر، نوشت‌افزار، لوازم اداری و تحصیلی با بهترین کیفیت و قیمت. ارسال رایگان در سراسر کشور." 
        />
        <meta 
          name="keywords" 
          content="لوازم التحریر، نوشت افزار، قلم، مداد، کاغذ، دفتر، لوازم اداری، فروش عمده، مجتبی تحریر" 
        />
        <meta property="og:title" content="مجتبی تحریر - فروشگاه آنلاین لوازم التحریر" />
        <meta property="og:description" content="بهترین لوازم التحریر و نوشت‌افزار با کیفیت عالی و قیمت مناسب" />
        <meta property="og:image" content="/images/og-image.jpg" />
        <meta property="og:url" content="https://mojtabatahrir.com" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://mojtabatahrir.com" />
      </Head>

      <Layout>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-l from-blue-600 to-purple-700">
          <div className="relative h-[500px] md:h-[600px]">
            {heroSlides.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <div className="absolute inset-0 bg-black bg-opacity-40" />
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
                
                <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
                  <div className="max-w-2xl text-white">
                    {slide.badge && (
                      <span className="inline-block px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-full mb-4">
                        {slide.badge}
                      </span>
                    )}
                    
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
                      {slide.title}
                    </h1>
                    
                    <h2 className="text-xl md:text-2xl mb-4 text-blue-100">
                      {slide.subtitle}
                    </h2>
                    
                    <p className="text-lg mb-8 text-gray-200 leading-relaxed">
                      {slide.description}
                    </p>
                    
                    <Link
                      href={slide.buttonLink}
                      className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
                    >
                      {slide.buttonText}
                      <ChevronLeftIcon className="w-5 h-5 mr-2" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Slider Controls */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 space-x-reverse">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
                }`}
              />
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-colors"
          >
            <ChevronRightIcon className="w-6 h-6 text-white" />
          </button>
          
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-colors"
          >
            <ChevronLeftIcon className="w-6 h-6 text-white" />
          </button>
        </section>

        {/* Features Section */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TruckIcon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">ارسال رایگان</h3>
                <p className="text-gray-600">برای خریدهای بالای ۵۰۰ هزار تومان</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheckIcon className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">ضمانت کیفیت</h3>
                <p className="text-gray-600">تضمین اصالت و کیفیت تمام محصولات</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PhoneIcon className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">پشتیبانی ۲۴/۷</h3>
                <p className="text-gray-600">آماده پاسخگویی در تمام ساعات شبانه‌روز</p>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">دسته‌بندی محصولات</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                انواع لوازم التحریر و نوشت‌افزار را در دسته‌بندی‌های مختلف مشاهده کنید
              </p>
            </div>

            {categoriesLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-300 rounded-lg h-32 mb-4"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {categories.slice(0, 12).map((category: Category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>
            )}

            <div className="text-center mt-8">
              <Link
                href="/categories"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                مشاهده همه دسته‌بندی‌ها
                <ChevronLeftIcon className="w-5 h-5 mr-2" />
              </Link>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">محصولات ویژه</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                بهترین و محبوب‌ترین محصولات لوازم التحریر را از ما بخرید
              </p>
            </div>

            {/* Product Tabs */}
            <div className="flex justify-center mb-8">
              <div className="bg-white rounded-lg p-1 shadow-sm">
                <button
                  onClick={() => setActiveTab('featured')}
                  className={`px-6 py-2 rounded-md font-medium transition-colors ${
                    activeTab === 'featured'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  محصولات ویژه
                </button>
                <button
                  onClick={() => setActiveTab('newest')}
                  className={`px-6 py-2 rounded-md font-medium transition-colors ${
                    activeTab === 'newest'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  جدیدترین
                </button>
                <button
                  onClick={() => setActiveTab('bestseller')}
                  className={`px-6 py-2 rounded-md font-medium transition-colors ${
                    activeTab === 'bestseller'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  پرفروش‌ترین
                </button>
              </div>
            </div>

            {/* Products Grid */}
            {productsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-white rounded-lg p-4">
                      <div className="bg-gray-300 rounded-lg h-48 mb-4"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                        <div className="h-6 bg-gray-300 rounded w-1/3"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.slice(0, 8).map((product: Product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={() => handleAddToCart(product)}
                    onToggleWishlist={() => handleWishlistToggle(product)}
                    isInWishlist={isInWishlist(product.id)}
                  />
                ))}
              </div>
            )}

            <div className="text-center mt-8">
              <Link
                href="/products"
                className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                مشاهده همه محصولات
                <ChevronLeftIcon className="w-5 h-5 mr-2" />
              </Link>
            </div>
          </div>
        </section>

        {/* Special Offer Section */}
        <section className="py-16 bg-gradient-to-l from-red-500 to-pink-600">
          <div className="container mx-auto px-4">
            <div className="text-center text-white">
              <div className="inline-flex items-center px-4 py-2 bg-white bg-opacity-20 rounded-full mb-6">
                <TagIcon className="w-5 h-5 ml-2" />
                پیشنهاد ویژه
              </div>
              
              <h2 className="text-4xl font-bold mb-4">تخفیف ۳۰٪ برای خرید عمده</h2>
              <p className="text-xl mb-8 text-red-100">
                برای سفارشات بالای ۱۰ میلیون تومان
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/wholesale"
                  className="inline-flex items-center px-8 py-4 bg-white text-red-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                >
                  درخواست قیمت عمده
                  <ChevronLeftIcon className="w-5 h-5 mr-2" />
                </Link>
                
                <Link
                  href="/contact"
                  className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-red-600 transition-colors"
                >
                  تماس با ما
                  <PhoneIcon className="w-5 h-5 mr-2" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-16 bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                عضویت در خبرنامه
              </h2>
              <p className="text-gray-300 mb-8">
                از جدیدترین محصولات و تخفیف‌های ویژه با خبر شوید
              </p>
              
              <form className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  placeholder="آدرس ایمیل خود را وارد کنید"
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  عضویت
                </button>
              </form>
              
              <p className="text-sm text-gray-400 mt-4">
                با عضویت در خبرنامه، شرایط و قوانین را می‌پذیرید
              </p>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
};

export default HomePage;