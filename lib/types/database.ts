export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  display_order: number
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  title: string
  slug: string
  short_description: string | null
  full_description: string | null
  cover_image_url: string | null
  category_id: string | null
  technologies: string[]
  services: string[]
  client: string | null
  year: string | null
  external_link: string | null
  pdf_url: string | null
  challenge: string | null
  solution: string | null
  process: string[]
  results: string | null
  testimonial_quote: string | null
  testimonial_author: string | null
  testimonial_role: string | null
  featured: boolean
  published: boolean
  display_order: number
  created_at: string
  updated_at: string
  // Joined data
  category?: Category
}

export interface ProjectImage {
  id: string
  project_id: string
  image_url: string
  alt_text: string | null
  display_order: number
  created_at: string
}

export interface SiteSetting {
  id: string
  key: string
  value: string | null
  updated_at: string
}

export interface ProjectWithImages extends Project {
  images: ProjectImage[]
}
