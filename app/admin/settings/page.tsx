import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/sidebar'
import { AdminHeader } from '@/components/admin/header'
import { SettingsForm } from '@/components/admin/settings-form'

export default async function SettingsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/admin/login')
  }

  const { data: settings } = await supabase
    .from('site_settings')
    .select('*')

  // Convert to key-value object
  const settingsMap: Record<string, string> = {}
  settings?.forEach(s => {
    if (s.value) settingsMap[s.key] = s.value
  })

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8">
        <AdminHeader 
          title="Settings" 
          description="Manage site settings and configuration"
        />

        <SettingsForm settings={settingsMap} userEmail={user.email || ''} />
      </main>
    </div>
  )
}
