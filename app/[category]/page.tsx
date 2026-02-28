import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { getProjectsByCategory } from "@/lib/projects-data"

const categoryNames: Record<string, string> = {
  branding: "Branding",
  "print-design": "Print Design",
  "social-media": "Social Media",
  presentations: "Presentations",
  "videos-motion": "Videos & Motion",
  photography: "Photography",
  "web-design": "Web Design",
  elearning: "eLearning Course Designs",
}

export default function CategoryPage({ params }: { params: { category: string } }) {
  const projects = getProjectsByCategory(params.category)
  const categoryName = categoryNames[params.category]

  if (!categoryName) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with logo */}
      <header className="py-8 border-b border-[#e5e5e5]">
        <div className="container">
          <div className="flex justify-between items-center">
            <Link href="/">
              <Image
                src="/images/design-mode/logo(2).png"
                alt="debisi designs"
                width={160}
                height={48}
                className="max-w-[160px]"
              />
            </Link>
            <Link href="/" className="text-black-100 hover:text-primary transition-colors flex items-center gap-2">
              <i className="ri-arrow-left-line"></i>
              <span>Back to Categories</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Category Header */}
      <section className="py-12 lg:py-20">
        <div className="container">
          <h1 className="text-4xl lg:text-6xl font-semibold text-black-100 mb-4">{categoryName}</h1>
          <p className="text-xl text-black-100">
            {projects.length} {projects.length === 1 ? "project" : "projects"}
          </p>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="pb-20">
        <div className="container">
          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="relative w-40 h-40 mb-8">
                <div className="absolute inset-0 rounded-full bg-primary/5 animate-pulse" />
                <div className="absolute inset-3 rounded-full bg-primary/10" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg
                    width="64"
                    height="64"
                    viewBox="0 0 64 64"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-primary"
                  >
                    <path
                      d="M32 8C18.745 8 8 18.745 8 32s10.745 24 24 24 24-10.745 24-24S45.255 8 32 8z"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d="M32 18v14l8 8"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="32" cy="32" r="3" fill="currentColor" />
                    <path
                      d="M20 6l2 4M44 6l-2 4M32 2v4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
              <h2 className="text-3xl font-semibold text-black-100 mb-3 font-bricolage">Coming Soon</h2>
              <p className="text-lg text-black-100/60 max-w-md leading-relaxed">
                Exciting projects are in the works. Check back soon for new additions to this category.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors font-medium"
              >
                <i className="ri-arrow-left-line"></i>
                <span>Browse other categories</span>
              </Link>
            </div>
          ) : (
            <div className="grid-layout-3 gap-8">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/${params.category}/${project.id}`}
                  className="group block bg-white rounded-2xl overflow-hidden border border-[#e5e5e5] hover:border-primary transition-all duration-300 hover:shadow-lg w-full"
                >
                  <div className="relative aspect-[4/3] overflow-hidden w-full">
                    <Image
                      src={project.thumbnail || "/placeholder.svg"}
                      alt={project.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-black-100 mb-2 group-hover:text-primary transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-base text-black-100 leading-relaxed line-clamp-2">{project.description}</p>
                    {project.year && <p className="text-sm text-black-100 mt-3 opacity-60">{project.year}</p>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
