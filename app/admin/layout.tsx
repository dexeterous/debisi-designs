import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin Dashboard | debisi designs",
  description: "Manage your portfolio projects and content",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {children}
    </div>
  )
}
