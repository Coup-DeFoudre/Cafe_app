import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DEFAULT_CAFE_SLUG } from '@/lib/constants';

// POST - Validate a coupon code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, subtotal } = body;

    if (!code) {
      return NextResponse.json(
        { error: 'Coupon code is required' },
        { status: 400 }
      );
    }

    // Get cafe ID
    const cafe = await prisma.cafe.findUnique({
      where: { slug: DEFAULT_CAFE_SLUG },
      select: { id: true },
    });

    if (!cafe) {
      return NextResponse.json(
        { error: 'Cafe not found' },
        { status: 404 }
      );
    }

    // Find the coupon
    const coupon = await prisma.coupon.findUnique({
      where: {
        cafeId_code: {
          cafeId: cafe.id,
          code: code.toUpperCase(),
        },
      },
    });

    if (!coupon) {
      return NextResponse.json(
        { valid: false, error: 'Invalid coupon code' },
        { status: 200 }
      );
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      return NextResponse.json(
        { valid: false, error: 'This coupon is no longer active' },
        { status: 200 }
      );
    }

    // Check validity dates
    const now = new Date();
    if (coupon.validFrom && now < coupon.validFrom) {
      return NextResponse.json(
        { valid: false, error: 'This coupon is not yet valid' },
        { status: 200 }
      );
    }

    if (coupon.validUntil && now > coupon.validUntil) {
      return NextResponse.json(
        { valid: false, error: 'This coupon has expired' },
        { status: 200 }
      );
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json(
        { valid: false, error: 'This coupon has reached its usage limit' },
        { status: 200 }
      );
    }

    // Check minimum order value
    if (subtotal && coupon.minOrderValue > 0 && subtotal < coupon.minOrderValue) {
      return NextResponse.json(
        { 
          valid: false, 
          error: `Minimum order value of ₹${coupon.minOrderValue} required for this coupon` 
        },
        { status: 200 }
      );
    }

    // Calculate discount
    let discountAmount = 0;
    if (subtotal) {
      if (coupon.discountType === 'PERCENTAGE') {
        discountAmount = (subtotal * coupon.discountValue) / 100;
        // Apply max discount cap if set
        if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
          discountAmount = coupon.maxDiscount;
        }
      } else {
        // FIXED discount
        discountAmount = coupon.discountValue;
        // Don't allow discount greater than subtotal
        if (discountAmount > subtotal) {
          discountAmount = subtotal;
        }
      }
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minOrderValue: coupon.minOrderValue,
        maxDiscount: coupon.maxDiscount,
      },
      discountAmount: Math.round(discountAmount * 100) / 100, // Round to 2 decimal places
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    return NextResponse.json(
      { error: 'Failed to validate coupon' },
      { status: 500 }
    );
  }
}

