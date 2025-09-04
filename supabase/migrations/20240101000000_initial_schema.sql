-- ایجاد extension های مورد نیاز
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ایجاد schema اصلی
CREATE SCHEMA IF NOT EXISTS public;

-- ایجاد جدول کاربران (گسترش auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    user_type TEXT CHECK (user_type IN ('b2b', 'b2c')) DEFAULT 'b2c',
    company_name TEXT,
    tax_number TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ایجاد جدول آدرس‌ها
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT,
    postal_code TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ایجاد جدول تنظیمات سیستم
CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- درج تنظیمات پیش‌فرض
INSERT INTO public.system_settings (key, value, description) VALUES
('site_name', '"مجتبی تحریر"', 'نام سایت'),
('site_description', '"فروشگاه آنلاین لوازم التحریر و نوشت‌افزار"', 'توضیحات سایت'),
('contact_phone', '"021-12345678"', 'شماره تلفن تماس'),
('contact_email', '"info@mojtabatahrir.com"', 'ایمیل تماس'),
('contact_address', '"تهران، خیابان انقلاب، نرسیده به چهارراه کالج، پلاک ۱۲۳"', 'آدرس فروشگاه'),
('business_hours', '{"saturday_to_thursday": "8:00-18:00", "friday": "9:00-13:00"}', 'ساعات کاری'),
('shipping_cost_b2c', '25000', 'هزینه ارسال B2C'),
('shipping_cost_b2b', '0', 'هزینه ارسال B2B'),
('free_shipping_threshold', '200000', 'حد آزاد ارسال رایگان'),
('tax_rate', '0.09', 'نرخ مالیات'),
('min_order_b2c', '50000', 'حداقل سفارش B2C'),
('min_order_b2b', '500000', 'حداقل سفارش B2B'),
('kara_sync_enabled', 'true', 'فعال بودن همگام‌سازی کارا'),
('kara_sync_interval', '300000', 'فاصله همگام‌سازی کارا (میلی‌ثانیه)')
ON CONFLICT (key) DO NOTHING;

-- ایجاد trigger برای به‌روزرسانی updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- اعمال trigger به جداول
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON public.addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON public.system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ایجاد index های مورد نیاز
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON public.addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_is_default ON public.addresses(is_default);