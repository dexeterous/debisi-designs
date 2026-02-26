'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Project, Category } from '@/lib/types/database'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
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

interface ProjectsTableProps {
  projects: (Project & { category?: { name: string; slug: string } | null })[]
  categories: Category[]
}

export function ProjectsTable({ projects, categories }: ProjectsTableProps) {
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [filter, setFilter] = useState<string>('all')

  const filteredProjects = projects.filter(project => {
    if (filter === 'all') return true
    if (filter === 'published') return project.published
    if (filter === 'draft') return !project.published
    return project.category_id === filter
  })

  const handleDelete = async () => {
    if (!deleteId) return
    
    setIsDeleting(true)
    const supabase = createClient()
    
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', deleteId)

    if (!error) {
      router.refresh()
    }
    
    setIsDeleting(false)
    setDeleteId(null)
  }

  const togglePublish = async (id: string, currentStatus: boolean) => {
    const supabase = createClient()
    
    await supabase
      .from('projects')
      .update({ published: !currentStatus })
      .eq('id', id)

    router.refresh()
  }

  return (
    <div className="bg-white rounded-xl border border-[#e5e5e5]">
      {/* Filters */}
      <div className="p-4 border-b border-[#e5e5e5] flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all' 
              ? 'bg-primary text-white' 
              : 'bg-gray-100 text-black-100 hover:bg-gray-200'
          }`}
        >
          All ({projects.length})
        </button>
        <button
          onClick={() => setFilter('published')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filter === 'published' 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-100 text-black-100 hover:bg-gray-200'
          }`}
        >
          Published ({projects.filter(p => p.published).length})
        </button>
        <button
          onClick={() => setFilter('draft')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filter === 'draft' 
              ? 'bg-yellow-500 text-white' 
              : 'bg-gray-100 text-black-100 hover:bg-gray-200'
          }`}
        >
          Drafts ({projects.filter(p => !p.published).length})
        </button>
        <div className="h-6 w-px bg-gray-200 mx-2"></div>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === cat.id 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-black-100 hover:bg-gray-200'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Image</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Year</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <TableRow key={project.id}>
                <TableCell>
                  <div className="w-16 h-12 rounded-lg bg-gray-100 overflow-hidden">
                    {project.cover_image_url ? (
                      <img 
                        src={project.cover_image_url} 
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <i className="ri-image-line text-gray-400"></i>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium text-black-100">{project.title}</p>
                    <p className="text-sm text-black-100/60 truncate max-w-[300px]">
                      {project.short_description || 'No description'}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  {project.category?.name || (
                    <span className="text-black-100/40">Uncategorized</span>
                  )}
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => togglePublish(project.id, project.published)}
                    className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                      project.published 
                        ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                        : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                    }`}
                  >
                    {project.published ? 'Published' : 'Draft'}
                  </button>
                </TableCell>
                <TableCell>{project.year || '-'}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <i className="ri-more-2-fill"></i>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/projects/${project.id}/edit`}>
                          <i className="ri-edit-line mr-2"></i>
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link 
                          href={`/${project.category?.slug || 'uncategorized'}/${project.slug}`}
                          target="_blank"
                        >
                          <i className="ri-external-link-line mr-2"></i>
                          View
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onSelect={(e) => {
                          e.preventDefault()
                          setDeleteId(project.id)
                        }}
                        className="text-red-600 focus:text-red-600 cursor-pointer"
                      >
                        <i className="ri-delete-bin-line mr-2"></i>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-12">
                <i className="ri-folder-add-line text-4xl text-gray-300 mb-4 block"></i>
                <p className="text-black-100/60 mb-4">No projects found</p>
                <Link
                  href="/admin/projects/new"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
                >
                  <i className="ri-add-line"></i>
                  Create Project
                </Link>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project
              and all associated images.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
