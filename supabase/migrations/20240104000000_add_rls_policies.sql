-- فعال‌سازی Row Level Security برای تمام جداول
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usages ENABLE ROW LEVEL SECURITY;

-- سیاست‌های profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- سیاست‌های addresses
CREATE POLICY "Users can manage own addresses" ON public.addresses
    FOR ALL USING (auth.uid() = user_id);

-- سیاست‌های عمومی برای جداول محصولات (فقط خواندن)
CREATE POLICY "Anyone can view active categories" ON public.categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view active brands" ON public.brands
    FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view active products" ON public.products
    FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view product prices" ON public.product_prices
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view inventory" ON public.inventory
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view product attributes" ON public.product_attributes
    FOR SELECT USING (true);

-- سیاست‌های سبد خرید
CREATE POLICY "Users can manage own cart" ON public.cart_items
    FOR ALL USING (auth.uid() = user_id);

-- سیاست‌های سفارشات
CREATE POLICY "Users can view own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create orders" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own order items" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view own payment transactions" ON public.payment_transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = payment_transactions.order_id 
            AND orders.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view own order status logs" ON public.order_status_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = order_status_logs.order_id 
            AND orders.user_id = auth.uid()
        )
    );

-- سیاست‌های کوپن تخفیف
CREATE POLICY "Anyone can view active coupons" ON public.discount_coupons
    FOR SELECT USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));

CREATE POLICY "Users can view own coupon usages" ON public.coupon_usages
    FOR SELECT USING (auth.uid() = user_id);

-- سیاست‌های مدیریت (برای service role)
CREATE POLICY "Service role can manage all data" ON public.profiles
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage categories" ON public.categories
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage brands" ON public.brands
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage products" ON public.products
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage product prices" ON public.product_prices
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage inventory" ON public.inventory
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage orders" ON public.orders
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage payment transactions" ON public.payment_transactions
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage coupons" ON public.discount_coupons
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- ایجاد function برای بررسی دسترسی مدیر
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND user_type = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- سیاست‌های مدیریت برای ادمین‌ها
CREATE POLICY "Admins can manage all profiles" ON public.profiles
    FOR ALL USING (is_admin());

CREATE POLICY "Admins can manage all orders" ON public.orders
    FOR ALL USING (is_admin());

CREATE POLICY "Admins can update order status" ON public.orders
    FOR UPDATE USING (is_admin());

-- ایجاد function برای محاسبه موجودی قابل دسترس
CREATE OR REPLACE FUNCTION get_available_quantity(product_id_param TEXT)
RETURNS INTEGER AS $$
DECLARE
    available_qty INTEGER;
BEGIN
    SELECT COALESCE(quantity, 0) - COALESCE(reserved_quantity, 0)
    INTO available_qty
    FROM public.inventory 
    WHERE product_id = product_id_param 
    AND warehouse_id = 'main';
    
    RETURN COALESCE(available_qty, 0);
END;
$$ LANGUAGE plpgsql;

-- ایجاد function برای بررسی موجودی قبل از افزودن به سبد
CREATE OR REPLACE FUNCTION check_cart_item_availability()
RETURNS TRIGGER AS $$
DECLARE
    available_qty INTEGER;
    current_cart_qty INTEGER;
BEGIN
    -- محاسبه موجودی قابل دسترس
    available_qty := get_available_quantity(NEW.product_id);
    
    -- محاسبه مقدار فعلی در سبد خرید کاربر
    SELECT COALESCE(SUM(quantity), 0) INTO current_cart_qty
    FROM public.cart_items 
    WHERE user_id = NEW.user_id 
    AND product_id = NEW.product_id 
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID);
    
    -- بررسی موجودی کافی
    IF (current_cart_qty + NEW.quantity) > available_qty THEN
        RAISE EXCEPTION 'موجودی کافی نیست. موجودی قابل دسترس: %', available_qty;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_cart_availability_trigger 
    BEFORE INSERT OR UPDATE ON public.cart_items 
    FOR EACH ROW EXECUTE FUNCTION check_cart_item_availability();

-- ایجاد function برای رزرو موجودی هنگام ثبت سفارش
CREATE OR REPLACE FUNCTION reserve_inventory_on_order()
RETURNS TRIGGER AS $$
DECLARE
    item RECORD;
BEGIN
    -- رزرو موجودی برای تمام آیتم‌های سفارش
    FOR item IN 
        SELECT product_id, quantity 
        FROM public.order_items 
        WHERE order_id = NEW.id
    LOOP
        UPDATE public.inventory 
        SET reserved_quantity = reserved_quantity + item.quantity
        WHERE product_id = item.product_id 
        AND warehouse_id = 'main';
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reserve_inventory_trigger 
    AFTER INSERT ON public.orders 
    FOR EACH ROW EXECUTE FUNCTION reserve_inventory_on_order();

-- ایجاد function برای آزادسازی موجودی هنگام لغو سفارش
CREATE OR REPLACE FUNCTION release_inventory_on_cancel()
RETURNS TRIGGER AS $$
DECLARE
    item RECORD;
BEGIN
    -- آزادسازی موجودی در صورت لغو سفارش
    IF OLD.status != 'cancelled' AND NEW.status = 'cancelled' THEN
        FOR item IN 
            SELECT product_id, quantity 
            FROM public.order_items 
            WHERE order_id = NEW.id
        LOOP
            UPDATE public.inventory 
            SET reserved_quantity = GREATEST(0, reserved_quantity - item.quantity)
            WHERE product_id = item.product_id 
            AND warehouse_id = 'main';
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER release_inventory_trigger 
    AFTER UPDATE ON public.orders 
    FOR EACH ROW EXECUTE FUNCTION release_inventory_on_cancel();

-- ایجاد function برای کاهش موجودی هنگام تحویل سفارش
CREATE OR REPLACE FUNCTION reduce_inventory_on_delivery()
RETURNS TRIGGER AS $$
DECLARE
    item RECORD;
BEGIN
    -- کاهش موجودی در صورت تحویل سفارش
    IF OLD.status != 'delivered' AND NEW.status = 'delivered' THEN
        FOR item IN 
            SELECT product_id, quantity 
            FROM public.order_items 
            WHERE order_id = NEW.id
        LOOP
            UPDATE public.inventory 
            SET 
                quantity = GREATEST(0, quantity - item.quantity),
                reserved_quantity = GREATEST(0, reserved_quantity - item.quantity)
            WHERE product_id = item.product_id 
            AND warehouse_id = 'main';
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reduce_inventory_trigger 
    AFTER UPDATE ON public.orders 
    FOR EACH ROW EXECUTE FUNCTION reduce_inventory_on_delivery();