"use client"

import { useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface GalleryImage {
  id?: string
  image_url: string
  alt_text: string
  display_order: number
}

interface GalleryUploadProps {
  value: GalleryImage[]
  onChange: (images: GalleryImage[]) => void
  bucket?: string
  folder?: string
  className?: string
}

export function GalleryUpload({
  value = [],
  onChange,
  bucket = "project-images",
  folder = "gallery",
  className,
}: GalleryUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const supabase = createClient()

  const uploadFiles = async (files: FileList) => {
    setIsUploading(true)
    try {
      const newImages: GalleryImage[] = []
      const currentOrder = value.length

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (!file.type.startsWith("image/")) continue

        const fileExt = file.name.split(".").pop()
        const fileName = `${folder}/${Date.now()}-${i}-${Math.random().toString(36).substring(7)}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(fileName, file)

        if (uploadError) {
          console.error("Error uploading file:", uploadError)
          continue
        }

        const { data } = supabase.storage.from(bucket).getPublicUrl(fileName)
        newImages.push({
          image_url: data.publicUrl,
          alt_text: file.name.replace(/\.[^/.]+$/, ""),
          display_order: currentOrder + i,
        })
      }

      onChange([...value, ...newImages])
    } catch (error) {
      console.error("Error uploading files:", error)
      alert("Failed to upload images. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files)
    }
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files)
    }
  }

  const handleRemove = (index: number) => {
    const newImages = value.filter((_, i) => i !== index)
    onChange(newImages.map((img, i) => ({ ...img, display_order: i })))
  }

  const handleAltTextChange = (index: number, altText: string) => {
    const newImages = [...value]
    newImages[index] = { ...newImages[index], alt_text: altText }
    onChange(newImages)
  }

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= value.length) return
    const newImages = [...value]
    const [removed] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, removed)
    onChange(newImages.map((img, i) => ({ ...img, display_order: i })))
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
          dragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50",
          isUploading && "opacity-50 pointer-events-none"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center gap-2">
          <i className="ri-image-add-line text-3xl text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {isUploading ? "Uploading..." : "Drag and drop images, or"}
          </p>
          {!isUploading && (
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleChange}
                className="hidden"
              />
              <Button type="button" variant="outline" size="sm" asChild>
                <span>Browse Files</span>
              </Button>
            </label>
          )}
        </div>
      </div>

      {/* Gallery preview */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {value.map((image, index) => (
            <div
              key={index}
              className="relative group border border-border rounded-lg overflow-hidden"
            >
              <img
                src={image.image_url}
                alt={image.alt_text}
                className="w-full h-32 object-cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-2">
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-white hover:text-white hover:bg-white/20"
                    onClick={() => moveImage(index, index - 1)}
                    disabled={index === 0}
                  >
                    <i className="ri-arrow-left-s-line" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-white hover:text-white hover:bg-white/20"
                    onClick={() => moveImage(index, index + 1)}
                    disabled={index === value.length - 1}
                  >
                    <i className="ri-arrow-right-s-line" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-white hover:text-white hover:bg-red-500/80"
                    onClick={() => handleRemove(index)}
                  >
                    <i className="ri-delete-bin-line" />
                  </Button>
                </div>
                <input
                  type="text"
                  value={image.alt_text}
                  onChange={(e) => handleAltTextChange(index, e.target.value)}
                  placeholder="Alt text"
                  className="w-full text-xs px-2 py-1 rounded bg-white/20 text-white placeholder-white/50 border-0 focus:ring-1 focus:ring-white/50"
                />
              </div>
              <div className="absolute top-1 left-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
