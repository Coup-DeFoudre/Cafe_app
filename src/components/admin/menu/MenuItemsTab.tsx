'use client'

import { useState, useTransition, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Edit, Trash2, GripVertical, Image as ImageIcon, Search } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { MenuItemDialog } from './MenuItemDialog'
import { DeleteDialog } from './DeleteDialog'
import type { AdminMenuItem, AdminMenuCategory } from '@/types/menu'

interface MenuItemsTabProps {
  items: AdminMenuItem[]
  categories: AdminMenuCategory[]
}

interface SortableMenuItemProps {
  item: AdminMenuItem
  onEdit: (item: AdminMenuItem) => void
  onDelete: (item: AdminMenuItem) => void
  onToggleAvailable: (itemId: string, isAvailable: boolean) => void
}

function SortableMenuItem({ 
  item, 
  onEdit, 
  onDelete, 
  onToggleAvailable 
}: SortableMenuItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`bg-white border rounded-lg shadow-sm transition-opacity ${isDragging ? 'opacity-50' : 'opacity-100'}`}
    >
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            {...attributes}
            {...listeners}
            className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-4 h-4" />
          </button>
          
          {item.image ? (
            <div className="relative w-16 h-16 rounded-lg overflow-hidden">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-gray-400" />
            </div>
          )}
          
          <div className="flex-1">
            <h3 className="font-medium">{item.name}</h3>
            {item.description && (
              <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
            )}
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">
                ${item.price.toFixed(2)}
              </Badge>
              <Badge 
                variant={item.isVeg ? "default" : "destructive"}
                className={item.isVeg ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
              >
                {item.isVeg ? "Veg" : "Non-veg"}
              </Badge>
              {item.category && (
                <Badge variant="secondary">
                  {item.category.name}
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Available</span>
              <Switch
                checked={item.isAvailable}
                onCheckedChange={(checked) => onToggleAvailable(item.id, checked)}
              />
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(item)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(item)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export function MenuItemsTab({ items: initialItems, categories }: MenuItemsTabProps) {
  const [items, setItems] = useState(initialItems)
  const [filteredItems, setFilteredItems] = useState(initialItems)
  const [editingItem, setEditingItem] = useState<AdminMenuItem | null>(null)
  const [deletingItem, setDeletingItem] = useState<AdminMenuItem | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isDragging, setIsDragging] = useState(false)
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Filter items based on search, category, and status
  const applyFilters = useCallback(() => {
    let filtered = items

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.categoryId === selectedCategory)
    }

    if (statusFilter === 'available') {
      filtered = filtered.filter(item => item.isAvailable)
    } else if (statusFilter === 'unavailable') {
      filtered = filtered.filter(item => !item.isAvailable)
    }

    setFilteredItems(filtered)
  }, [items, searchQuery, selectedCategory, statusFilter])

  // Reset category selection if selected category no longer exists
  useEffect(() => {
    if (selectedCategory !== 'all') {
      const categoryExists = categories.some(cat => cat.id === selectedCategory)
      if (!categoryExists) {
        setSelectedCategory('all')
      }
    }
  }, [categories, selectedCategory])

  // Apply filters when dependencies change
  useEffect(() => {
    applyFilters()
  }, [applyFilters])

  const handleDragStart = () => {
    setIsDragging(true)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setIsDragging(false)
    const { active, over } = event

    if (over && active.id !== over.id) {
      // Only allow reordering within the same category and when not searching
      if (selectedCategory === 'all' || searchQuery !== '') {
        toast.error('Reordering is only available when viewing a specific category without search filters')
        return
      }

      const oldIndex = filteredItems.findIndex((item) => item.id === active.id)
      const newIndex = filteredItems.findIndex((item) => item.id === over.id)

      const newItems = arrayMove(filteredItems, oldIndex, newIndex)
      setFilteredItems(newItems)

      // Update the main items array to maintain consistency
      const updatedItems = items.map(item => {
        const reorderedItem = newItems.find(ni => ni.id === item.id)
        return reorderedItem || item
      })
      setItems(updatedItems)

      // Update order on server - only include items for the active category
      const reorderData = newItems.map((item, index) => ({
        id: item.id,
        order: index + 1  // Use 1-based indexing to match creation logic
      }))

      startTransition(async () => {
        try {
          const response = await fetch('/api/admin/menu/items/reorder', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              categoryId: selectedCategory,
              items: reorderData 
            })
          })

          if (!response.ok) {
            throw new Error('Failed to reorder items')
          }

          toast.success('Items reordered successfully')
        } catch (error) {
          toast.error('Failed to reorder items')
          setItems(initialItems)
          setFilteredItems(initialItems)
        }
      })
    }
  }

  const handleToggleAvailable = (itemId: string, isAvailable: boolean) => {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/menu/items/${itemId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isAvailable })
        })

        if (!response.ok) {
          throw new Error('Failed to update item')
        }

        const updateItems = (items: AdminMenuItem[]) =>
          items.map(item => 
            item.id === itemId ? { ...item, isAvailable } : item
          )

        setItems(updateItems)
        setFilteredItems(prev => updateItems(prev))

        toast.success(`Item marked as ${isAvailable ? 'available' : 'unavailable'}`)
      } catch (error) {
        toast.error('Failed to update item')
      }
    })
  }

  const handleItemCreated = (newItem: AdminMenuItem) => {
    setItems(prev => [newItem, ...prev])
    setIsCreateDialogOpen(false)
    toast.success('Item created successfully')
  }

  const handleItemUpdated = (updatedItem: AdminMenuItem) => {
    const updateItems = (items: AdminMenuItem[]) =>
      items.map(item => 
        item.id === updatedItem.id ? updatedItem : item
      )

    setItems(updateItems)
    setFilteredItems(prev => updateItems(prev))
    setEditingItem(null)
    toast.success('Item updated successfully')
  }

  const handleItemDeleted = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId))
    setFilteredItems(prev => prev.filter(item => item.id !== itemId))
    setDeletingItem(null)
    toast.success('Item deleted successfully')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Menu Items</h2>
          <p className="text-gray-600">Manage your menu items and their details</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="unavailable">Unavailable</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredItems.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-500 mb-4">
              {items.length === 0 ? 'No items found' : 'No items match your filters'}
            </p>
            {items.length === 0 && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create your first item
              </Button>
            )}
          </CardContent>
        </Card>
      ) : selectedCategory !== 'all' && searchQuery === '' ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredItems.map(item => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {filteredItems.map((item) => (
                <SortableMenuItem
                  key={item.id}
                  item={item}
                  onEdit={setEditingItem}
                  onDelete={setDeletingItem}
                  onToggleAvailable={handleToggleAvailable}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="space-y-3">
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-sm text-blue-700">
            <strong>Note:</strong> Item reordering is only available when viewing a specific category without search filters.
          </div>
          {filteredItems.map((item) => (
            <SortableMenuItem
              key={item.id}
              item={item}
              onEdit={setEditingItem}
              onDelete={setDeletingItem}
              onToggleAvailable={handleToggleAvailable}
            />
          ))}
        </div>
      )}

      <MenuItemDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        categories={categories}
        onSuccess={handleItemCreated}
      />

      <MenuItemDialog
        open={!!editingItem}
        onOpenChange={(open: boolean) => !open && setEditingItem(null)}
        item={editingItem}
        categories={categories}
        onSuccess={handleItemUpdated}
      />

      <DeleteDialog
        open={!!deletingItem}
        onOpenChange={(open: boolean) => !open && setDeletingItem(null)}
        title="Delete Item"
        description={`Are you sure you want to permanently delete "${deletingItem?.name}"? This action cannot be undone and will remove this menu item from your cafe's menu.`}
        onConfirm={async () => {
          if (!deletingItem) return

          try {
            const response = await fetch(`/api/admin/menu/items/${deletingItem.id}`, {
              method: 'DELETE'
            })

            if (!response.ok) {
              throw new Error('Failed to delete item')
            }

            handleItemDeleted(deletingItem.id)
          } catch (error) {
            toast.error('Failed to delete item')
          }
        }}
      />
    </div>
  )
}