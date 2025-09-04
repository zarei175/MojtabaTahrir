-- ایجاد جدول سبد خرید
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_type TEXT CHECK (price_type IN ('wholesale', 'retail')) NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id, price_type)
);

-- ایجاد جدول سفارشات
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status TEXT CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')) DEFAULT 'pending',
    
    -- اطلاعات مشتری
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    
    -- آدرس تحویل
    shipping_address JSONB NOT NULL,
    
    -- اطلاعات مالی
    subtotal DECIMAL(12,2) NOT NULL,
    tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    shipping_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL,
    
    -- روش پرداخت و ارسال
    payment_method TEXT CHECK (payment_method IN ('online', 'cash', 'transfer')) NOT NULL,
    shipping_method TEXT CHECK (shipping_method IN ('standard', 'express', 'pickup')) NOT NULL,
    
    -- یادداشت‌ها
    customer_notes TEXT,
    admin_notes TEXT,
    
    -- تاریخ‌ها
    confirmed_at TIMESTAMP WITH TIME ZONE,
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ایجاد جدول آیتم‌های سفارش
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
    
    -- اطلاعات محصول در زمان سفارش
    product_name TEXT NOT NULL,
    product_sku TEXT NOT NULL,
    
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ایجاد جدول تراکنش‌های پرداخت
CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    transaction_id TEXT UNIQUE,
    gateway TEXT, -- نام درگاه پرداخت
    amount DECIMAL(12,2) NOT NULL,
    status TEXT CHECK (status IN ('pending', 'success', 'failed', 'cancelled')) DEFAULT 'pending',
    gateway_response JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ایجاد جدول لاگ تغییرات سفارش
CREATE TABLE IF NOT EXISTS public.order_status_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    old_status TEXT,
    new_status TEXT NOT NULL,
    changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ایجاد جدول کوپن‌های تخفیف
CREATE TABLE IF NOT EXISTS public.discount_coupons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')) NOT NULL,
    discount_value DECIMAL(12,2) NOT NULL,
    min_order_amount DECIMAL(12,2) DEFAULT 0,
    max_discount_amount DECIMAL(12,2),
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    user_type TEXT CHECK (user_type IN ('b2b', 'b2c', 'all')) DEFAULT 'all',
    is_active BOOLEAN DEFAULT true,
    starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ایجاد جدول استفاده از کوپن
CREATE TABLE IF NOT EXISTS public.coupon_usages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    coupon_id UUID REFERENCES public.discount_coupons(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    discount_amount DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(coupon_id, order_id)
);

-- اعمال trigger به جداول جدید
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON public.cart_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_transactions_updated_at BEFORE UPDATE ON public.payment_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_discount_coupons_updated_at BEFORE UPDATE ON public.discount_coupons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ایجاد function برای تولید شماره سفارش
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    counter INTEGER;
BEGIN
    -- گرفتن تاریخ امروز به فرمت YYYYMMDD
    SELECT TO_CHAR(NOW(), 'YYYYMMDD') INTO new_number;
    
    -- شمارش سفارشات امروز
    SELECT COUNT(*) + 1 INTO counter
    FROM public.orders 
    WHERE order_number LIKE new_number || '%';
    
    -- ترکیب تاریخ و شماره ترتیبی
    new_number := new_number || LPAD(counter::TEXT, 4, '0');
    
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- ایجاد trigger برای تولید خودکار شماره سفارش
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

-- ایجاد trigger برای لاگ تغییرات وضعیت سفارش
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO public.order_status_logs (order_id, old_status, new_status)
        VALUES (NEW.id, OLD.status, NEW.status);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_order_status_change_trigger 
    AFTER UPDATE ON public.orders 
    FOR EACH ROW EXECUTE FUNCTION log_order_status_change();

-- ایجاد index های مورد نیاز
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON public.cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON public.payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON public.payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_order_status_logs_order_id ON public.order_status_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_discount_coupons_code ON public.discount_coupons(code);
CREATE INDEX IF NOT EXISTS idx_discount_coupons_is_active ON public.discount_coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_coupon_usages_coupon_id ON public.coupon_usages(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usages_user_id ON public.coupon_usages(user_id);

-- ایجاد view برای سفارشات با جزئیات
CREATE OR REPLACE VIEW public.orders_with_details AS
SELECT 
    o.*,
    COUNT(oi.id) as items_count,
    SUM(oi.quantity) as total_quantity,
    p.full_name as customer_full_name,
    p.user_type as customer_type
FROM public.orders o
LEFT JOIN public.order_items oi ON o.id = oi.order_id
LEFT JOIN public.profiles p ON o.user_id = p.id
GROUP BY o.id, p.full_name, p.user_type;