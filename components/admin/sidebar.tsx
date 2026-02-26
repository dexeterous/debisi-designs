'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin', icon: 'ri-dashboard-line', label: 'Dashboard' },
  { href: '/admin/projects', icon: 'ri-folder-line', label: 'Projects' },
  { href: '/admin/categories', icon: 'ri-grid-line', label: 'Categories' },
  { href: '/admin/settings', icon: 'ri-settings-3-line', label: 'Settings' },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-[#e5e5e5]">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-[#e5e5e5]">
          <Link href="/admin">
            <Image
              src="/images/design-mode/logo(2).png"
              alt="debisi designs"
              width={140}
              height={40}
              className="max-w-[140px]"
            />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/admin' && pathname.startsWith(item.href))
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-black-100 hover:bg-gray-100'
                    )}
                  >
                    <i className={`${item.icon} text-lg`}></i>
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-[#e5e5e5]">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-black-100 hover:bg-gray-100 transition-colors mb-2"
          >
            <i className="ri-external-link-line text-lg"></i>
            View Site
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full"
          >
            <i className="ri-logout-box-line text-lg"></i>
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  )
}
