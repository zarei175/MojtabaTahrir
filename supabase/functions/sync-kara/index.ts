import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'supabase';
import { corsHeaders, handleCors, createResponse, createErrorResponse } from 'cors';

interface KaraApiResponse<T> {
  success: boolean;
  data: T[];
  total?: number;
  timestamp: string;
}

interface Category {
  id: string;
  name: string;
  parent_id: string | null;
  description: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface Brand {
  id: string;
  name: string;
  description: string;
  country: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  description: string;
  category_id: string;
  brand_id: string | null;
  is_active: boolean;
  weight: number;
  dimensions: string;
  created_at?: string;
  updated_at?: string;
}

interface ProductPrice {
  product_id: string;
  price_type: 'wholesale' | 'retail';
  price: number;
  compare_price: number;
  min_quantity: number;
  effective_from: string;
}

interface Inventory {
  product_id: string;
  warehouse_id: string;
  quantity: number;
  reserved_quantity: number;
  min_stock_level: number;
  last_updated: string;
}

const KARA_API_URL = Deno.env.get('KARA_API_URL') || 'http://localhost:3001/api';
const KARA_API_KEY = Deno.env.get('KARA_API_KEY') || '';

serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'full-sync';

    switch (action) {
      case 'full-sync':
        return await performFullSync(supabaseClient);
      case 'sync-categories':
        return await syncCategories(supabaseClient);
      case 'sync-brands':
        return await syncBrands(supabaseClient);
      case 'sync-products':
        return await syncProducts(supabaseClient);
      case 'sync-prices':
        return await syncPrices(supabaseClient);
      case 'sync-inventory':
        return await syncInventory(supabaseClient);
      case 'health-check':
        return await healthCheck();
      default:
        return createErrorResponse('Invalid action parameter');
    }
  } catch (error) {
    console.error('Sync error:', error);
    return createErrorResponse(`Sync failed: ${error.message}`, 500);
  }
});

async function performFullSync(supabaseClient: any) {
  const results = {
    categories: 0,
    brands: 0,
    products: 0,
    prices: 0,
    inventory: 0,
    errors: [] as string[]
  };

  try {
    // 1. همگام‌سازی دسته‌بندی‌ها
    const categoriesResult = await syncCategories(supabaseClient);
    const categoriesData = await categoriesResult.json();
    results.categories = categoriesData.synced || 0;
    if (!categoriesData.success) {
      results.errors.push(`Categories: ${categoriesData.error}`);
    }

    // 2. همگام‌سازی برندها
    const brandsResult = await syncBrands(supabaseClient);
    const brandsData = await brandsResult.json();
    results.brands = brandsData.synced || 0;
    if (!brandsData.success) {
      results.errors.push(`Brands: ${brandsData.error}`);
    }

    // 3. همگام‌سازی محصولات
    const productsResult = await syncProducts(supabaseClient);
    const productsData = await productsResult.json();
    results.products = productsData.synced || 0;
    if (!productsData.success) {
      results.errors.push(`Products: ${productsData.error}`);
    }

    // 4. همگام‌سازی قیمت‌ها
    const pricesResult = await syncPrices(supabaseClient);
    const pricesData = await pricesResult.json();
    results.prices = pricesData.synced || 0;
    if (!pricesData.success) {
      results.errors.push(`Prices: ${pricesData.error}`);
    }

    // 5. همگام‌سازی موجودی
    const inventoryResult = await syncInventory(supabaseClient);
    const inventoryData = await inventoryResult.json();
    results.inventory = inventoryData.synced || 0;
    if (!inventoryData.success) {
      results.errors.push(`Inventory: ${inventoryData.error}`);
    }

    return createResponse({
      success: true,
      message: 'Full sync completed',
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return createErrorResponse(`Full sync failed: ${error.message}`, 500);
  }
}

async function syncCategories(supabaseClient: any) {
  try {
    // دریافت داده‌ها از کارا
    const response = await fetch(`${KARA_API_URL}/categories`, {
      headers: {
        'Authorization': `Bearer ${KARA_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Kara API error: ${response.status}`);
    }

    const karaData: KaraApiResponse<Category> = await response.json();
    
    if (!karaData.success) {
      throw new Error('Kara API returned unsuccessful response');
    }

    let synced = 0;
    
    // به‌روزرسانی یا درج داده‌ها در Supabase
    for (const category of karaData.data) {
      const { error } = await supabaseClient
        .from('categories')
        .upsert({
          id: category.id,
          name: category.name,
          parent_id: category.parent_id,
          description: category.description,
          is_active: category.is_active,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (error) {
        console.error('Category upsert error:', error);
      } else {
        synced++;
      }
    }

    return createResponse({
      success: true,
      message: 'Categories synced successfully',
      synced,
      total: karaData.data.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return createErrorResponse(`Categories sync failed: ${error.message}`, 500);
  }
}

async function syncBrands(supabaseClient: any) {
  try {
    const response = await fetch(`${KARA_API_URL}/brands`, {
      headers: {
        'Authorization': `Bearer ${KARA_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Kara API error: ${response.status}`);
    }

    const karaData: KaraApiResponse<Brand> = await response.json();
    
    if (!karaData.success) {
      throw new Error('Kara API returned unsuccessful response');
    }

    let synced = 0;
    
    for (const brand of karaData.data) {
      const { error } = await supabaseClient
        .from('brands')
        .upsert({
          id: brand.id,
          name: brand.name,
          description: brand.description,
          country: brand.country,
          is_active: brand.is_active,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (error) {
        console.error('Brand upsert error:', error);
      } else {
        synced++;
      }
    }

    return createResponse({
      success: true,
      message: 'Brands synced successfully',
      synced,
      total: karaData.data.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return createErrorResponse(`Brands sync failed: ${error.message}`, 500);
  }
}

async function syncProducts(supabaseClient: any) {
  try {
    const response = await fetch(`${KARA_API_URL}/products`, {
      headers: {
        'Authorization': `Bearer ${KARA_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Kara API error: ${response.status}`);
    }

    const karaData: KaraApiResponse<Product> = await response.json();
    
    if (!karaData.success) {
      throw new Error('Kara API returned unsuccessful response');
    }

    let synced = 0;
    
    for (const product of karaData.data) {
      const { error } = await supabaseClient
        .from('products')
        .upsert({
          id: product.id,
          name: product.name,
          sku: product.sku,
          barcode: product.barcode,
          description: product.description,
          category_id: product.category_id,
          brand_id: product.brand_id,
          is_active: product.is_active,
          weight: product.weight,
          dimensions: product.dimensions,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (error) {
        console.error('Product upsert error:', error);
      } else {
        synced++;
      }
    }

    return createResponse({
      success: true,
      message: 'Products synced successfully',
      synced,
      total: karaData.data.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return createErrorResponse(`Products sync failed: ${error.message}`, 500);
  }
}

async function syncPrices(supabaseClient: any) {
  try {
    const response = await fetch(`${KARA_API_URL}/prices`, {
      headers: {
        'Authorization': `Bearer ${KARA_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Kara API error: ${response.status}`);
    }

    const karaData: KaraApiResponse<ProductPrice> = await response.json();
    
    if (!karaData.success) {
      throw new Error('Kara API returned unsuccessful response');
    }

    let synced = 0;
    
    for (const price of karaData.data) {
      const { error } = await supabaseClient
        .from('product_prices')
        .upsert({
          product_id: price.product_id,
          price_type: price.price_type,
          price: price.price,
          compare_price: price.compare_price,
          min_quantity: price.min_quantity,
          effective_from: price.effective_from,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'product_id,price_type'
        });

      if (error) {
        console.error('Price upsert error:', error);
      } else {
        synced++;
      }
    }

    return createResponse({
      success: true,
      message: 'Prices synced successfully',
      synced,
      total: karaData.data.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return createErrorResponse(`Prices sync failed: ${error.message}`, 500);
  }
}

async function syncInventory(supabaseClient: any) {
  try {
    const response = await fetch(`${KARA_API_URL}/inventory`, {
      headers: {
        'Authorization': `Bearer ${KARA_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Kara API error: ${response.status}`);
    }

    const karaData: KaraApiResponse<Inventory> = await response.json();
    
    if (!karaData.success) {
      throw new Error('Kara API returned unsuccessful response');
    }

    let synced = 0;
    
    for (const inventory of karaData.data) {
      const { error } = await supabaseClient
        .from('inventory')
        .upsert({
          product_id: inventory.product_id,
          warehouse_id: inventory.warehouse_id,
          quantity: inventory.quantity,
          reserved_quantity: inventory.reserved_quantity,
          min_stock_level: inventory.min_stock_level,
          last_updated: inventory.last_updated,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'product_id,warehouse_id'
        });

      if (error) {
        console.error('Inventory upsert error:', error);
      } else {
        synced++;
      }
    }

    return createResponse({
      success: true,
      message: 'Inventory synced successfully',
      synced,
      total: karaData.data.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return createErrorResponse(`Inventory sync failed: ${error.message}`, 500);
  }
}

async function healthCheck() {
  try {
    // بررسی دسترسی به کارا
    const karaResponse = await fetch(`${KARA_API_URL}/health`, {
      headers: {
        'Authorization': `Bearer ${KARA_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const karaHealthy = karaResponse.ok;
    let karaVersion = 'unknown';
    
    if (karaHealthy) {
      const karaData = await karaResponse.json();
      karaVersion = karaData.version || 'unknown';
    }

    return createResponse({
      success: true,
      message: 'Health check completed',
      services: {
        kara: {
          status: karaHealthy ? 'healthy' : 'unhealthy',
          version: karaVersion,
          url: KARA_API_URL
        },
        supabase: {
          status: 'healthy',
          function: 'sync-kara'
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return createErrorResponse(`Health check failed: ${error.message}`, 500);
  }
}