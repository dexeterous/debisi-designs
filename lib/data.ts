import { createClient } from '@/lib/supabase/server'
import type { Category, Project, ProjectImage, ProjectWithImages } from '@/lib/types/database'

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  return data || []
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Error fetching category:', error)
    return null
  }

  return data
}

export async function getProjectsByCategory(categorySlug: string): Promise<Project[]> {
  const supabase = await createClient()
  
  // First get the category
  const { data: category } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', categorySlug)
    .single()

  if (!category) return []

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('category_id', category.id)
    .eq('published', true)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching projects:', error)
    return []
  }

  return data || []
}

export async function getProjectBySlug(slug: string): Promise<ProjectWithImages | null> {
  const supabase = await createClient()
  
  const { data: project, error } = await supabase
    .from('projects')
    .select('*, category:categories(*)')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (error || !project) {
    console.error('Error fetching project:', error)
    return null
  }

  // Fetch images
  const { data: images } = await supabase
    .from('project_images')
    .select('*')
    .eq('project_id', project.id)
    .order('display_order', { ascending: true })

  return {
    ...project,
    images: images || [],
  }
}

export async function getFeaturedProjects(): Promise<Project[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('projects')
    .select('*, category:categories(name, slug)')
    .eq('featured', true)
    .eq('published', true)
    .order('display_order', { ascending: true })
    .limit(6)

  if (error) {
    console.error('Error fetching featured projects:', error)
    return []
  }

  return data || []
}

export async function getAllPublishedProjects(): Promise<Project[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('projects')
    .select('*, category:categories(name, slug)')
    .eq('published', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching all projects:', error)
    return []
  }

  return data || []
}

export async function getSiteSetting(key: string): Promise<string | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', key)
    .single()

  if (error || !data) {
    return null
  }

  return data.value
}

export async function getAllSiteSettings(): Promise<Record<string, string>> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')

  if (error || !data) {
    return {}
  }

  const settings: Record<string, string> = {}
  data.forEach(s => {
    if (s.value) settings[s.key] = s.value
  })

  return settings
}
