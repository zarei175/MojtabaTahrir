import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface CartResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

interface CartItem {
  product_id: string;
  quantity: number;
  price_type?: 'wholesale' | 'retail';
}

interface CartRequest {
  action: 'get' | 'add' | 'update' | 'remove' | 'clear';
  user_id?: string;
  session_id?: string;
  product_id?: string;
  quantity?: number;
  price_type?: 'wholesale' | 'retail';
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CartResponse>
) {
  try {
    const { action, user_id, session_id, product_id, quantity, price_type }: CartRequest = 
      req.method === 'GET' ? req.query as any : req.body;

    // شناسایی کاربر (ثبت‌نام شده یا مهمان)
    const cartIdentifier = user_id || session_id;
    if (!cartIdentifier) {
      return res.status(400).json({
        success: false,
        message: 'شناسه کاربر یا نشست الزامی است'
      });
    }

    switch (action) {
      case 'get':
        return await getCart(cartIdentifier, user_id ? 'user' : 'session', res);
      
      case 'add':
        if (!product_id || !quantity) {
          return res.status(400).json({
            success: false,
            message: 'شناسه محصول و تعداد الزامی است'
          });
        }
        return await addToCart(cartIdentifier, user_id ? 'user' : 'session', {
          product_id,
          quantity,
          price_type: price_type || 'retail'
        }, res);
      
      case 'update':
        if (!product_id || !quantity) {
          return res.status(400).json({
            success: false,
            message: 'شناسه محصول و تعداد الزامی است'
          });
        }
        return await updateCartItem(cartIdentifier, user_id ? 'user' : 'session', {
          product_id,
          quantity,
          price_type: price_type || 'retail'
        }, res);
      
      case 'remove':
        if (!product_id) {
          return res.status(400).json({
            success: false,
            message: 'شناسه محصول الزامی است'
          });
        }
        return await removeFromCart(cartIdentifier, user_id ? 'user' : 'session', product_id, res);
      
      case 'clear':
        return await clearCart(cartIdentifier, user_id ? 'user' : 'session', res);
      
      default:
        return res.status(400).json({
          success: false,
          message: 'عملیات نامعتبر'
        });
    }
  } catch (error) {
    console.error('خطا در API سبد خرید:', error);
    return res.status(500).json({
      success: false,
      message: 'خطای داخلی سرور',
      error: error instanceof Error ? error.message : 'خطای نامشخص'
    });
  }
}

async function getCart(identifier: string, type: 'user' | 'session', res: NextApiResponse<CartResponse>) {
  try {
    const { data: cartItems, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        products (
          id,
          name,
          sku,
          description,
          weight,
          dimensions,
          categories (name),
          brands (name)
        ),
        product_prices (
          price_type,
          price,
          compare_price,
          min_quantity
        )
      `)
      .eq(type === 'user' ? 'user_id' : 'session_id', identifier)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'خطا در دریافت سبد خرید',
        error: error.message
      });
    }

    // محاسبه مجموع قیمت
    let totalPrice = 0;
    let totalItems = 0;

    const processedItems = cartItems?.map(item => {
      const price = item.product_prices?.find(p => p.price_type === item.price_type)?.price || 0;
      const itemTotal = price * item.quantity;
      totalPrice += itemTotal;
      totalItems += item.quantity;

      return {
        ...item,
        unit_price: price,
        total_price: itemTotal
      };
    }) || [];

    return res.status(200).json({
      success: true,
      message: 'سبد خرید با موفقیت دریافت شد',
      data: {
        items: processedItems,
        summary: {
          total_items: totalItems,
          total_price: totalPrice,
          currency: 'IRR'
        }
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'خطا در دریافت سبد خرید',
      error: error instanceof Error ? error.message : 'خطای نامشخص'
    });
  }
}

async function addToCart(
  identifier: string, 
  type: 'user' | 'session', 
  item: CartItem, 
  res: NextApiResponse<CartResponse>
) {
  try {
    // بررسی وجود محصول
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name, is_active')
      .eq('id', item.product_id)
      .eq('is_active', true)
      .single();

    if (productError || !product) {
      return res.status(404).json({
        success: false,
        message: 'محصول یافت نشد یا غیرفعال است'
      });
    }

    // بررسی موجودی
    const { data: inventory } = await supabase
      .from('inventory')
      .select('quantity, reserved_quantity')
      .eq('product_id', item.product_id)
      .single();

    const availableQuantity = (inventory?.quantity || 0) - (inventory?.reserved_quantity || 0);
    if (availableQuantity < item.quantity) {
      return res.status(400).json({
        success: false,
        message: `موجودی کافی نیست. موجودی فعلی: ${availableQuantity}`
      });
    }

    // بررسی وجود آیتم در سبد خرید
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('*')
      .eq(type === 'user' ? 'user_id' : 'session_id', identifier)
      .eq('product_id', item.product_id)
      .eq('price_type', item.price_type)
      .single();

    if (existingItem) {
      // بروزرسانی تعداد
      const newQuantity = existingItem.quantity + item.quantity;
      
      if (availableQuantity < newQuantity) {
        return res.status(400).json({
          success: false,
          message: `موجودی کافی نیست. موجودی فعلی: ${availableQuantity}`
        });
      }

      const { data: updatedItem, error: updateError } = await supabase
        .from('cart_items')
        .update({
          quantity: newQuantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingItem.id)
        .select()
        .single();

      if (updateError) {
        return res.status(400).json({
          success: false,
          message: 'خطا در بروزرسانی سبد خرید',
          error: updateError.message
        });
      }

      return res.status(200).json({
        success: true,
        message: 'محصول در سبد خرید بروزرسانی شد',
        data: updatedItem
      });
    } else {
      // افزودن آیتم جدید
      const cartItemData = {
        product_id: item.product_id,
        quantity: item.quantity,
        price_type: item.price_type,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (type === 'user') {
        (cartItemData as any).user_id = identifier;
      } else {
        (cartItemData as any).session_id = identifier;
      }

      const { data: newItem, error: insertError } = await supabase
        .from('cart_items')
        .insert(cartItemData)
        .select()
        .single();

      if (insertError) {
        return res.status(400).json({
          success: false,
          message: 'خطا در افزودن به سبد خرید',
          error: insertError.message
        });
      }

      return res.status(201).json({
        success: true,
        message: 'محصول به سبد خرید اضافه شد',
        data: newItem
      });
    }

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'خطا در افزودن به سبد خرید',
      error: error instanceof Error ? error.message : 'خطای نامشخص'
    });
  }
}

async function updateCartItem(
  identifier: string,
  type: 'user' | 'session',
  item: CartItem,
  res: NextApiResponse<CartResponse>
) {
  try {
    if (item.quantity <= 0) {
      return await removeFromCart(identifier, type, item.product_id, res);
    }

    // بررسی موجودی
    const { data: inventory } = await supabase
      .from('inventory')
      .select('quantity, reserved_quantity')
      .eq('product_id', item.product_id)
      .single();

    const availableQuantity = (inventory?.quantity || 0) - (inventory?.reserved_quantity || 0);
    if (availableQuantity < item.quantity) {
      return res.status(400).json({
        success: false,
        message: `موجودی کافی نیست. موجودی فعلی: ${availableQuantity}`
      });
    }

    const { data: updatedItem, error } = await supabase
      .from('cart_items')
      .update({
        quantity: item.quantity,
        updated_at: new Date().toISOString()
      })
      .eq(type === 'user' ? 'user_id' : 'session_id', identifier)
      .eq('product_id', item.product_id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'خطا در بروزرسانی سبد خرید',
        error: error.message
      });
    }

    return res.status(200).json({
      success: true,
      message: 'سبد خرید بروزرسانی شد',
      data: updatedItem
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'خطا در بروزرسانی سبد خرید',
      error: error instanceof Error ? error.message : 'خطای نامشخص'
    });
  }
}

async function removeFromCart(
  identifier: string,
  type: 'user' | 'session',
  productId: string,
  res: NextApiResponse<CartResponse>
) {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq(type === 'user' ? 'user_id' : 'session_id', identifier)
      .eq('product_id', productId);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'خطا در حذف از سبد خرید',
        error: error.message
      });
    }

    return res.status(200).json({
      success: true,
      message: 'محصول از سبد خرید حذف شد'
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'خطا در حذف از سبد خرید',
      error: error instanceof Error ? error.message : 'خطای نامشخص'
    });
  }
}

async function clearCart(
  identifier: string,
  type: 'user' | 'session',
  res: NextApiResponse<CartResponse>
) {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq(type === 'user' ? 'user_id' : 'session_id', identifier);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'خطا در پاک کردن سبد خرید',
        error: error.message
      });
    }

    return res.status(200).json({
      success: true,
      message: 'سبد خرید پاک شد'
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'خطا در پاک کردن سبد خرید',
      error: error instanceof Error ? error.message : 'خطای نامشخص'
    });
  }
}