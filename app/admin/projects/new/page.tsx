import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/sidebar'
import { AdminHeader } from '@/components/admin/header'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ProjectForm } from '@/components/admin/project-form'

export default async function NewProjectPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/admin/login')
  }

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true })

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8">
        <AdminHeader 
          title="New Project" 
          description="Create a new portfolio project"
          actions={
            <Link href="/admin/projects">
              <Button variant="outline">
                <i className="ri-arrow-left-line mr-2"></i>
                Back to Projects
              </Button>
            </Link>
          }
        />

        <ProjectForm categories={categories || []} />
      </main>
    </div>
  )
}
