import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: { cafeSlug: string } }
) {
  try {
    const { cafeSlug } = params;
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const categoryId = searchParams.get('categoryId');
    const isVeg = searchParams.get('isVeg');

    // First find the cafe
    const cafe = await prisma.cafe.findUnique({
      where: {
        slug: cafeSlug,
      },
    });

    if (!cafe) {
      return errorResponse('Cafe not found', 404);
    }

    // Build menu item filters
    const menuItemFilters: any = {
      isAvailable: true,
    };

    if (search) {
      menuItemFilters.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    if (isVeg === 'true') {
      menuItemFilters.isVeg = true;
    } else if (isVeg === 'false') {
      menuItemFilters.isVeg = false;
    }

    // Build category filters
    const categoryFilters: any = {
      cafeId: cafe.id,
      isActive: true,
    };

    if (categoryId) {
      categoryFilters.id = categoryId;
    }

    // Fetch categories with filtered items
    const categories = await prisma.menuCategory.findMany({
      where: categoryFilters,
      include: {
        menuItems: {
          where: menuItemFilters,
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    });

    // Flatten all items for the response
    const allItems = categories.flatMap(category =>
      category.menuItems.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image,
        isAvailable: item.isAvailable,
        isVeg: item.isVeg,
        categoryId: item.categoryId,
        category: {
          name: category.name,
        },
      }))
    );

    return successResponse({
      categories: categories.map(category => ({
        id: category.id,
        name: category.name,
        description: category.description,
        order: category.order,
        itemCount: category.menuItems.length,
      })),
      items: allItems,
    });
  } catch (error) {
    return handleApiError(error);
  }
}