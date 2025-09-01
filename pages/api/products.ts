import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// آدرس سرور کارا
const KARA_API_URL = process.env.KARA_API_URL || 'http://localhost:3001/api';

interface ProductsResponse {
  success: boolean;
  message: string;
  data?: any[];
  total?: number;
  page?: number;
  limit?: number;
  error?: string;
}

interface ProductFilters {
  category_id?: string;
  brand_id?: string;
  search?: string;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
  page?: number;
  limit?: number;
  sort_by?: 'name' | 'price' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ProductsResponse>
) {
  try {
    switch (req.method) {
      case 'GET':
        return await getProducts(req, res);
      case 'POST':
        return await syncProductsFromKara(req, res);
      default:
        return res.status(405).json({
          success: false,
          message: 'روش درخواست مجاز نیست'
        });
    }
  } catch (error) {
    console.error('خطا در API محصولات:', error);
    return res.status(500).json({
      success: false,
      message: 'خطای داخلی سرور',
      error: error instanceof Error ? error.message : 'خطای نامشخص'
    });
  }
}

async function getProducts(req: NextApiRequest, res: NextApiResponse<ProductsResponse>) {
  const {
    category_id,
    brand_id,
    search,
    min_price,
    max_price,
    in_stock,
    page = 1,
    limit = 20,
    sort_by = 'created_at',
    sort_order = 'desc'
  }: ProductFilters = req.query as any;

  try {
    let query = supabase
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
          country
        ),
        product_prices (
          price_type,
          price,
          compare_price,
          min_quantity
        ),
        inventory (
          quantity,
          reserved_quantity,
          min_stock_level
        )
      `)
      .eq('is_active', true);

    // فیلتر بر اساس دسته‌بندی
    if (category_id) {
      query = query.eq('category_id', category_id);
    }

    // فیلتر بر اساس برند
    if (brand_id) {
      query = query.eq('brand_id', brand_id);
    }

    // جستجو در نام و توضیحات
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // فیلتر موجودی
    if (in_stock === true) {
      query = query.gt('inventory.quantity', 0);
    }

    // مرتب‌سازی
    const sortColumn = sort_by === 'price' ? 'product_prices.price' : sort_by;
    query = query.order(sortColumn, { ascending: sort_order === 'asc' });

    // صفحه‌بندی
    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;
    query = query.range(from, to);

    const { data: products, error, count } = await query;

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'خطا در دریافت محصولات',
        error: error.message
      });
    }

    // فیلتر قیمت (پس از دریافت داده‌ها)
    let filteredProducts = products || [];
    if (min_price || max_price) {
      filteredProducts = filteredProducts.filter(product => {
        const price = product.product_prices?.[0]?.price || 0;
        if (min_price && price < min_price) return false;
        if (max_price && price > max_price) return false;
        return true;
      });
    }

    return res.status(200).json({
      success: true,
      message: 'محصولات با موفقیت دریافت شد',
      data: filteredProducts,
      total: count || 0,
      page: Number(page),
      limit: Number(limit)
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'خطا در دریافت محصولات',
      error: error instanceof Error ? error.message : 'خطای نامشخص'
    });
  }
}

async function syncProductsFromKara(req: NextApiRequest, res: NextApiResponse<ProductsResponse>) {
  try {
    // دریافت داده‌ها از سرور کارا
    const [categoriesRes, brandsRes, productsRes, pricesRes, inventoryRes] = await Promise.all([
      fetch(`${KARA_API_URL}/categories`),
      fetch(`${KARA_API_URL}/brands`),
      fetch(`${KARA_API_URL}/products`),
      fetch(`${KARA_API_URL}/prices`),
      fetch(`${KARA_API_URL}/inventory`)
    ]);

    const [categories, brands, products, prices, inventory] = await Promise.all([
      categoriesRes.json(),
      brandsRes.json(),
      productsRes.json(),
      pricesRes.json(),
      inventoryRes.json()
    ]);

    // همگام‌سازی دسته‌بندی‌ها
    if (categories.success && categories.data) {
      const { error: categoriesError } = await supabase
        .from('categories')
        .upsert(categories.data, { onConflict: 'id' });

      if (categoriesError) {
        console.error('خطا در همگام‌سازی دسته‌بندی‌ها:', categoriesError);
      }
    }

    // همگام‌سازی برندها
    if (brands.success && brands.data) {
      const { error: brandsError } = await supabase
        .from('brands')
        .upsert(brands.data, { onConflict: 'id' });

      if (brandsError) {
        console.error('خطا در همگام‌سازی برندها:', brandsError);
      }
    }

    // همگام‌سازی محصولات
    if (products.success && products.data) {
      const { error: productsError } = await supabase
        .from('products')
        .upsert(products.data, { onConflict: 'id' });

      if (productsError) {
        console.error('خطا در همگام‌سازی محصولات:', productsError);
      }
    }

    // همگام‌سازی قیمت‌ها
    if (prices.success && prices.data) {
      const { error: pricesError } = await supabase
        .from('product_prices')
        .upsert(prices.data, { onConflict: 'product_id,price_type' });

      if (pricesError) {
        console.error('خطا در همگام‌سازی قیمت‌ها:', pricesError);
      }
    }

    // همگام‌سازی موجودی
    if (inventory.success && inventory.data) {
      const { error: inventoryError } = await supabase
        .from('inventory')
        .upsert(inventory.data, { onConflict: 'product_id,warehouse_id' });

      if (inventoryError) {
        console.error('خطا در همگام‌سازی موجودی:', inventoryError);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'همگام‌سازی با سرور کارا با موفقیت انجام شد',
      data: {
        categories: categories.data?.length || 0,
        brands: brands.data?.length || 0,
        products: products.data?.length || 0,
        prices: prices.data?.length || 0,
        inventory: inventory.data?.length || 0
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'خطا در همگام‌سازی با سرور کارا',
      error: error instanceof Error ? error.message : 'خطای نامشخص'
    });
  }
}