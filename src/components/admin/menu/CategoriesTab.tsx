'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Plus, Edit, Trash2, GripVertical } from 'lucide-react'
import { toast } from 'sonner'
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
import { CategoryDialog } from './CategoryDialog'
import { DeleteDialog } from './DeleteDialog'
import type { AdminMenuCategory } from '@/types/menu'

interface CategoriesTabProps {
  categories: AdminMenuCategory[]
}

interface SortableCategoryItemProps {
  category: AdminMenuCategory
  onEdit: (category: AdminMenuCategory) => void
  onDelete: (category: AdminMenuCategory) => void
  onToggleActive: (categoryId: string, isActive: boolean) => void
}

function SortableCategoryItem({ category, onEdit, onDelete, onToggleActive }: SortableCategoryItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: category.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} className="bg-white border rounded-lg shadow-sm">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            {...attributes}
            {...listeners}
            className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-4 h-4" />
          </button>
          <div>
            <h3 className="font-medium">{category.name}</h3>
            {category.description && (
              <p className="text-sm text-gray-600">{category.description}</p>
            )}
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary">
                {category._count?.menuItems || 0} items
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={category.isActive}
            onCheckedChange={(checked) => onToggleActive(category.id, checked)}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(category)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(category)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export function CategoriesTab({ categories: initialCategories }: CategoriesTabProps) {
  const [categories, setCategories] = useState(initialCategories)
  const [editingCategory, setEditingCategory] = useState<AdminMenuCategory | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<AdminMenuCategory | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = categories.findIndex((cat) => cat.id === active.id)
      const newIndex = categories.findIndex((cat) => cat.id === over.id)

      const newCategories = arrayMove(categories, oldIndex, newIndex)
      setCategories(newCategories)

      // Update order on server
      const reorderData = newCategories.map((cat, index) => ({
        id: cat.id,
        order: index + 1  // Use 1-based indexing to match creation logic
      }))

      startTransition(async () => {
        try {
          const response = await fetch('/api/admin/menu/categories/reorder', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: reorderData })
          })

          if (!response.ok) {
            throw new Error('Failed to reorder categories')
          }

          toast.success('Categories reordered successfully')
        } catch (error) {
          toast.error('Failed to reorder categories')
          setCategories(initialCategories) // Revert on error
        }
      })
    }
  }

  const handleToggleActive = (categoryId: string, isActive: boolean) => {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/menu/categories/${categoryId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive })
        })

        if (!response.ok) {
          throw new Error('Failed to update category')
        }

        setCategories(prev => 
          prev.map(cat => 
            cat.id === categoryId ? { ...cat, isActive } : cat
          )
        )

        toast.success(`Category ${isActive ? 'activated' : 'deactivated'}`)
      } catch (error) {
        toast.error('Failed to update category')
      }
    })
  }

  const handleCategoryCreated = (newCategory: AdminMenuCategory) => {
    setCategories(prev => [newCategory, ...prev])
    setIsCreateDialogOpen(false)
    toast.success('Category created successfully')
  }

  const handleCategoryUpdated = (updatedCategory: AdminMenuCategory) => {
    setCategories(prev => 
      prev.map(cat => 
        cat.id === updatedCategory.id ? updatedCategory : cat
      )
    )
    setEditingCategory(null)
    toast.success('Category updated successfully')
  }

  const handleCategoryDeleted = (categoryId: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== categoryId))
    setDeletingCategory(null)
    toast.success('Category deleted successfully')
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Categories</h2>
          <p className="text-gray-600">Manage your menu categories and their order</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {categories.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-500 mb-4">No categories found</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create your first category
            </Button>
          </CardContent>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={categories.map(cat => cat.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {categories.map((category) => (
                <SortableCategoryItem
                  key={category.id}
                  category={category}
                  onEdit={setEditingCategory}
                  onDelete={setDeletingCategory}
                  onToggleActive={handleToggleActive}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <CategoryDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleCategoryCreated}
      />

      <CategoryDialog
        open={!!editingCategory}
        onOpenChange={(open: boolean) => !open && setEditingCategory(null)}
        category={editingCategory}
        onSuccess={handleCategoryUpdated}
      />

      <DeleteDialog
        open={!!deletingCategory}
        onOpenChange={(open: boolean) => !open && setDeletingCategory(null)}
        title="Delete Category"
        description={`Are you sure you want to delete the category "${deletingCategory?.name}"? Categories with menu items (${deletingCategory?._count?.menuItems || 0} items) cannot be deleted - items must be moved or removed first. Deleting will deactivate the category.`}
        onConfirm={async () => {
          if (!deletingCategory) return

          try {
            const response = await fetch(`/api/admin/menu/categories/${deletingCategory.id}`, {
              method: 'DELETE'
            })

            if (!response.ok) {
              const data = await response.json().catch(() => ({}))
              toast.error(data?.message ?? 'Failed to delete category')
              return
            }

            const { data } = await response.json()
            handleCategoryDeleted(deletingCategory.id)
            toast.success('Category deleted successfully')
          } catch (error) {
            toast.error('Failed to delete category')
          }
        }}
      />
    </div>
  )
}