import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/sidebar'
import { AdminHeader } from '@/components/admin/header'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ProjectForm } from '@/components/admin/project-form'

export default async function EditProjectPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/admin/login')
  }

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!project) {
    notFound()
  }

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true })

  const { data: images } = await supabase
    .from('project_images')
    .select('*')
    .eq('project_id', params.id)
    .order('display_order', { ascending: true })

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8">
        <AdminHeader 
          title="Edit Project" 
          description={project.title}
          actions={
            <Link href="/admin/projects">
              <Button variant="outline">
                <i className="ri-arrow-left-line mr-2"></i>
                Back to Projects
              </Button>
            </Link>
          }
        />

        <ProjectForm 
          project={project} 
          categories={categories || []} 
          existingImages={images || []}
        />
      </main>
    </div>
  )
}
