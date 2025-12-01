import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;

    if (!orderId) {
      return errorResponse('Order ID is required', 400);
    }

    // Query order with related data
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        cafe: {
          select: {
            id: true,
            name: true,
            logo: true,
            phone: true
          }
        },
        orderItems: {
          include: {
            menuItem: {
              select: {
                image: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      return errorResponse('Order not found', 404);
    }

    // Format response data
    const responseData = {
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      orderType: order.orderType,
      tableNumber: order.tableNumber,
      deliveryAddress: order.deliveryAddress,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      paymentReferenceId: order.paymentReferenceId,
      specialInstructions: order.specialInstructions,
      subtotal: order.subtotal,
      tax: order.tax,
      deliveryCharge: order.deliveryCharge,
      total: order.total,
      createdAt: order.createdAt.toISOString(),
      cafe: {
        id: order.cafe.id,
        name: order.cafe.name,
        logo: order.cafe.logo,
        phone: order.cafe.phone
      },
      orderItems: order.orderItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.subtotal,
        image: item.menuItem.image,
        customizations: item.customizations
      }))
    };

    return successResponse(responseData);

  } catch (error) {
    return handleApiError(error);
  }
}