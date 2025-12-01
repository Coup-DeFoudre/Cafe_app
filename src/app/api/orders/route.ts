import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-helpers';
import { generateOrderNumber, calculateSubtotal, calculateTax, calculateTotal } from '@/lib/utils/order';
import { OrderType, PaymentMethod, PaymentStatus, OrderStatus, type OrderNotification } from '@/types';
import { triggerOrderCreated } from '@/lib/pusher-server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const {
      cafeSlug,
      customerName,
      customerPhone,
      orderType,
      tableNumber,
      deliveryAddress,
      specialInstructions,
      items,
      subtotal,
      tax,
      deliveryCharge,
      total,
      paymentMethod,
      paymentReferenceId
    } = body;

    // Basic validation
    if (!cafeSlug || !customerName || !customerPhone || !orderType || !items || items.length === 0 || !paymentMethod) {
      return errorResponse('Missing required fields', 400);
    }

    // Validate order type specific fields
    if (orderType === OrderType.DINE_IN && !tableNumber) {
      return errorResponse('Table number is required for dine-in orders', 400);
    }

    if (orderType === OrderType.DELIVERY && !deliveryAddress) {
      return errorResponse('Delivery address is required for delivery orders', 400);
    }

    // Validate payment method specific fields
    if (paymentMethod === PaymentMethod.ONLINE && !paymentReferenceId) {
      return errorResponse('Payment reference ID is required for online payments', 400);
    }

    // Find cafe
    const cafe = await prisma.cafe.findUnique({
      where: { slug: cafeSlug },
      include: { settings: true }
    });

    if (!cafe) {
      return errorResponse('Cafe not found', 404);
    }

    // Validate menu items exist and belong to this cafe
    const menuItemIds = items.map((item: any) => item.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: { in: menuItemIds },
        cafeId: cafe.id,
        isAvailable: true
      }
    });

    if (menuItems.length !== menuItemIds.length) {
      return errorResponse('One or more menu items are not available', 400);
    }

    // Build a map of menuItems by id
    const menuItemsMap = new Map(menuItems.map(item => [item.id, item]));

    // Compute calculatedSubtotal from DB prices × quantities (ignoring client prices)
    let calculatedSubtotal = 0;
    for (const item of items) {
      const menuItem = menuItemsMap.get(item.menuItemId);
      if (!menuItem) {
        return errorResponse(`Menu item ${item.menuItemId} not found`, 400);
      }
      calculatedSubtotal += menuItem.price * item.quantity;
    }

    const calculatedTax = cafe.settings?.taxEnabled ? calculateTax(calculatedSubtotal, cafe.settings.taxRate) : 0;
    const calculatedDeliveryCharge = orderType === OrderType.DELIVERY ? (cafe.settings?.deliveryCharge || 0) : 0;
    const calculatedTotal = calculateTotal(calculatedSubtotal, calculatedTax, calculatedDeliveryCharge);

    // Allow small rounding differences (within 1 unit)
    if (Math.abs(calculatedSubtotal - subtotal) > 1 || 
        Math.abs(calculatedTax - tax) > 1 || 
        Math.abs(calculatedDeliveryCharge - deliveryCharge) > 1 ||
        Math.abs(calculatedTotal - total) > 1) {
      return errorResponse('Order calculations do not match', 400);
    }

    // Generate unique order number
    const orderNumber = generateOrderNumber();

    // Create order using transaction
    const result = await prisma.$transaction(async (tx) => {
      // Find or create customer
      const customer = await tx.customer.upsert({
        where: {
          cafeId_phone: {
            phone: customerPhone,
            cafeId: cafe.id
          }
        },
        update: {
          name: customerName,
          orderCount: { increment: 1 },
          totalSpent: { increment: total }
        },
        create: {
          name: customerName,
          phone: customerPhone,
          cafeId: cafe.id,
          orderCount: 1,
          totalSpent: total
        }
      });

      // Create order
      const order = await tx.order.create({
        data: {
          orderNumber,
          cafeId: cafe.id,
          customerId: customer.id,
          customerName,
          customerPhone,
          orderType,
          tableNumber: orderType === OrderType.DINE_IN ? tableNumber : null,
          deliveryAddress: orderType === OrderType.DELIVERY ? deliveryAddress : null,
          specialInstructions: specialInstructions || null,
          status: OrderStatus.PENDING,
          paymentMethod,
          paymentStatus: paymentMethod === PaymentMethod.CASH ? PaymentStatus.PAID : PaymentStatus.PENDING,
          paymentReferenceId: paymentMethod === PaymentMethod.ONLINE ? paymentReferenceId : null,
          items: items.map((item: any) => {
            const menuItem = menuItemsMap.get(item.menuItemId);
            return {
              ...item,
              name: menuItem?.name || item.name,
              price: menuItem?.price || item.price
            };
          }), // JSON field for order items snapshot with DB-backed fields
          subtotal: calculatedSubtotal,
          tax: calculatedTax,
          deliveryCharge: calculatedDeliveryCharge,
          total: calculatedTotal
        }
      });

      // Create order items using DB name and price
      const orderItems = await Promise.all(
        items.map((item: any) => {
          const menuItem = menuItemsMap.get(item.menuItemId);
          if (!menuItem) {
            throw new Error(`Menu item ${item.menuItemId} not found`);
          }
          return tx.orderItem.create({
            data: {
              orderId: order.id,
              menuItemId: item.menuItemId,
              name: menuItem.name,
              price: menuItem.price,
              quantity: item.quantity,
              subtotal: menuItem.price * item.quantity,
              customizations: item.customizations || {}
            }
          });
        })
      );

      return { order, orderItems };
    });

    // Trigger real-time notification for admin dashboard
    try {
      const orderNotification: OrderNotification = {
        id: result.order.id,
        orderNumber: result.order.orderNumber,
        customerName: result.order.customerName,
        total: result.order.total,
        orderType: result.order.orderType,
        status: result.order.status,
        createdAt: result.order.createdAt.toISOString(),
      }
      await triggerOrderCreated(cafe.id, orderNotification)
    } catch (pusherError) {
      // Log error but don't fail the order creation
      console.error('Failed to send real-time notification:', pusherError)
    }

    return successResponse({
      id: result.order.id,
      orderNumber: result.order.orderNumber,
      status: result.order.status,
      total: result.order.total,
      message: 'Order created successfully'
    });

  } catch (error) {
    return handleApiError(error);
  }
}