
-- شمای پایگاه داده فروشگاه مجتبی تحریر
-- PostgreSQL Schema for Mojtaba Tahrir Store

-- فعال‌سازی UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- فعال‌سازی RLS (Row Level Security)
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- ==========================================
-- جداول اصلی سیستم
-- ==========================================

-- جدول کاربران (توسعه یافته از auth.users)
CREATE TABLE public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    user_type VARCHAR(20) DEFAULT 'b2c' CHECK (user_type IN ('b2c', 'b2b', 'admin')),
    company_name VARCHAR(255),
    tax_id VARCHAR(50),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول آدرس‌های کاربران
CREATE TABLE public.user_addresses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL, -- خانه، محل کار، انبار و...
    recipient_name VARCHAR(255) NOT NULL,
    recipient_phone VARCHAR(20) NOT NULL,
    province VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    postal_code VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول دسته‌بندی‌ها
CREATE TABLE public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    kara_id VARCHAR(50) UNIQUE, -- شناسه در نرم‌افزار کارا
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    parent_kara_id VARCHAR(50), -- شناسه والد در کارا
    image_url TEXT,
    icon VARCHAR(100), -- نام آیکون FontAwesome
    color VARCHAR(7), -- کد رنگ هگز
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    seo_title VARCHAR(255),
    seo_description TEXT,
    seo_keywords TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول برندها
CREATE TABLE public.brands (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    kara_id VARCHAR(50) UNIQUE, -- شناسه در نرم‌افزار کارا
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    website_url TEXT,
    country VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول محصولات
CREATE TABLE public.products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    kara_id VARCHAR(50) UNIQUE, -- شناسه در نرم‌افزار کارا
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    short_description TEXT,
    sku VARCHAR(100) UNIQUE NOT NULL,
    barcode VARCHAR(100),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    category_kara_id VARCHAR(50), -- شناسه دسته‌بندی در کارا
    brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
    brand_kara_id VARCHAR(50), -- شناسه برند در کارا
    unit VARCHAR(50) DEFAULT 'عدد', -- واحد فروش
    weight DECIMAL(10, 3), -- وزن به گرم
    dimensions JSONB, -- ابعاد محصول
    images JSONB, -- آرایه‌ای از URL تصاویر
    tags TEXT[], -- برچسب‌های محصول
    features JSONB, -- ویژگی‌های محصول
    specifications JSONB, -- مشخصات فنی
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_digital BOOLEAN DEFAULT FALSE,
    min_order_quantity INTEGER DEFAULT 1,
    max_order_quantity INTEGER,
    sort_order INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    rating_average DECIMAL(3, 2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    seo_title VARCHAR(255),
    seo_description TEXT,
    seo_keywords TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول قیمت‌های محصولات
CREATE TABLE public.product_prices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    product_kara_id VARCHAR(50), -- شناسه محصول در کارا
    price_type VARCHAR(20) NOT NULL CHECK (price_type IN ('wholesale', 'retail')),
    price DECIMAL(15, 2) NOT NULL,
    compare_price DECIMAL(15, 2), -- قیمت قبل از تخفیف
    min_quantity INTEGER DEFAULT 1,
    max_quantity INTEGER,
    currency VARCHAR(3) DEFAULT 'IRR',
    effective_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    effective_to TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, price_type, min_quantity)
);

-- جدول موجودی محصولات
CREATE TABLE public.product_inventory (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    product_kara_id VARCHAR(50), -- شناسه محصول در کارا
    warehouse_kara_id VARCHAR(50), -- شناسه انبار در کارا
    quantity INTEGER NOT NULL DEFAULT 0,
    reserved_quantity INTEGER DEFAULT 0,
    available_quantity INTEGER GENERATED ALWAYS AS (quantity - reserved_quantity) STORED,
    min_stock_level INTEGER DEFAULT 0,
    max_stock_level INTEGER,
    reorder_point INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, warehouse_kara_id)
);

-- جدول سبد خرید
CREATE TABLE public.cart_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    session_id VARCHAR(255), -- برای کاربران مهمان
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price DECIMAL(15, 2) NOT NULL, -- قیمت در زمان افزودن به سبد
    price_type VARCHAR(20) NOT NULL CHECK (price_type IN ('wholesale', 'retail')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id),
    UNIQUE(session_id, product_id)
);

-- جدول سفارشات
CREATE TABLE public.orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    kara_order_id VARCHAR(50), -- شناسه سفارش در کارا
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
        'pending', 'confirmed', 'processing', 'shipped', 'delivered', 
        'cancelled', 'refunded', 'failed'
    )),
    order_type VARCHAR(20) DEFAULT 'b2c' CHECK (order_type IN ('b2c', 'b2b')),
    
    -- اطلاعات مشتری
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    customer_phone VARCHAR(20) NOT NULL,
    
    -- آدرس تحویل
    shipping_address JSONB NOT NULL,
    
    -- اطلاعات مالی
    subtotal DECIMAL(15, 2) NOT NULL,
    tax_amount DECIMAL(15, 2) DEFAULT 0,
    shipping_cost DECIMAL(15, 2) DEFAULT 0,
    discount_amount DECIMAL(15, 2) DEFAULT 0,
    total_amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'IRR',
    
    -- اطلاعات پرداخت
    payment_method VARCHAR(50),
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN (
        'pending', 'paid', 'failed', 'refunded', 'partial'
    )),
    payment_reference VARCHAR(255),
    paid_at TIMESTAMP WITH TIME ZONE,
    
    -- اطلاعات ارسال
    shipping_method VARCHAR(100),
    tracking_number VARCHAR(255),
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    
    -- یادداشت‌ها
    notes TEXT,
    admin_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول آیتم‌های سفارش
CREATE TABLE public.order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_kara_id VARCHAR(50), -- شناسه محصول در کارا
    product_name VARCHAR(255) NOT NULL, -- نام محصول در زمان سفارش
    product_sku VARCHAR(100) NOT NULL, -- SKU محصول در زمان سفارش
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(15, 2) NOT NULL,
    total_price DECIMAL(15, 2) NOT NULL,
    price_type VARCHAR(20) NOT NULL CHECK (price_type IN ('wholesale', 'retail')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول نظرات و امتیازدهی
CREATE TABLE public.product_reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    is_verified BOOLEAN DEFAULT FALSE, -- آیا خرید تایید شده است
    is_approved BOOLEAN DEFAULT FALSE, -- آیا نظر تایید شده است
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, user_id, order_id)
);

-- جدول کوپن‌های تخفیف
CREATE TABLE public.discount_coupons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('percentage', 'fixed_amount')),
    value DECIMAL(15, 2) NOT NULL,
    min_order_amount DECIMAL(15, 2),
    max_discount_amount DECIMAL(15, 2),
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    user_limit INTEGER DEFAULT 1, -- حداکثر استفاده هر کاربر
    applicable_to VARCHAR(20) DEFAULT 'all' CHECK (applicable_to IN ('all', 'b2c', 'b2b')),
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول استفاده از کوپن‌ها
CREATE TABLE public.coupon_usage (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    coupon_id UUID REFERENCES public.discount_coupons(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    discount_amount DECIMAL(15, 2) NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول لاگ همگام‌سازی
CREATE TABLE public.sync_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sync_type VARCHAR(50) NOT NULL CHECK (sync_type IN ('products', 'prices', 'inventory', 'categories', 'orders')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'error', 'partial')),
    records_processed INTEGER DEFAULT 0,
    records_updated INTEGER DEFAULT 0,
    records_created INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    error_message TEXT,
    details JSONB,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول تنظیمات سیستم
CREATE TABLE public.system_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE, -- آیا در فرانت‌اند قابل دسترس است
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول لیست علاقه‌مندی‌ها
CREATE TABLE public.wishlists (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) DEFAULT 'لیست علاقه‌مندی‌های من',
    is_default BOOLEAN DEFAULT TRUE,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول آیتم‌های لیست علاقه‌مندی‌ها
CREATE TABLE public.wishlist_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    wishlist_id UUID REFERENCES public.wishlists(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(wishlist_id, product_id)
);

-- ==========================================
-- ایندکس‌ها برای بهبود عملکرد
-- ==========================================

-- ایندکس‌های جدول محصولات
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_brand_id ON public.products(brand_id);
CREATE INDEX idx_products_kara_id ON public.products(kara_id);
CREATE INDEX idx_products_sku ON public.products(sku);
CREATE INDEX idx_products_is_active ON public.products(is_active);
CREATE INDEX idx_products_is_featured ON public.products(is_featured);
CREATE INDEX idx_products_created_at ON public.products(created_at);

-- ایندکس‌های جدول قیمت‌ها
CREATE INDEX idx_product_prices_product_id ON public.product_prices(product_id);
CREATE INDEX idx_product_prices_price_type ON public.product_prices(price_type);
CREATE INDEX idx_product_prices_effective_dates ON public.product_prices(effective_from, effective_to);

-- ایندکس‌های جدول موجودی
CREATE INDEX idx_product_inventory_product_id ON public.product_inventory(product_id);
CREATE INDEX idx_product_inventory_available_quantity ON public.product_inventory(available_quantity);

-- ایندکس‌های جدول سفارشات
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_order_number ON public.orders(order_number);
CREATE INDEX idx_orders_created_at ON public.orders(created_at);
CREATE INDEX idx_orders_kara_order_id ON public.orders(kara_order_id);

-- ایندکس‌های جدول آیتم‌های سفارش
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_product_id ON public.order_items(product_id);

-- ایندکس‌های جدول نظرات
CREATE INDEX idx_product_reviews_product_id ON public.product_reviews(product_id);
CREATE INDEX idx_product_reviews_user_id ON public.product_reviews(user_id);
CREATE INDEX idx_product_reviews_is_approved ON public.product_reviews(is_approved);

-- ایندکس‌های جدول سبد خرید
CREATE INDEX idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX idx_cart_items_session_id ON public.cart_items(session_id);
CREATE INDEX idx_cart_items_product_id ON public.cart_items(product_id);

-- ==========================================
-- توابع و تریگرها
-- ==========================================

-- تابع به‌روزرسانی خودکار updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- اعمال تریگر به‌روزرسانی به جداول مختلف
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_addresses_updated_at BEFORE UPDATE ON public.user_addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON public.brands FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_prices_updated_at BEFORE UPDATE ON public.product_prices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_inventory_updated_at BEFORE UPDATE ON public.product_inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON public.cart_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_reviews_updated_at BEFORE UPDATE ON public.product_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_discount_coupons_updated_at BEFORE UPDATE ON public.discount_coupons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON public.system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wishlists_updated_at BEFORE UPDATE ON public.wishlists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- تابع تولید شماره سفارش
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    counter INTEGER;
BEGIN
    -- دریافت شماره بعدی از تنظیمات
    SELECT COALESCE((value->>'order_counter')::INTEGER, 1000) INTO counter
    FROM public.system_settings 
    WHERE key = 'order_counter';
    
    -- افزایش شمارنده
    counter := counter + 1;
    
    -- تولید شماره سفارش با فرمت: MT-YYYYMMDD-NNNN
    new_number := 'MT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(counter::TEXT, 4, '0');
    
    -- به‌روزرسانی شمارنده در تنظیمات
    INSERT INTO public.system_settings (key, value, description)
    VALUES ('order_counter', jsonb_build_object('order_counter', counter), 'شمارنده سفارشات')
    ON CONFLICT (key) 
    DO UPDATE SET value = jsonb_build_object('order_counter', counter), updated_at = NOW();
    
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- تریگر تولید خودکار شماره سفارش
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
        NEW.order_number := generate_order_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number_trigger 
    BEFORE INSERT ON public.orders 
    FOR EACH ROW EXECUTE FUNCTION set_order_number();

-- تابع محاسبه میانگین امتیاز محصول
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
DECLARE
    avg_rating DECIMAL(3,2);
    rating_count INTEGER;
BEGIN
    -- محاسبه میانگین و تعداد امتیازها
    SELECT 
        COALESCE(AVG(rating), 0),
        COUNT(*)
    INTO avg_rating, rating_count
    FROM public.product_reviews 
    WHERE product_id = COALESCE(NEW.product_id, OLD.product_id) 
    AND is_approved = TRUE;
    
    -- به‌روزرسانی جدول محصولات
    UPDATE public.products 
    SET 
        rating_average = avg_rating,
        rating_count = rating_count,
        updated_at = NOW()
    WHERE id = COALESCE(NEW.product_id, OLD.product_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- تریگر به‌روزرسانی امتیاز محصول
CREATE TRIGGER update_product_rating_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.product_reviews
    FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- ==========================================
-- Row Level Security (RLS) Policies
-- ==========================================

-- فعال‌سازی RLS برای جداول حساس
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

-- سیاست‌های دسترسی برای user_profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- سیاست‌های دسترسی برای user_addresses
CREATE POLICY "Users can manage own addresses" ON public.user_addresses
    FOR ALL USING (auth.uid() = user_id);

-- سیاست‌های دسترسی برای cart_items
CREATE POLICY "Users can manage own cart" ON public.cart_items
    FOR ALL USING (auth.uid() = user_id);

-- سیاست‌های دسترسی برای orders
CREATE POLICY "Users can view own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id);

-- سیاست‌های دسترسی برای order_items
CREATE POLICY "Users can view own order items" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

-- سیاست‌های دسترسی برای product_reviews
CREATE POLICY "Users can manage own reviews" ON public.product_reviews
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view approved reviews" ON public.product_reviews
    FOR SELECT USING (is_approved = TRUE);

-- سیاست‌های دسترسی برای wishlists
CREATE POLICY "Users can manage own wishlists" ON public.wishlists
    FOR ALL USING (auth.uid() = user_id);

-- سیاست‌های دسترسی برای wishlist_items
CREATE POLICY "Users can manage own wishlist items" ON public.wishlist_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.wishlists 
            WHERE wishlists.id = wishlist_items.wishlist_id 
            AND wishlists.user_id = auth.uid()
        )
    );

-- ==========================================
-- داده‌های اولیه
-- ==========================================

-- تنظیمات اولیه سیستم
INSERT INTO public.system_settings (key, value, description, is_public) VALUES
('site_name', '"فروشگاه مجتبی تحریر"', 'نام سایت', TRUE),
('site_description', '"فروش عمده و تکی لوازم التحریر و نوشت افزار"', 'توضیحات سایت', TRUE),
('contact_phone', '"021-12345678"', 'شماره تماس', TRUE),
('contact_email', '"info@mojtabatahrir.com"', 'ایمیل تماس', TRUE),
('contact_address', '"تهران، خیابان ولیعصر، پلاک 123"', 'آدرس', TRUE),
('currency', '"IRR"', 'واحد پول', TRUE),
('tax_rate', '0.09', 'نرخ مالیات (9%)', FALSE),
('free_shipping_threshold', '200000', 'حد آستانه ارسال رایگان', TRUE),
('order_counter', '{"order_counter": 1000}', 'شمارنده سفارشات', FALSE),
('b2b_min_order', '500000', 'حداقل سفارش عمده', TRUE),
('b2b_discount_rate', '0.15', 'تخفیف عمده (15%)', FALSE);

-- دسته‌بندی‌های اولیه
INSERT INTO public.categories (name, slug, description, icon, color, sort_order) VALUES
('مداد و مداد رنگی', 'pencils', 'انواع مداد و مداد رنگی', 'fas fa-pencil-alt', '#ec4899', 1),
('خودکار و روان نویس', 'pens', 'انواع خودکار و روان نویس', 'fas fa-pen', '#6366f1', 2),
('دفتر و کاغذ', 'notebooks', 'انواع دفتر و کاغذ', 'fas fa-book', '#10b981', 3),
('تراش و پاک کن', 'erasers', 'انواع تراش و پاک کن', 'fas fa-eraser', '#f97316', 4),
('کیف و جامدادی', 'bags', 'انواع کیف و جامدادی', 'fas fa-briefcase', '#8b5cf6', 5),
('لوازم هنری', 'art-supplies', 'رنگ، قلم مو و سایر لوازم هنری', 'fas fa-palette', '#ef4444', 6),
('لوازم اداری', 'office-supplies', 'فایل، کلاسور و لوازم اداری', 'fas fa-clipboard', '#3b82f6', 7),
('بازی و سرگرمی', 'games', 'پازل، بازی فکری و سرگرمی', 'fas fa-puzzle-piece', '#eab308', 8);

-- برندهای اولیه
INSERT INTO public.brands (name, slug, description, country) VALUES
('فابر کاستل', 'faber-castell', 'برند معتبر آلمانی لوازم التحریر', 'آلمان'),
('پایلوت', 'pilot', 'برند ژاپنی خودکار و روان نویس', 'ژاپن'),
('استدلر', 'staedtler', 'برند آلمانی مداد و لوازم هندسی', 'آلمان'),
('زبرا', 'zebra', 'برند ژاپنی خودکار و ماژیک', 'ژاپن'),
('پنتل', 'pentel', 'برند ژاپنی لوازم التحریر', 'ژاپن'),
('بیک', 'bic', 'برند فرانسوی خودکار', 'فرانسه'),
('کرند آش', 'caran-dache', 'برند سوئیسی لوازم التحریر لوکس', 'سوئیس'),
('پارکر', 'parker', 'برند انگلیسی خودکار لوکس', 'انگلستان');

-- ایجاد لیست علاقه‌مندی پیش‌فرض برای کاربران جدید
CREATE OR REPLACE FUNCTION create_default_wishlist()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.wishlists (user_id, name, is_default)
    VALUES (NEW.id, 'لیست علاقه‌مندی‌های من', TRUE);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_default_wishlist_trigger
    AFTER INSERT ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION create_default_wishlist();

-- ==========================================
-- Views برای گزارش‌گیری
-- ==========================================

-- نمای محصولات با قیمت و موجودی
CREATE VIEW public.products_with_details AS
SELECT 
    p.*,
    c.name as category_name,
    c.slug as category_slug,
    b.name as brand_name,
    b.slug as brand_slug,
    COALESCE(pp_retail.price, 0) as retail_price,
    COALESCE(pp_wholesale.price, 0) as wholesale_price,
    COALESCE(SUM(pi.available_quantity), 0) as total_stock
FROM public.products p
LEFT JOIN public.categories c ON p.category_id = c.id
LEFT JOIN public.brands b ON p.brand_id = b.id
LEFT JOIN public.product_prices pp_retail ON p.id = pp_retail.product_id 
    AND pp_retail.price_type = 'retail' 
    AND pp_retail.is_active = TRUE
    AND (pp_retail.effective_to IS NULL OR pp_retail.effective_to > NOW())
LEFT JOIN public.product_prices pp_wholesale ON p.id = pp_wholesale.product_id 
    AND pp_wholesale.price_type = 'wholesale' 
    AND pp_wholesale.is_active = TRUE
    AND (pp_wholesale.effective_to IS NULL OR pp_wholesale.effective_to > NOW())
LEFT JOIN public.product_inventory pi ON p.id = pi.product_id
GROUP BY p.id, c.name, c.slug, b.name, b.slug, pp_retail.price, pp_wholesale.price;

-- نمای آمار فروش
CREATE VIEW public.sales_stats AS
SELECT 
    DATE_TRUNC('month', created_at) as month,
    COUNT(*) as total_orders,
    SUM(total_amount) as total_revenue,
    AVG(total_amount) as avg_order_value,
    COUNT(CASE WHEN order_type = 'b2b' THEN 1 END) as b2b_orders,
    COUNT(CASE WHEN order_type = 'b2c' THEN 1 END) as b2c_orders
FROM public.orders 
WHERE status IN ('delivered', 'shipped')
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- نمای محصولات پرفروش
CREATE VIEW public.bestselling_products AS
SELECT 
    p.id,
    p.name,
    p.sku,
    SUM(oi.quantity) as total_sold,
    SUM(oi.total_price) as total_revenue,
    COUNT(DISTINCT oi.order_id) as order_count
FROM public.products p
JOIN public.order_items oi ON p.id = oi.product_id
JOIN public.orders o ON oi.order_id = o.id
WHERE o.status IN ('delivered', 'shipped')
GROUP BY p.id, p.name, p.sku
ORDER BY total_sold DESC;

-- اعطای دسترسی‌های لازم
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- پایان فایل
