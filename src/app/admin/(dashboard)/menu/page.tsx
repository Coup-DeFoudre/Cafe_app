import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth-config'
import { getCategoriesWithCount, getMenuItems } from '@/lib/queries/menu'
import DashboardHeader from '@/components/admin/DashboardHeader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CategoriesTab } from '@/components/admin/menu/CategoriesTab'
import { MenuItemsTab } from '@/components/admin/menu/MenuItemsTab'
import type { AdminMenuCategory, AdminMenuItem } from '@/types/menu'

export default async function MenuPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/admin/login')
  }

  const cafeId = session.user.cafeId
  const categories = await getCategoriesWithCount(cafeId, true) // Include inactive categories for admin
  const items = await getMenuItems(cafeId)

  return (
    <div className="space-y-8">
      <DashboardHeader 
        title="Menu Management" 
        description="Manage your cafe's menu categories and items" 
      />
      
      <Tabs defaultValue="categories" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="items">Menu Items</TabsTrigger>
        </TabsList>
        
        <TabsContent value="categories" className="space-y-6">
          <CategoriesTab categories={categories} />
        </TabsContent>
        
        <TabsContent value="items" className="space-y-6">
          <MenuItemsTab items={items} categories={categories} />
        </TabsContent>
      </Tabs>
    </div>
  )
}