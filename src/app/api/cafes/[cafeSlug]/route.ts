import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: { cafeSlug: string } }
) {
  try {
    const { cafeSlug } = params;

    const cafe = await prisma.cafe.findUnique({
      where: {
        slug: cafeSlug,
      },
      include: {
        settings: true,
      },
    });

    if (!cafe) {
      return errorResponse('Cafe not found', 404);
    }

    return successResponse({
      id: cafe.id,
      name: cafe.name,
      slug: cafe.slug,
      logo: cafe.logo,
      bannerImage: cafe.bannerImage,
      tagline: cafe.tagline,
      description: cafe.description,
      phone: cafe.phone,
      email: cafe.email,
      address: cafe.address,
      businessHours: cafe.businessHours,
      socialLinks: cafe.socialLinks,
      themeColors: cafe.themeColors,
      settings: cafe.settings,
    });
  } catch (error) {
    return handleApiError(error);
  }
}