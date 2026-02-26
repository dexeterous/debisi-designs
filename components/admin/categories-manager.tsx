'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Category } from '@/lib/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface CategoriesManagerProps {
  categories: Category[]
}

const iconOptions = [
  { value: 'ri-book-2-line', label: 'Book' },
  { value: 'ri-printer-line', label: 'Printer' },
  { value: 'ri-instagram-line', label: 'Instagram' },
  { value: 'ri-slideshow-line', label: 'Slideshow' },
  { value: 'ri-play-circle-line', label: 'Play' },
  { value: 'ri-image-2-line', label: 'Image' },
  { value: 'ri-computer-line', label: 'Computer' },
  { value: 'ri-book-open-line', label: 'Book Open' },
  { value: 'ri-palette-line', label: 'Palette' },
  { value: 'ri-brush-line', label: 'Brush' },
  { value: 'ri-pen-nib-line', label: 'Pen' },
  { value: 'ri-film-line', label: 'Film' },
]

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function CategoriesManager({ categories }: CategoriesManagerProps) {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('ri-folder-line')

  const resetForm = () => {
    setName('')
    setSlug('')
    setDescription('')
    setIcon('ri-folder-line')
    setEditingCategory(null)
  }

  const openEditDialog = (category: Category) => {
    setEditingCategory(category)
    setName(category.name)
    setSlug(category.slug)
    setDescription(category.description || '')
    setIcon(category.icon || 'ri-folder-line')
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createClient()

    try {
      const data = {
        name,
        slug,
        description: description || null,
        icon,
      }

      if (editingCategory) {
        await supabase
          .from('categories')
          .update(data)
          .eq('id', editingCategory.id)
      } else {
        await supabase
          .from('categories')
          .insert({ ...data, display_order: categories.length })
      }

      setIsDialogOpen(false)
      resetForm()
      router.refresh()
    } catch (error) {
      console.error('Error saving category:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return

    const supabase = createClient()
    await supabase.from('categories').delete().eq('id', deleteId)
    setDeleteId(null)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white">
              <i className="ri-add-line mr-2"></i>
              New Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-bricolage">
                {editingCategory ? 'Edit Category' : 'New Category'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (!editingCategory) {
                      setSlug(slugify(e.target.value))
                    }
                  }}
                  required
                  placeholder="Category name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  placeholder="category-slug"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Icon</Label>
                <div className="grid grid-cols-6 gap-2">
                  {iconOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setIcon(opt.value)}
                      className={`p-3 rounded-lg border transition-colors ${
                        icon === opt.value
                          ? 'border-primary bg-primary/10'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      title={opt.label}
                    >
                      <i className={`${opt.value} text-xl`}></i>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false)
                    resetForm()
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Card key={category.id} className="border-[#e5e5e5]">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <i className={`${category.icon || 'ri-folder-line'} text-xl text-primary`}></i>
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">{category.name}</CardTitle>
                  <p className="text-xs text-black-100/60">/{category.slug}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => openEditDialog(category)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <i className="ri-edit-line text-black-100/60"></i>
                </button>
                <button
                  onClick={() => setDeleteId(category.id)}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-500"
                >
                  <i className="ri-delete-bin-line"></i>
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-black-100/60 line-clamp-2">
                {category.description || 'No description'}
              </p>
            </CardContent>
          </Card>
        ))}

        {categories.length === 0 && (
          <div className="col-span-full bg-white rounded-xl border border-[#e5e5e5] p-12 text-center">
            <i className="ri-folder-add-line text-4xl text-gray-300 mb-4 block"></i>
            <p className="text-black-100/60 mb-4">No categories yet</p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              <i className="ri-add-line mr-2"></i>
              Create First Category
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the category. Projects in this category will become uncategorized.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
