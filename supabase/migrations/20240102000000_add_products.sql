-- ایجاد جدول دسته‌بندی‌ها
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    parent_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
    description TEXT,
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ایجاد جدول برندها
CREATE TABLE IF NOT EXISTS public.brands (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    country TEXT,
    logo_url TEXT,
    website_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ایجاد جدول محصولات
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    barcode TEXT UNIQUE,
    description TEXT,
    category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
    brand_id TEXT REFERENCES public.brands(id) ON DELETE SET NULL,
    weight DECIMAL(10,2),
    dimensions TEXT,
    image_urls TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ایجاد جدول قیمت‌های محصولات
CREATE TABLE IF NOT EXISTS public.product_prices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
    price_type TEXT CHECK (price_type IN ('wholesale', 'retail')) NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    compare_price DECIMAL(12,2),
    min_quantity INTEGER DEFAULT 1,
    effective_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    effective_to TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, price_type)
);

-- ایجاد جدول موجودی
CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
    warehouse_id TEXT DEFAULT 'main',
    quantity INTEGER NOT NULL DEFAULT 0,
    reserved_quantity INTEGER NOT NULL DEFAULT 0,
    min_stock_level INTEGER DEFAULT 0,
    max_stock_level INTEGER,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, warehouse_id)
);

-- ایجاد جدول ویژگی‌های محصولات
CREATE TABLE IF NOT EXISTS public.product_attributes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
    attribute_name TEXT NOT NULL,
    attribute_value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- اعمال trigger به جداول جدید
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON public.brands FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_prices_updated_at BEFORE UPDATE ON public.product_prices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON public.inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ایجاد index های مورد نیاز
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON public.categories(is_active);
CREATE INDEX IF NOT EXISTS idx_brands_is_active ON public.brands(is_active);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON public.products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_product_prices_product_id ON public.product_prices(product_id);
CREATE INDEX IF NOT EXISTS idx_product_prices_price_type ON public.product_prices(price_type);
CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON public.inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_warehouse_id ON public.inventory(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_product_attributes_product_id ON public.product_attributes(product_id);

-- ایجاد view برای محصولات با اطلاعات کامل
CREATE OR REPLACE VIEW public.products_with_details AS
SELECT 
    p.*,
    c.name as category_name,
    b.name as brand_name,
    b.country as brand_country,
    COALESCE(i.quantity, 0) - COALESCE(i.reserved_quantity, 0) as available_quantity,
    CASE 
        WHEN COALESCE(i.quantity, 0) - COALESCE(i.reserved_quantity, 0) > 0 THEN true 
        ELSE false 
    END as in_stock,
    pp_wholesale.price as wholesale_price,
    pp_wholesale.min_quantity as wholesale_min_quantity,
    pp_retail.price as retail_price,
    pp_retail.min_quantity as retail_min_quantity
FROM public.products p
LEFT JOIN public.categories c ON p.category_id = c.id
LEFT JOIN public.brands b ON p.brand_id = b.id
LEFT JOIN public.inventory i ON p.id = i.product_id AND i.warehouse_id = 'main'
LEFT JOIN public.product_prices pp_wholesale ON p.id = pp_wholesale.product_id AND pp_wholesale.price_type = 'wholesale'
LEFT JOIN public.product_prices pp_retail ON p.id = pp_retail.product_id AND pp_retail.price_type = 'retail'
WHERE p.is_active = true;

-- درج داده‌های نمونه
INSERT INTO public.categories (id, name, description, is_active) VALUES
('cat_001', 'مداد و مداد رنگی', 'انواع مداد و مداد رنگی', true),
('cat_002', 'خودکار و روان‌نویس', 'انواع خودکار و روان‌نویس', true),
('cat_003', 'کاغذ و دفتر', 'انواع کاغذ و دفتر', true),
('cat_004', 'لوازم هنری', 'لوازم نقاشی و هنری', true),
('cat_005', 'لوازم اداری', 'لوازم اداری و تجاری', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.brands (id, name, description, country, is_active) VALUES
('brand_001', 'فابر کاستل', 'برند معتبر آلمانی لوازم التحریر', 'آلمان', true),
('brand_002', 'استدلر', 'برند آلمانی لوازم التحریر و هنری', 'آلمان', true),
('brand_003', 'پایلوت', 'برند ژاپنی خودکار و روان‌نویس', 'ژاپن', true),
('brand_004', 'بیک', 'برند فرانسوی خودکار', 'فرانسه', true),
('brand_005', 'پنتل', 'برند ژاپنی لوازم التحریر', 'ژاپن', true)
ON CONFLICT (id) DO NOTHING;