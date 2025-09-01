import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface OrderResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

interface OrderRequest {
  action: 'create' | 'get' | 'list' | 'update_status' | 'cancel';
  user_id?: string;
  session_id?: string;
  order_id?: string;
  customer_info?: {
    name: string;
    email: string;
    phone: string;
    address?: string;
    company?: string;
    tax_id?: string;
  };
  shipping_info?: {
    address: string;
    city: string;
    postal_code: string;
    notes?: string;
  };
  payment_method?: 'cash' | 'card' | 'transfer' | 'credit';
  status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  page?: number;
  limit?: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<OrderResponse>
) {
  try {
    const requestData: OrderRequest = req.method === 'GET' ? req.query as any : req.body;
    const { action } = requestData;

    switch (action) {
      case 'create':
        return await createOrder(requestData, res);
      
      case 'get':
        if (!requestData.order_id) {
          return res.status(400).json({
            success: false,
            message: 'شناسه سفارش الزامی است'
          });
        }
        return await getOrder(requestData.order_id, res);
      
      case 'list':
        return await listOrders(requestData, res);
      
      case 'update_status':
        if (!requestData.order_id || !requestData.status) {
          return res.status(400).json({
            success: false,
            message: 'شناسه سفارش و وضعیت الزامی است'
          });
        }
        return await updateOrderStatus(requestData.order_id, requestData.status, res);
      
      case 'cancel':
        if (!requestData.order_id) {
          return res.status(400).json({
            success: false,
            message: 'شناسه سفارش الزامی است'
          });
        }
        return await cancelOrder(requestData.order_id, res);
      
      default:
        return res.status(400).json({
          success: false,
          message: 'عملیات نامعتبر'
        });
    }
  } catch (error) {
    console.error('خطا در API سفارشات:', error);
    return res.status(500).json({
      success: false,
      message: 'خطای داخلی سرور',
      error: error instanceof Error ? error.message : 'خطای نامشخص'
    });
  }
}

async function createOrder(requestData: OrderRequest, res: NextApiResponse<OrderResponse>) {
  try {
    const { user_id, session_id, customer_info, shipping_info, payment_method } = requestData;
    
    const cartIdentifier = user_id || session_id;
    if (!cartIdentifier) {
      return res.status(400).json({
        success: false,
        message: 'شناسه کاربر یا نشست الزامی است'
      });
    }

    if (!customer_info || !customer_info.name || !customer_info.phone) {
      return res.status(400).json({
        success: false,
        message: 'اطلاعات مشتری (نام و تلفن) الزامی است'
      });
    }

    // دریافت آیتم‌های سبد خرید
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select(`
        *,
        products (
          id,
          name,
          sku,
          weight,
          dimensions
        ),
        product_prices (
          price_type,
          price,
          compare_price,
          min_quantity
        )
      `)
      .eq(user_id ? 'user_id' : 'session_id', cartIdentifier);

    if (cartError || !cartItems || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'سبد خرید خالی است یا خطا در دریافت آیتم‌ها',
        error: cartError?.message
      });
    }

    // محاسبه مجموع قیمت و وزن
    let totalPrice = 0;
    let totalWeight = 0;
    let totalItems = 0;

    const orderItems = cartItems.map(item => {
      const price = item.product_prices?.find(p => p.price_type === item.price_type)?.price || 0;
      const itemTotal = price * item.quantity;
      const itemWeight = (item.products?.weight || 0) * item.quantity;
      
      totalPrice += itemTotal;
      totalWeight += itemWeight;
      totalItems += item.quantity;

      return {
        product_id: item.product_id,
        quantity: item.quantity,
        price_type: item.price_type,
        unit_price: price,
        total_price: itemTotal,
        product_name: item.products?.name,
        product_sku: item.products?.sku
      };
    });

    // تولید شماره سفارش
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // ایجاد سفارش
    const orderData = {
      order_number: orderNumber,
      user_id: user_id || null,
      session_id: session_id || null,
      status: 'pending' as const,
      customer_name: customer_info.name,
      customer_email: customer_info.email || '',
      customer_phone: customer_info.phone,
      customer_address: customer_info.address || '',
      customer_company: customer_info.company || '',
      customer_tax_id: customer_info.tax_id || '',
      shipping_address: shipping_info?.address || customer_info.address || '',
      shipping_city: shipping_info?.city || '',
      shipping_postal_code: shipping_info?.postal_code || '',
      shipping_notes: shipping_info?.notes || '',
      payment_method: payment_method || 'cash',
      total_items: totalItems,
      total_weight: totalWeight,
      total_price: totalPrice,
      currency: 'IRR',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      return res.status(400).json({
        success: false,
        message: 'خطا در ایجاد سفارش',
        error: orderError.message
      });
    }

    // ایجاد آیتم‌های سفارش
    const orderItemsData = orderItems.map(item => ({
      ...item,
      order_id: order.id,
      created_at: new Date().toISOString()
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsData);

    if (itemsError) {
      // در صورت خطا، سفارش را حذف کنیم
      await supabase.from('orders').delete().eq('id', order.id);
      
      return res.status(400).json({
        success: false,
        message: 'خطا در ایجاد آیتم‌های سفارش',
        error: itemsError.message
      });
    }

    // پاک کردن سبد خرید
    await supabase
      .from('cart_items')
      .delete()
      .eq(user_id ? 'user_id' : 'session_id', cartIdentifier);

    // بروزرسانی موجودی (رزرو کردن)
    for (const item of orderItems) {
      await supabase.rpc('reserve_inventory', {
        p_product_id: item.product_id,
        p_quantity: item.quantity
      });
    }

    return res.status(201).json({
      success: true,
      message: 'سفارش با موفقیت ایجاد شد',
      data: {
        order: {
          ...order,
          items: orderItemsData
        }
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'خطا در ایجاد سفارش',
      error: error instanceof Error ? error.message : 'خطای نامشخص'
    });
  }
}

async function getOrder(orderId: string, res: NextApiResponse<OrderResponse>) {
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (
            id,
            name,
            sku,
            description
          )
        )
      `)
      .eq('id', orderId)
      .single();

    if (error || !order) {
      return res.status(404).json({
        success: false,
        message: 'سفارش یافت نشد',
        error: error?.message
      });
    }

    return res.status(200).json({
      success: true,
      message: 'سفارش با موفقیت دریافت شد',
      data: order
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'خطا در دریافت سفارش',
      error: error instanceof Error ? error.message : 'خطای نامشخص'
    });
  }
}

async function listOrders(requestData: OrderRequest, res: NextApiResponse<OrderResponse>) {
  try {
    const { user_id, page = 1, limit = 10 } = requestData;

    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          quantity,
          unit_price,
          total_price,
          products (name, sku)
        )
      `)
      .order('created_at', { ascending: false });

    // فیلتر بر اساس کاربر
    if (user_id) {
      query = query.eq('user_id', user_id);
    }

    // صفحه‌بندی
    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;
    query = query.range(from, to);

    const { data: orders, error, count } = await query;

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'خطا در دریافت لیست سفارشات',
        error: error.message
      });
    }

    return res.status(200).json({
      success: true,
      message: 'لیست سفارشات با موفقیت دریافت شد',
      data: {
        orders: orders || [],
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: count || 0,
          pages: Math.ceil((count || 0) / Number(limit))
        }
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'خطا در دریافت لیست سفارشات',
      error: error instanceof Error ? error.message : 'خطای نامشخص'
    });
  }
}

async function updateOrderStatus(
  orderId: string, 
  status: string, 
  res: NextApiResponse<OrderResponse>
) {
  try {
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'وضعیت نامعتبر'
      });
    }

    const { data: order, error } = await supabase
      .from('orders')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'خطا در بروزرسانی وضعیت سفارش',
        error: error.message
      });
    }

    return res.status(200).json({
      success: true,
      message: 'وضعیت سفارش بروزرسانی شد',
      data: order
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'خطا در بروزرسانی وضعیت سفارش',
      error: error instanceof Error ? error.message : 'خطای نامشخص'
    });
  }
}

async function cancelOrder(orderId: string, res: NextApiResponse<OrderResponse>) {
  try {
    // دریافت اطلاعات سفارش
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          product_id,
          quantity
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return res.status(404).json({
        success: false,
        message: 'سفارش یافت نشد',
        error: orderError?.message
      });
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'سفارش قبلاً لغو شده است'
      });
    }

    if (['shipped', 'delivered'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'سفارش ارسال شده یا تحویل داده شده قابل لغو نیست'
      });
    }

    // لغو سفارش
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (updateError) {
      return res.status(400).json({
        success: false,
        message: 'خطا در لغو سفارش',
        error: updateError.message
      });
    }

    // بازگردانی موجودی
    for (const item of order.order_items) {
      await supabase.rpc('release_inventory', {
        p_product_id: item.product_id,
        p_quantity: item.quantity
      });
    }

    return res.status(200).json({
      success: true,
      message: 'سفارش با موفقیت لغو شد'
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'خطا در لغو سفارش',
      error: error instanceof Error ? error.message : 'خطای نامشخص'
    });
  }
}