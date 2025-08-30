import React from 'react';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import Layout from '../components/layout/Layout';
import ProductCard from '../components/product/ProductCard';
import { supabase } from '../lib/supabase';
import { Product, Category } from '../types';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface HomeProps {
  featuredProducts: Product[];
  categories: Category[];
  newProducts: Product[];
  popularProducts: Product[];
}

const Home: React.FC<HomeProps> = ({
  featuredProducts,
  categories,
  newProducts,
  popularProducts,
}) => {
  return (
    <Layout>
      <Head>
        <title>فروشگاه آنلاین مجتبی تحریر - لوازم التحریر و نوشت افزار</title>
        <meta
          name="description"
          content="فروشگاه آنلاین مجتبی تحریر، بزرگترین مرکز فروش عمده و تکی لوازم التحریر، نوشت افزار، لوازم هنری و اداری با بهترین قیمت و کیفیت"
        />
        <meta name="keywords" content="لوازم التحریر، نوشت افزار، خودکار، مداد، دفتر، لوازم هنری، لوازم اداری، فروش عمده" />
      </Head>

      {/* Hero Section */}
      <section className="relative">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000 }}
          loop
          className="h-64 md:h-96"
        >
          <SwiperSlide>
            <div className="relative w-full h-full bg-gradient-to-r from-primary-600 to-primary-800">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <h1 className="text-3xl md:text-5xl font-bold mb-4">
                    مجتبی تحریر
                  </h1>
                  <p className="text-lg md:text-xl mb-6">
                    بزرگترین مرکز فروش لوازم التحریر
                  </p>
                  <Link
                    href="/products"
                    className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    مشاهده محصولات
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>
          
          <SwiperSlide>
            <div className="relative w-full h-full bg-gradient-to-r from-secondary-600 to-secondary-800">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <h2 className="text-3xl md:text-5xl font-bold mb-4">
                    فروش عمده
                  </h2>
                  <p className="text-lg md:text-xl mb-6">
                    قیمت‌های ویژه برای خریدهای عمده
                  </p>
                  <Link
                    href="/auth/register"
                    className="bg-white text-secondary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    ثبت نام فروشندگان
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>
      </section>

      {/* Categories Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            دسته‌بندی محصولات
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products/category/${category.slug}`}
                className="group"
              >
                <div className="bg-white rounded-lg p-6 text-center shadow-md hover:shadow-lg transition-shadow">
                  <div
                    className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: category.color }}
                  >
                    {category.image_url ? (
                      <Image
                        src={category.image_url}
                        alt={category.name}
                        width={32}
                        height={32}
                        className="w-8 h-8"
                      />
                    ) : (
                      <span className="text-white text-2xl">📝</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-800 group-hover:text-primary-600 transition-colors">
                    {category.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">محصولات ویژه</h2>
            <Link
              href="/products?featured=true"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              مشاهده همه
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* New Products */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">جدیدترین محصولات</h2>
            <Link
              href="/products?sort=newest"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              مشاهده همه
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Popular Products */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">پرفروش‌ترین محصولات</h2>
            <Link
              href="/products?sort=popular"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              مشاهده همه
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-primary-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🚚</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">ارسال سریع</h3>
              <p className="text-gray-600">
                ارسال سریع و ایمن در سراسر کشور
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">💰</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">قیمت مناسب</h3>
              <p className="text-gray-600">
                بهترین قیمت‌ها برای خریدهای عمده و تکی
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🛡️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">ضمانت کیفیت</h3>
              <p className="text-gray-600">
                تضمین کیفیت و اصالت تمام محصولات
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  try {
    // Fetch featured products
    const { data: featuredProducts } = await supabase
      .from('products_with_details')
      .select('*')
      .eq('is_featured', true)
      .eq('is_active', true)
      .limit(8);

    // Fetch categories
    const { data: categories } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .is('parent_id', null)
      .order('sort_order');

    // Fetch new products
    const { data: newProducts } = await supabase
      .from('products_with_details')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(8);

    // Fetch popular products (mock data for now)
    const { data: popularProducts } = await supabase
      .from('products_with_details')
      .select('*')
      .eq('is_active', true)
      .limit(8);

    return {
      props: {
        featuredProducts: featuredProducts || [],
        categories: categories || [],
        newProducts: newProducts || [],
        popularProducts: popularProducts || [],
      },
      revalidate: 3600, // Revalidate every hour
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      props: {
        featuredProducts: [],
        categories: [],
        newProducts: [],
        popularProducts: [],
      },
      revalidate: 60,
    };
  }
};

export default Home;