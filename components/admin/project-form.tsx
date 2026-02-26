'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Project, Category, ProjectImage } from '@/lib/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ProjectFormProps {
  project?: Project
  categories: Category[]
  existingImages?: ProjectImage[]
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function ProjectForm({ project, categories, existingImages = [] }: ProjectFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form state
  const [title, setTitle] = useState(project?.title || '')
  const [slug, setSlug] = useState(project?.slug || '')
  const [shortDescription, setShortDescription] = useState(project?.short_description || '')
  const [fullDescription, setFullDescription] = useState(project?.full_description || '')
  const [coverImageUrl, setCoverImageUrl] = useState(project?.cover_image_url || '')
  const [categoryId, setCategoryId] = useState(project?.category_id || '')
  const [services, setServices] = useState(project?.services?.join(', ') || '')
  const [technologies, setTechnologies] = useState(project?.technologies?.join(', ') || '')
  const [client, setClient] = useState(project?.client || '')
  const [year, setYear] = useState(project?.year || '')
  const [externalLink, setExternalLink] = useState(project?.external_link || '')
  const [pdfUrl, setPdfUrl] = useState(project?.pdf_url || '')
  const [challenge, setChallenge] = useState(project?.challenge || '')
  const [solution, setSolution] = useState(project?.solution || '')
  const [processSteps, setProcessSteps] = useState(project?.process?.join('\n') || '')
  const [results, setResults] = useState(project?.results || '')
  const [testimonialQuote, setTestimonialQuote] = useState(project?.testimonial_quote || '')
  const [testimonialAuthor, setTestimonialAuthor] = useState(project?.testimonial_author || '')
  const [testimonialRole, setTestimonialRole] = useState(project?.testimonial_role || '')
  const [featured, setFeatured] = useState(project?.featured || false)
  const [published, setPublished] = useState(project?.published || false)
  
  // Images state
  const [images, setImages] = useState<ProjectImage[]>(existingImages)
  const [newImageUrl, setNewImageUrl] = useState('')

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (!project) {
      setSlug(slugify(value))
    }
  }

  const addImage = () => {
    if (!newImageUrl.trim()) return
    
    setImages([...images, {
      id: `temp-${Date.now()}`,
      project_id: project?.id || '',
      image_url: newImageUrl.trim(),
      alt_text: title,
      display_order: images.length,
      created_at: new Date().toISOString(),
    }])
    setNewImageUrl('')
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const projectData = {
        title,
        slug,
        short_description: shortDescription || null,
        full_description: fullDescription || null,
        cover_image_url: coverImageUrl || null,
        category_id: categoryId || null,
        services: services ? services.split(',').map(s => s.trim()).filter(Boolean) : [],
        technologies: technologies ? technologies.split(',').map(t => t.trim()).filter(Boolean) : [],
        client: client || null,
        year: year || null,
        external_link: externalLink || null,
        pdf_url: pdfUrl || null,
        challenge: challenge || null,
        solution: solution || null,
        process: processSteps ? processSteps.split('\n').map(s => s.trim()).filter(Boolean) : [],
        results: results || null,
        testimonial_quote: testimonialQuote || null,
        testimonial_author: testimonialAuthor || null,
        testimonial_role: testimonialRole || null,
        featured,
        published,
      }

      let projectId = project?.id

      if (project) {
        // Update existing project
        const { error: updateError } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', project.id)

        if (updateError) throw updateError
      } else {
        // Create new project
        const { data: newProject, error: createError } = await supabase
          .from('projects')
          .insert(projectData)
          .select()
          .single()

        if (createError) throw createError
        projectId = newProject.id
      }

      // Handle images
      if (projectId) {
        // Delete removed images
        const existingIds = existingImages.map(img => img.id)
        const currentIds = images.filter(img => !img.id.startsWith('temp-')).map(img => img.id)
        const toDelete = existingIds.filter(id => !currentIds.includes(id))

        if (toDelete.length > 0) {
          await supabase
            .from('project_images')
            .delete()
            .in('id', toDelete)
        }

        // Add new images
        const newImages = images
          .filter(img => img.id.startsWith('temp-'))
          .map((img, index) => ({
            project_id: projectId,
            image_url: img.image_url,
            alt_text: img.alt_text || title,
            display_order: index,
          }))

        if (newImages.length > 0) {
          await supabase
            .from('project_images')
            .insert(newImages)
        }
      }

      router.push('/admin/projects')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bricolage">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
                placeholder="Project title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                placeholder="project-url-slug"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shortDescription">Short Description</Label>
            <Textarea
              id="shortDescription"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Brief description for cards and previews"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullDescription">Full Description</Label>
            <Textarea
              id="fullDescription"
              value={fullDescription}
              onChange={(e) => setFullDescription(e.target.value)}
              placeholder="Detailed project description"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2024"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="client">Client</Label>
            <Input
              id="client"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              placeholder="Client name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="services">Services (comma separated)</Label>
              <Input
                id="services"
                value={services}
                onChange={(e) => setServices(e.target.value)}
                placeholder="Branding, Logo Design, Print"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="technologies">Tools/Technologies (comma separated)</Label>
              <Input
                id="technologies"
                value={technologies}
                onChange={(e) => setTechnologies(e.target.value)}
                placeholder="Figma, Photoshop, Illustrator"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bricolage">Images</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="coverImage">Cover Image URL</Label>
            <Input
              id="coverImage"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="/images/project-cover.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label>Gallery Images</Label>
            <div className="flex gap-2">
              <Input
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Enter image URL"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addImage()
                  }
                }}
              />
              <Button type="button" onClick={addImage} variant="outline">
                <i className="ri-add-line mr-2"></i>
                Add
              </Button>
            </div>
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-4 gap-4">
              {images.map((img, index) => (
                <div key={img.id} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={img.image_url}
                      alt={img.alt_text || ''}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <i className="ri-close-line text-sm"></i>
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Case Study */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bricolage">Case Study Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="challenge">Challenge</Label>
            <Textarea
              id="challenge"
              value={challenge}
              onChange={(e) => setChallenge(e.target.value)}
              placeholder="Describe the challenge or problem"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="solution">Solution</Label>
            <Textarea
              id="solution"
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
              placeholder="Describe the solution provided"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="process">Process Steps (one per line)</Label>
            <Textarea
              id="process"
              value={processSteps}
              onChange={(e) => setProcessSteps(e.target.value)}
              placeholder="Step 1 - Research and Discovery&#10;Step 2 - Concept Development&#10;Step 3 - Final Delivery"
              rows={5}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="results">Results</Label>
            <Textarea
              id="results"
              value={results}
              onChange={(e) => setResults(e.target.value)}
              placeholder="Describe the outcomes and results"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Testimonial */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bricolage">Testimonial</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="testimonialQuote">Quote</Label>
            <Textarea
              id="testimonialQuote"
              value={testimonialQuote}
              onChange={(e) => setTestimonialQuote(e.target.value)}
              placeholder="Client testimonial quote"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="testimonialAuthor">Author Name</Label>
              <Input
                id="testimonialAuthor"
                value={testimonialAuthor}
                onChange={(e) => setTestimonialAuthor(e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="testimonialRole">Author Role</Label>
              <Input
                id="testimonialRole"
                value={testimonialRole}
                onChange={(e) => setTestimonialRole(e.target.value)}
                placeholder="CEO, Company Name"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bricolage">Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="externalLink">External/Live URL</Label>
              <Input
                id="externalLink"
                value={externalLink}
                onChange={(e) => setExternalLink(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pdfUrl">PDF URL</Label>
              <Input
                id="pdfUrl"
                value={pdfUrl}
                onChange={(e) => setPdfUrl(e.target.value)}
                placeholder="/documents/project.pdf"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Publishing */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bricolage">Publishing Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="featured">Featured Project</Label>
              <p className="text-sm text-black-100/60">Show this project prominently on the homepage</p>
            </div>
            <Switch
              id="featured"
              checked={featured}
              onCheckedChange={setFeatured}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="published">Published</Label>
              <p className="text-sm text-black-100/60">Make this project visible to the public</p>
            </div>
            <Switch
              id="published"
              checked={published}
              onCheckedChange={setPublished}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <Button 
          type="submit" 
          className="bg-primary hover:bg-primary/90 text-white"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
        </Button>
        <Button 
          type="button" 
          variant="outline"
          onClick={() => router.push('/admin/projects')}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
