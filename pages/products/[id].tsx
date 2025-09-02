import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { 
  StarIcon,
  ShoppingCartIcon,
  HeartIcon,
  ShareIcon,
  ChevronLeftIcon,
  CheckIcon,
  XMarkIcon,
  TruckIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon, HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

import Layout from '../../components/layout/Layout';
import ProductImageGallery from '../../components/products/ProductImageGallery';
import ProductTabs from '../../components/products/ProductTabs';
import RelatedProducts from '../../components/products/RelatedProducts';
import AddToCartButton from '../../components/products/AddToCartButton';
import PriceDisplay from '../../components/products/PriceDisplay';
import StockStatus from '../../components/products/StockStatus';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  description: string;
  category_id: string;
  brand_id: string;
  weight: number;
  dimensions: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  categories: {
    id: string;
    name: string;
    description: string;
  };
  brands: {
    id: string;
    name: string;
    description: string;
    country: string;
  };
  product_prices: Array<{
    price_type: 'wholesale' | 'retail';
    price: number;
    compare_price: number;
    min_quantity: number;
    effective_from: string;
  }>;
  inventory: Array<{
    product_id: string;
    warehouse_id: string;
    quantity: number;
    reserved_quantity: number;
    min_stock_level: number;
    last_updated: string;
  }>;
}

interface ProductPageProps {
  product: Product | null;
  relatedProducts: Product[];
  breadcrumbs: Array<{
    name: string;
    href: string;
  }>;
}

const ProductPage: React.FC<ProductPageProps> = ({
  product,
  relatedProducts,
  breadcrumbs
}) => {
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart, isLoading: cartLoading } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  
  const [selectedPriceType, setSelectedPriceType] = useState<'wholesale' | 'retail'>('retail');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    if (product && user) {
      setIsWishlisted(isInWishlist(product.id));
    }
  }, [product, user, isInWishlist]);

  useEffect(() => {
    // Set default price type based on user type
    if (user?.profile?.user_type === 'b2b') {
      setSelectedPriceType('wholesale');
    } else {
      setSelectedPriceType('retail');
    }
  }, [user]);

  if (router.isFallback) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">محصول یافت نشد</h1>
          <p className="text-gray-600 mb-8">متأسفانه محصول مورد نظر شما یافت نشد.</p>
          <Link
            href="/products"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            بازگشت به محصولات
          </Link>
        </div>
      </Layout>
    );
  }

  const currentPrice = product.product_prices.find(p => p.price_type === selectedPriceType);
  const availableQuantity = product.inventory.reduce(
    (total, inv) => total + (inv.quantity - inv.reserved_quantity), 
    0
  );

  const handleAddToCart = async () => {
    if (!currentPrice) return;
    
    try {
      await addToCart({
        product_id: product.id,
        quantity,
        price_type: selectedPriceType
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleWishlistToggle = async () => {
    try {
      if (isWishlisted) {
        await removeFromWishlist(product.id);
        setIsWishlisted(false);
      } else {
        await addToWishlist(product.id);
        setIsWishlisted(true);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <Layout>
      <Head>
        <title>{product.name} - فروشگاه مجتبی تحریر</title>
        <meta name="description" content={product.description} />
        <meta name="keywords" content={`${product.name}, ${product.categories.name}, ${product.brands?.name}, لوازم التحریر`} />
        <meta property="og:title" content={product.name} />
        <meta property="og:description" content={product.description} />
        <meta property="og:type" content="product" />
        <meta property="product:price:amount" content={currentPrice?.price.toString()} />
        <meta property="product:price:currency" content="IRR" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumbs */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex items-center space-x-2 space-x-reverse text-sm">
              {breadcrumbs.map((item, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <ChevronLeftIcon className="w-4 h-4 text-gray-400" />}
                  {index === breadcrumbs.length - 1 ? (
                    <span className="text-gray-900 font-medium">{item.name}</span>
                  ) : (
                    <Link
                      href={item.href}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {item.name}
                    </Link>
                  )}
                </React.Fragment>
              ))}
            </nav>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Product Images */}
            <div>
              <ProductImageGallery
                images={[
                  `/images/products/${product.id}/main.jpg`,
                  `/images/products/${product.id}/1.jpg`,
                  `/images/products/${product.id}/2.jpg`
                ]}
                alt={product.name}
              />
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <span>برند: {product.brands?.name}</span>
                  <span>•</span>
                  <span>کد: {product.sku}</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {product.name}
                </h1>
                
                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarSolidIcon
                        key={star}
                        className={`h-5 w-5 ${
                          star <= 4 ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">(۱۲ نظر)</span>
                </div>
              </div>

              {/* Price */}
              <div className="bg-gray-50 rounded-lg p-4">
                <PriceDisplay
                  prices={product.product_prices}
                  selectedType={selectedPriceType}
                  onTypeChange={setSelectedPriceType}
                  userType={user?.profile?.user_type || 'b2c'}
                />
              </div>

              {/* Stock Status */}
              <StockStatus
                quantity={availableQuantity}
                minStockLevel={product.inventory[0]?.min_stock_level || 0}
              />

              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">تعداد:</label>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-gray-600 hover:text-gray-800"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 text-center border-0 focus:ring-0"
                    min="1"
                    max={availableQuantity}
                  />
                  <button
                    onClick={() => setQuantity(Math.min(availableQuantity, quantity + 1))}
                    className="px-3 py-2 text-gray-600 hover:text-gray-800"
                    disabled={quantity >= availableQuantity}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <AddToCartButton
                  onClick={handleAddToCart}
                  disabled={availableQuantity === 0 || cartLoading}
                  loading={cartLoading}
                  className="flex-1"
                >
                  <ShoppingCartIcon className="h-5 w-5 ml-2" />
                  افزودن به سبد خرید
                </AddToCartButton>

                <div className="flex gap-2">
                  <button
                    onClick={handleWishlistToggle}
                    className={`p-3 rounded-lg border transition-colors ${
                      isWishlisted
                        ? 'bg-red-50 border-red-200 text-red-600'
                        : 'bg-white border-gray-300 text-gray-600 hover:text-red-600'
                    }`}
                  >
                    {isWishlisted ? (
                      <HeartSolidIcon className="h-5 w-5" />
                    ) : (
                      <HeartIcon className="h-5 w-5" />
                    )}
                  </button>

                  <button
                    onClick={handleShare}
                    className="p-3 rounded-lg border border-gray-300 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <ShareIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <TruckIcon className="h-5 w-5" />
                  <span>ارسال رایگان</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <ShieldCheckIcon className="h-5 w-5" />
                  <span>گارانتی اصالت</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CurrencyDollarIcon className="h-5 w-5" />
                  <span>پرداخت امن</span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Tabs */}
          <div className="mb-12">
            <ProductTabs
              product={product}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <RelatedProducts products={relatedProducts} />
          )}
        </div>
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  try {
    const { id } = params!;

    // Get product details
    const { data: product, error: productError } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          id,
          name,
          description
        ),
        brands (
          id,
          name,
          description,
          country
        ),
        product_prices (
          price_type,
          price,
          compare_price,
          min_quantity,
          effective_from
        ),
        inventory (
          product_id,
          warehouse_id,
          quantity,
          reserved_quantity,
          min_stock_level,
          last_updated
        )
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (productError || !product) {
      return {
        notFound: true
      };
    }

    // Get related products (same category, different product)
    const { data: relatedProducts } = await supabase
      .from('products')
      .select(`
        *,
        categories (name),
        brands (name),
        product_prices (price_type, price, compare_price),
        inventory (quantity, reserved_quantity)
      `)
      .eq('category_id', product.category_id)
      .neq('id', product.id)
      .eq('is_active', true)
      .limit(4);

    // Build breadcrumbs
    const breadcrumbs = [
      { name: 'خانه', href: '/' },
      { name: 'محصولات', href: '/products' },
      { 
        name: product.categories.name, 
        href: `/products/category/${product.categories.id}` 
      },
      { name: product.name, href: `/products/${product.id}` }
    ];

    return {
      props: {
        product,
        relatedProducts: relatedProducts || [],
        breadcrumbs
      }
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    
    return {
      notFound: true
    };
  }
};

export default ProductPage;