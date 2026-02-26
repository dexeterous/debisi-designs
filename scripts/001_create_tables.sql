-- Portfolio CMS Database Schema
-- Creates tables for projects, categories, project images, and site settings

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_description TEXT,
  full_description TEXT,
  cover_image_url TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  technologies TEXT[] DEFAULT '{}',
  services TEXT[] DEFAULT '{}',
  client TEXT,
  year TEXT,
  external_link TEXT,
  pdf_url TEXT,
  challenge TEXT,
  solution TEXT,
  process TEXT[] DEFAULT '{}',
  results TEXT,
  testimonial_quote TEXT,
  testimonial_author TEXT,
  testimonial_role TEXT,
  featured BOOLEAN DEFAULT FALSE,
  published BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Images Table (for galleries)
CREATE TABLE IF NOT EXISTS public.project_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Site Settings Table (for editable content like About page)
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects(category_id);
CREATE INDEX IF NOT EXISTS idx_projects_published ON public.projects(published);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON public.projects(featured);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects(slug);
CREATE INDEX IF NOT EXISTS idx_project_images_project ON public.project_images(project_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Categories (public read, authenticated write)
CREATE POLICY "categories_public_read" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "categories_authenticated_insert" ON public.categories
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "categories_authenticated_update" ON public.categories
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "categories_authenticated_delete" ON public.categories
  FOR DELETE TO authenticated USING (true);

-- RLS Policies for Projects (public read published only, authenticated full access)
CREATE POLICY "projects_public_read" ON public.projects
  FOR SELECT USING (published = true OR auth.role() = 'authenticated');

CREATE POLICY "projects_authenticated_insert" ON public.projects
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "projects_authenticated_update" ON public.projects
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "projects_authenticated_delete" ON public.projects
  FOR DELETE TO authenticated USING (true);

-- RLS Policies for Project Images (public read, authenticated write)
CREATE POLICY "project_images_public_read" ON public.project_images
  FOR SELECT USING (true);

CREATE POLICY "project_images_authenticated_insert" ON public.project_images
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "project_images_authenticated_update" ON public.project_images
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "project_images_authenticated_delete" ON public.project_images
  FOR DELETE TO authenticated USING (true);

-- RLS Policies for Site Settings (public read, authenticated write)
CREATE POLICY "site_settings_public_read" ON public.site_settings
  FOR SELECT USING (true);

CREATE POLICY "site_settings_authenticated_insert" ON public.site_settings
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "site_settings_authenticated_update" ON public.site_settings
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "site_settings_authenticated_delete" ON public.site_settings
  FOR DELETE TO authenticated USING (true);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
