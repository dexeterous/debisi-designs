import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/sidebar'
import { AdminHeader } from '@/components/admin/header'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ProjectsTable } from '@/components/admin/projects-table'

export default async function ProjectsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/admin/login')
  }

  const { data: projects } = await supabase
    .from('projects')
    .select('*, category:categories(name, slug)')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true })

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8">
        <AdminHeader 
          title="Projects" 
          description="Manage your portfolio projects"
          actions={
            <Link href="/admin/projects/new">
              <Button className="bg-primary hover:bg-primary/90 text-white">
                <i className="ri-add-line mr-2"></i>
                New Project
              </Button>
            </Link>
          }
        />

        <ProjectsTable projects={projects || []} categories={categories || []} />
      </main>
    </div>
  )
}
