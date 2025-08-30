import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface KaraApiResponse {
  success: boolean;
  data?: any[];
  message?: string;
  error?: string;
}

interface SyncRequest {
  syncType: 'full' | 'incremental' | 'categories' | 'brands' | 'products' | 'prices' | 'inventory';
  force?: boolean;
  lastSyncDate?: string;
}

interface SyncResult {
  success: boolean;
  records_processed: number;
  records_updated: number;
  records_created: number;
  records_failed: number;
  errors: string[];
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const karaApiUrl = Deno.env.get('KARA_API_URL')!;
const karaApiKey = Deno.env.get('KARA_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { syncType, force = false, lastSyncDate }: SyncRequest = await req.json();

    console.log(`Starting sync: ${syncType}, force: ${force}`);

    // Log sync start
    const { data: syncLog } = await supabase
      .from('sync_logs')
      .insert({
        sync_type: syncType,
        status: 'running',
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    const results: Record<string, SyncResult> = {};

    try {
      switch (syncType) {
        case 'full':
          results.categories = await syncCategories(lastSyncDate);
          results.brands = await syncBrands(lastSyncDate);
          results.products = await syncProducts(lastSyncDate);
          results.prices = await syncPrices(lastSyncDate);
          results.inventory = await syncInventory(lastSyncDate);
          break;
        case 'categories':
          results.categories = await syncCategories(lastSyncDate);
          break;
        case 'brands':
          results.brands = await syncBrands(lastSyncDate);
          break;
        case 'products':
          results.products = await syncProducts(lastSyncDate);
          break;
        case 'prices':
          results.prices = await syncPrices(lastSyncDate);
          break;
        case 'inventory':
          results.inventory = await syncInventory(lastSyncDate);
          break;
        case 'incremental':
          // Get last successful sync date
          const { data: lastSync } = await supabase
            .from('sync_logs')
            .select('completed_at')
            .eq('status', 'success')
            .order('completed_at', { ascending: false })
            .limit(1)
            .single();

          const since = lastSync?.completed_at || lastSyncDate;
          
          results.categories = await syncCategories(since);
          results.brands = await syncBrands(since);
          results.products = await syncProducts(since);
          results.prices = await syncPrices(since);
          results.inventory = await syncInventory(since);
          break;
        default:
          throw new Error(`Unknown sync type: ${syncType}`);
      }

      // Update sync log with success
      await supabase
        .from('sync_logs')
        .update({
          status: 'success',
          completed_at: new Date().toISOString(),
          records_processed: Object.values(results).reduce((sum, r) => sum + r.records_processed, 0),
          records_updated: Object.values(results).reduce((sum, r) => sum + r.records_updated, 0),
          records_created: Object.values(results).reduce((sum, r) => sum + r.records_created, 0),
          records_failed: Object.values(results).reduce((sum, r) => sum + r.records_failed, 0),
        })
        .eq('id', syncLog.id);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'همگام‌سازی با موفقیت انجام شد',
          results,
          timestamp: new Date().toISOString(),
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );

    } catch (error) {
      console.error('Sync error:', error);

      // Update sync log with error
      await supabase
        .from('sync_logs')
        .update({
          status: 'error',
          completed_at: new Date().toISOString(),
          error_details: { message: error.message, stack: error.stack },
        })
        .eq('id', syncLog.id);

      throw error;
    }

  } catch (error) {
    console.error('Request error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

async function callKaraApi(endpoint: string, params?: Record<string, string>): Promise<KaraApiResponse> {
  const url = new URL(`${karaApiUrl}${endpoint}`);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${karaApiKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Kara API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

async function syncCategories(lastSyncDate?: string): Promise<SyncResult> {
  const result: SyncResult = {
    success: true,
    records_processed: 0,
    records_updated: 0,
    records_created: 0,
    records_failed: 0,
    errors: [],
  };

  try {
    const params = lastSyncDate ? { updated_since: lastSyncDate } : {};
    const karaResponse = await callKaraApi('/categories', params);

    if (!karaResponse.success || !karaResponse.data) {
      throw new Error(karaResponse.error || 'No data received from Kara API');
    }

    result.records_processed = karaResponse.data.length;

    for (const karaCategory of karaResponse.data) {
      try {
        const categoryData = {
          name: karaCategory.name,
          slug: karaCategory.slug || karaCategory.name.toLowerCase().replace(/\s+/g, '-'),
          description: karaCategory.description,
          color: karaCategory.color || '#3B82F6',
          parent_id: karaCategory.parent_id,
          sort_order: karaCategory.sort_order || 0,
          is_active: karaCategory.is_active !== false,
          kara_id: karaCategory.id.toString(),
          last_synced_at: new Date().toISOString(),
        };

        // Check if category exists
        const { data: existingCategory } = await supabase
          .from('categories')
          .select('id')
          .eq('kara_id', karaCategory.id.toString())
          .single();

        if (existingCategory) {
          // Update existing category
          const { error } = await supabase
            .from('categories')
            .update(categoryData)
            .eq('id', existingCategory.id);

          if (error) throw error;
          result.records_updated++;
        } else {
          // Create new category
          const { error } = await supabase
            .from('categories')
            .insert(categoryData);

          if (error) throw error;
          result.records_created++;
        }
      } catch (error) {
        console.error(`Error syncing category ${karaCategory.id}:`, error);
        result.records_failed++;
        result.errors.push(`Category ${karaCategory.id}: ${error.message}`);
      }
    }
  } catch (error) {
    result.success = false;
    result.errors.push(error.message);
  }

  return result;
}

async function syncBrands(lastSyncDate?: string): Promise<SyncResult> {
  const result: SyncResult = {
    success: true,
    records_processed: 0,
    records_updated: 0,
    records_created: 0,
    records_failed: 0,
    errors: [],
  };

  try {
    const params = lastSyncDate ? { updated_since: lastSyncDate } : {};
    const karaResponse = await callKaraApi('/brands', params);

    if (!karaResponse.success || !karaResponse.data) {
      throw new Error(karaResponse.error || 'No data received from Kara API');
    }

    result.records_processed = karaResponse.data.length;

    for (const karaBrand of karaResponse.data) {
      try {
        const brandData = {
          name: karaBrand.name,
          slug: karaBrand.slug || karaBrand.name.toLowerCase().replace(/\s+/g, '-'),
          description: karaBrand.description,
          logo_url: karaBrand.logo_url,
          is_active: karaBrand.is_active !== false,
          kara_id: karaBrand.id.toString(),
          last_synced_at: new Date().toISOString(),
        };

        // Check if brand exists
        const { data: existingBrand } = await supabase
          .from('brands')
          .select('id')
          .eq('kara_id', karaBrand.id.toString())
          .single();

        if (existingBrand) {
          // Update existing brand
          const { error } = await supabase
            .from('brands')
            .update(brandData)
            .eq('id', existingBrand.id);

          if (error) throw error;
          result.records_updated++;
        } else {
          // Create new brand
          const { error } = await supabase
            .from('brands')
            .insert(brandData);

          if (error) throw error;
          result.records_created++;
        }
      } catch (error) {
        console.error(`Error syncing brand ${karaBrand.id}:`, error);
        result.records_failed++;
        result.errors.push(`Brand ${karaBrand.id}: ${error.message}`);
      }
    }
  } catch (error) {
    result.success = false;
    result.errors.push(error.message);
  }

  return result;
}

async function syncProducts(lastSyncDate?: string): Promise<SyncResult> {
  const result: SyncResult = {
    success: true,
    records_processed: 0,
    records_updated: 0,
    records_created: 0,
    records_failed: 0,
    errors: [],
  };

  try {
    const params = lastSyncDate ? { updated_since: lastSyncDate } : {};
    const karaResponse = await callKaraApi('/products', params);

    if (!karaResponse.success || !karaResponse.data) {
      throw new Error(karaResponse.error || 'No data received from Kara API');
    }

    result.records_processed = karaResponse.data.length;

    for (const karaProduct of karaResponse.data) {
      try {
        // Find category and brand by kara_id
        const { data: category } = await supabase
          .from('categories')
          .select('id')
          .eq('kara_id', karaProduct.category_id?.toString())
          .single();

        const { data: brand } = await supabase
          .from('brands')
          .select('id')
          .eq('kara_id', karaProduct.brand_id?.toString())
          .single();

        const productData = {
          name: karaProduct.name,
          slug: karaProduct.slug || karaProduct.name.toLowerCase().replace(/\s+/g, '-'),
          description: karaProduct.description,
          short_description: karaProduct.short_description,
          sku: karaProduct.sku,
          barcode: karaProduct.barcode,
          category_id: category?.id,
          brand_id: brand?.id,
          images: karaProduct.images || [],
          specifications: karaProduct.specifications || {},
          weight: karaProduct.weight,
          dimensions: karaProduct.dimensions,
          is_active: karaProduct.is_active !== false,
          is_featured: karaProduct.is_featured || false,
          sort_order: karaProduct.sort_order || 0,
          kara_id: karaProduct.id.toString(),
          last_synced_at: new Date().toISOString(),
        };

        // Check if product exists
        const { data: existingProduct } = await supabase
          .from('products')
          .select('id')
          .eq('kara_id', karaProduct.id.toString())
          .single();

        if (existingProduct) {
          // Update existing product
          const { error } = await supabase
            .from('products')
            .update(productData)
            .eq('id', existingProduct.id);

          if (error) throw error;
          result.records_updated++;
        } else {
          // Create new product
          const { error } = await supabase
            .from('products')
            .insert(productData);

          if (error) throw error;
          result.records_created++;
        }
      } catch (error) {
        console.error(`Error syncing product ${karaProduct.id}:`, error);
        result.records_failed++;
        result.errors.push(`Product ${karaProduct.id}: ${error.message}`);
      }
    }
  } catch (error) {
    result.success = false;
    result.errors.push(error.message);
  }

  return result;
}

async function syncPrices(lastSyncDate?: string): Promise<SyncResult> {
  const result: SyncResult = {
    success: true,
    records_processed: 0,
    records_updated: 0,
    records_created: 0,
    records_failed: 0,
    errors: [],
  };

  try {
    const params = lastSyncDate ? { updated_since: lastSyncDate } : {};
    const karaResponse = await callKaraApi('/prices', params);

    if (!karaResponse.success || !karaResponse.data) {
      throw new Error(karaResponse.error || 'No data received from Kara API');
    }

    result.records_processed = karaResponse.data.length;

    for (const karaPrice of karaResponse.data) {
      try {
        // Find product by kara_id
        const { data: product } = await supabase
          .from('products')
          .select('id')
          .eq('kara_id', karaPrice.product_id?.toString())
          .single();

        if (!product) {
          throw new Error(`Product not found for kara_id: ${karaPrice.product_id}`);
        }

        const priceData = {
          product_id: product.id,
          price_type: karaPrice.price_type || 'wholesale',
          price: karaPrice.price,
          min_quantity: karaPrice.min_quantity || 1,
          max_quantity: karaPrice.max_quantity,
          is_active: karaPrice.is_active !== false,
        };

        // Check if price exists
        const { data: existingPrice } = await supabase
          .from('product_prices')
          .select('id')
          .eq('product_id', product.id)
          .eq('price_type', priceData.price_type)
          .single();

        if (existingPrice) {
          // Update existing price
          const { error } = await supabase
            .from('product_prices')
            .update(priceData)
            .eq('id', existingPrice.id);

          if (error) throw error;
          result.records_updated++;
        } else {
          // Create new price
          const { error } = await supabase
            .from('product_prices')
            .insert(priceData);

          if (error) throw error;
          result.records_created++;
        }
      } catch (error) {
        console.error(`Error syncing price for product ${karaPrice.product_id}:`, error);
        result.records_failed++;
        result.errors.push(`Price for product ${karaPrice.product_id}: ${error.message}`);
      }
    }
  } catch (error) {
    result.success = false;
    result.errors.push(error.message);
  }

  return result;
}

async function syncInventory(lastSyncDate?: string): Promise<SyncResult> {
  const result: SyncResult = {
    success: true,
    records_processed: 0,
    records_updated: 0,
    records_created: 0,
    records_failed: 0,
    errors: [],
  };

  try {
    const params = lastSyncDate ? { updated_since: lastSyncDate } : {};
    const karaResponse = await callKaraApi('/inventory', params);

    if (!karaResponse.success || !karaResponse.data) {
      throw new Error(karaResponse.error || 'No data received from Kara API');
    }

    result.records_processed = karaResponse.data.length;

    for (const karaInventory of karaResponse.data) {
      try {
        // Find product by kara_id
        const { data: product } = await supabase
          .from('products')
          .select('id')
          .eq('kara_id', karaInventory.product_id?.toString())
          .single();

        if (!product) {
          throw new Error(`Product not found for kara_id: ${karaInventory.product_id}`);
        }

        const inventoryData = {
          product_id: product.id,
          quantity: karaInventory.quantity || 0,
          reserved_quantity: karaInventory.reserved_quantity || 0,
          low_stock_threshold: karaInventory.low_stock_threshold || 10,
          last_updated: new Date().toISOString(),
        };

        // Check if inventory exists
        const { data: existingInventory } = await supabase
          .from('product_inventory')
          .select('id')
          .eq('product_id', product.id)
          .single();

        if (existingInventory) {
          // Update existing inventory
          const { error } = await supabase
            .from('product_inventory')
            .update(inventoryData)
            .eq('id', existingInventory.id);

          if (error) throw error;
          result.records_updated++;
        } else {
          // Create new inventory
          const { error } = await supabase
            .from('product_inventory')
            .insert(inventoryData);

          if (error) throw error;
          result.records_created++;
        }
      } catch (error) {
        console.error(`Error syncing inventory for product ${karaInventory.product_id}:`, error);
        result.records_failed++;
        result.errors.push(`Inventory for product ${karaInventory.product_id}: ${error.message}`);
      }
    }
  } catch (error) {
    result.success = false;
    result.errors.push(error.message);
  }

  return result;
}