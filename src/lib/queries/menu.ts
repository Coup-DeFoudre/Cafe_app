import { prisma } from '@/lib/prisma'

export type CategoryWithCount = {
  id: string
  cafeId: string
  name: string
  description: string | null
  order: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  _count: {
    menuItems: number
  }
}

export type MenuItemWithCategory = {
  id: string
  cafeId: string
  categoryId: string
  name: string
  description: string | null
  price: number
  image: string | null
  isAvailable: boolean
  isVeg: boolean
  customizations: any
  order: number
  createdAt: Date
  updatedAt: Date
  category: {
    name: string
  }
}

export type CategoryById = {
  id: string
  cafeId: string
  name: string
  description: string | null
  order: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
} | null

export type MenuItemById = {
  id: string
  cafeId: string
  categoryId: string
  name: string
  description: string | null
  price: number
  image: string | null
  isAvailable: boolean
  isVeg: boolean
  customizations: any
  order: number
  createdAt: Date
  updatedAt: Date
  category: {
    id: string
    name: string
  }
} | null

export async function getCategoriesWithCount(cafeId: string, includeInactive = true): Promise<CategoryWithCount[]> {
  const whereClause: any = { cafeId }
  
  if (!includeInactive) {
    whereClause.isActive = true
  }

  return await prisma.menuCategory.findMany({
    where: whereClause,
    include: {
      _count: {
        select: {
          menuItems: true
        }
      }
    },
    orderBy: { order: 'asc' }
  })
}

export async function getMenuItems(cafeId: string, categoryId?: string): Promise<MenuItemWithCategory[]> {
  const filter: any = { cafeId }
  if (categoryId) {
    filter.categoryId = categoryId
  }

  return await prisma.menuItem.findMany({
    where: filter,
    include: {
      category: {
        select: {
          name: true
        }
      }
    },
    orderBy: { order: 'asc' }
  })
}

export async function getCategoryById(cafeId: string, categoryId: string): Promise<CategoryById> {
  return await prisma.menuCategory.findFirst({
    where: { 
      id: categoryId, 
      cafeId 
    }
  })
}

export async function getMenuItemById(cafeId: string, itemId: string): Promise<MenuItemById> {
  return await prisma.menuItem.findFirst({
    where: { 
      id: itemId, 
      cafeId 
    },
    include: {
      category: {
        select: {
          id: true,
          name: true
        }
      }
    }
  })
}