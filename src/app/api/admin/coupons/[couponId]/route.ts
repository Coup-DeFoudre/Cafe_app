import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

// GET - Get a specific coupon
export async function GET(
  request: NextRequest,
  { params }: { params: { couponId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.cafeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const coupon = await prisma.coupon.findFirst({
      where: {
        id: params.couponId,
        cafeId: session.user.cafeId,
      },
    });

    if (!coupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    }

    return NextResponse.json(coupon);
  } catch (error) {
    console.error('Error fetching coupon:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coupon' },
      { status: 500 }
    );
  }
}

// PATCH - Update a coupon
export async function PATCH(
  request: NextRequest,
  { params }: { params: { couponId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.cafeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscount,
      usageLimit,
      validFrom,
      validUntil,
      isActive,
    } = body;

    // Check if coupon exists and belongs to this cafe
    const existingCoupon = await prisma.coupon.findFirst({
      where: {
        id: params.couponId,
        cafeId: session.user.cafeId,
      },
    });

    if (!existingCoupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    }

    // If code is being changed, check for duplicates
    if (code && code.toUpperCase() !== existingCoupon.code) {
      const duplicateCoupon = await prisma.coupon.findUnique({
        where: {
          cafeId_code: {
            cafeId: session.user.cafeId,
            code: code.toUpperCase(),
          },
        },
      });

      if (duplicateCoupon) {
        return NextResponse.json(
          { error: 'A coupon with this code already exists' },
          { status: 400 }
        );
      }
    }

    const updatedCoupon = await prisma.coupon.update({
      where: { id: params.couponId },
      data: {
        ...(code && { code: code.toUpperCase() }),
        ...(description !== undefined && { description }),
        ...(discountType && { discountType }),
        ...(discountValue !== undefined && { discountValue: parseFloat(discountValue) }),
        ...(minOrderValue !== undefined && { minOrderValue: parseFloat(minOrderValue) }),
        ...(maxDiscount !== undefined && { maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null }),
        ...(usageLimit !== undefined && { usageLimit: usageLimit ? parseInt(usageLimit) : null }),
        ...(validFrom && { validFrom: new Date(validFrom) }),
        ...(validUntil !== undefined && { validUntil: validUntil ? new Date(validUntil) : null }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json(updatedCoupon);
  } catch (error) {
    console.error('Error updating coupon:', error);
    return NextResponse.json(
      { error: 'Failed to update coupon' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a coupon
export async function DELETE(
  request: NextRequest,
  { params }: { params: { couponId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.cafeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if coupon exists and belongs to this cafe
    const existingCoupon = await prisma.coupon.findFirst({
      where: {
        id: params.couponId,
        cafeId: session.user.cafeId,
      },
    });

    if (!existingCoupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    }

    await prisma.coupon.delete({
      where: { id: params.couponId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    return NextResponse.json(
      { error: 'Failed to delete coupon' },
      { status: 500 }
    );
  }
}

