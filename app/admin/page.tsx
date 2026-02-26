import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/sidebar'
import { AdminHeader } from '@/components/admin/header'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/admin/login')
  }

  // Fetch stats
  const [projectsResult, categoriesResult, publishedResult] = await Promise.all([
    supabase.from('projects').select('id', { count: 'exact' }),
    supabase.from('categories').select('id', { count: 'exact' }),
    supabase.from('projects').select('id', { count: 'exact' }).eq('published', true),
  ])

  const totalProjects = projectsResult.count || 0
  const totalCategories = categoriesResult.count || 0
  const publishedProjects = publishedResult.count || 0

  // Fetch recent projects
  const { data: recentProjects } = await supabase
    .from('projects')
    .select('*, category:categories(name)')
    .order('created_at', { ascending: false })
    .limit(5)

  const stats = [
    { 
      label: 'Total Projects', 
      value: totalProjects, 
      icon: 'ri-folder-line',
      color: 'bg-blue-500',
      href: '/admin/projects'
    },
    { 
      label: 'Published', 
      value: publishedProjects, 
      icon: 'ri-eye-line',
      color: 'bg-green-500',
      href: '/admin/projects?status=published'
    },
    { 
      label: 'Drafts', 
      value: totalProjects - publishedProjects, 
      icon: 'ri-draft-line',
      color: 'bg-yellow-500',
      href: '/admin/projects?status=draft'
    },
    { 
      label: 'Categories', 
      value: totalCategories, 
      icon: 'ri-grid-line',
      color: 'bg-purple-500',
      href: '/admin/categories'
    },
  ]

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8">
        <AdminHeader 
          title="Dashboard" 
          description={`Welcome back! Here's an overview of your portfolio.`}
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-white rounded-xl p-6 border border-[#e5e5e5] hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <i className={`${stat.icon} text-xl text-white`}></i>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-black-100">{stat.value}</p>
                  <p className="text-sm text-black-100/60">{stat.label}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Projects */}
        <div className="bg-white rounded-xl border border-[#e5e5e5]">
          <div className="p-6 border-b border-[#e5e5e5] flex items-center justify-between">
            <h2 className="text-lg font-semibold text-black-100 font-bricolage">Recent Projects</h2>
            <Link 
              href="/admin/projects" 
              className="text-sm text-primary hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="divide-y divide-[#e5e5e5]">
            {recentProjects && recentProjects.length > 0 ? (
              recentProjects.map((project) => (
                <div key={project.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                      {project.cover_image_url ? (
                        <img 
                          src={project.cover_image_url} 
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <i className="ri-image-line text-gray-400"></i>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-black-100">{project.title}</p>
                      <p className="text-sm text-black-100/60">
                        {project.category?.name || 'Uncategorized'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      project.published 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {project.published ? 'Published' : 'Draft'}
                    </span>
                    <Link
                      href={`/admin/projects/${project.id}/edit`}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <i className="ri-edit-line text-black-100/60"></i>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <i className="ri-folder-add-line text-4xl text-gray-300 mb-4 block"></i>
                <p className="text-black-100/60 mb-4">No projects yet</p>
                <Link
                  href="/admin/projects/new"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
                >
                  <i className="ri-add-line"></i>
                  Create First Project
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
