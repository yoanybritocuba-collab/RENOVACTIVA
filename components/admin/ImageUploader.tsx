'use client'

import { useState, useRef } from 'react'
import { Upload, X, Link as LinkIcon, Image as ImageIcon, Loader2, Video, Eye, ArrowUp, ArrowDown } from 'lucide-react'

const SUPABASE_URL = 'https://izvllvunpjryeowponti.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6dmxsdnVucGpyeWVvd3BvbnRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MDgwODAsImV4cCI6MjEwNDI4NDA4MH0.T39sL0ZfR8yyP6oMl6POpXWM6067hr7jIk5oaOBBQEM'
const BUCKET = 'renovactiva-images'

interface ImageUploaderProps {
  images: string[]
  onChange: (images: string[]) => void
  folder: string
  maxImages?: number
  allowVideos?: boolean
}

export default function ImageUploader({ 
  images = [], 
  onChange, 
  folder, 
  maxImages = 20,
  allowVideos = true 
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [mode, setMode] = useState<'upload' | 'url'>('upload')
  const [urlInput, setUrlInput] = useState('')
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function cleanName(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ñ/g, 'n')
      .replace(/[^a-z0-9./-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const isVideo = (url: string) => {
    const videoExts = ['.mp4', '.webm', '.mov', '.avi']
    return videoExts.some(ext => url.toLowerCase().includes(ext))
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    const newImages: string[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        const cleanFolder = cleanName(folder)
        const fileExt = file.name.split('.').pop() || 'jpg'
        const cleanBaseName = cleanName(file.name.replace(/\.[^/.]+$/, '')) || 'archivo'
        const fileName = `${cleanFolder}/${Date.now()}-${cleanBaseName}.${fileExt}`

        const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${fileName}`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': file.type,
            'x-upsert': 'true'
          },
          body: file
        })

        if (!res.ok) {
          const errText = await res.text()
          throw new Error(`Error al subir ${file.name}: ${errText}`)
        }

        const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${fileName}`
        newImages.push(publicUrl)
      }

      onChange([...images, ...newImages])
    } catch (err) {
      alert('Error al subir: ' + (err as Error).message)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function addUrl() {
    if (!urlInput.trim()) return
    onChange([...images, urlInput.trim()])
    setUrlInput('')
  }

  function removeImage(index: number) {
    if (!confirm('¿Eliminar este archivo?')) return
    onChange(images.filter((_, i) => i !== index))
  }

  function moveImage(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return
    const newImages = [...images]
    const [moved] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, moved)
    onChange(newImages)
  }

  function moveUp(index: number) {
    if (index === 0) return
    moveImage(index, index - 1)
  }

  function moveDown(index: number) {
    if (index === images.length - 1) return
    moveImage(index, index + 1)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === 'upload'
              ? 'bg-[#d7bd77] text-[#11110f]'
              : 'bg-white/5 text-white/60 hover:bg-white/10'
          }`}
        >
          <Upload className="size-4" /> Subir archivo
        </button>
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === 'url'
              ? 'bg-[#d7bd77] text-[#11110f]'
              : 'bg-white/5 text-white/60 hover:bg-white/10'
          }`}
        >
          <LinkIcon className="size-4" /> Pegar URL
        </button>
      </div>

      {mode === 'upload' ? (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept={allowVideos ? 'image/*,video/*' : 'image/*'}
            multiple
            onChange={handleFileUpload}
            className="hidden"
            id={`file-upload-${folder}`}
            disabled={images.length >= maxImages}
          />
          <label
            htmlFor={`file-upload-${folder}`}
            className={`flex flex-col items-center justify-center gap-2 w-full py-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
              uploading
                ? 'border-[#d7bd77] bg-[#d7bd77]/5'
                : images.length >= maxImages
                ? 'border-white/10 cursor-not-allowed opacity-50'
                : 'border-white/20 hover:border-[#d7bd77] hover:bg-white/5'
            }`}
          >
            {uploading ? (
              <>
                <Loader2 className="size-8 text-[#d7bd77] animate-spin" />
                <p className="text-white/60 text-sm">Subiendo archivos...</p>
              </>
            ) : images.length >= maxImages ? (
              <>
                <ImageIcon className="size-8 text-white/30" />
                <p className="text-white/40 text-sm">Límite alcanzado ({maxImages} archivos)</p>
              </>
            ) : (
              <>
                <Upload className="size-8 text-[#d7bd77]" />
                <p className="text-white/80 text-sm font-medium">
                  Haz clic o arrastra {allowVideos ? 'fotos y videos' : 'imágenes'} aquí
                </p>
                <p className="text-white/40 text-xs">
                  Máximo {maxImages} archivos · 50MB cada uno
                </p>
              </>
            )}
          </label>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addUrl())}
            placeholder="https://ejemplo.com/foto.jpg"
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:border-[#d7bd77] outline-none text-sm"
          />
          <button
            type="button"
            onClick={addUrl}
            disabled={images.length >= maxImages}
            className="bg-[#d7bd77] text-[#11110f] px-4 py-2.5 rounded-lg font-medium hover:bg-white transition-colors text-sm disabled:opacity-50"
          >
            Añadir
          </button>
        </div>
      )}

      {images.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-white/60 text-sm">
              {images.length} archivo{images.length !== 1 ? 's' : ''} de {maxImages}
            </p>
            <p className="text-white/30 text-xs">Arrastra para reordenar</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((url, i) => (
              <div
                key={i}
                draggable
                onDragStart={() => setDragIndex(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragIndex !== null) moveImage(dragIndex, i)
                  setDragIndex(null)
                }}
                className={`relative group aspect-square cursor-move ${
                  dragIndex === i ? 'opacity-50' : ''
                }`}
              >
                <div className="w-full h-full bg-white/5 rounded-lg overflow-hidden border border-white/10">
                  {isVideo(url) ? (
                    <video 
                      src={url} 
                      className="w-full h-full object-cover"
                      muted
                      onMouseOver={(e) => (e.target as HTMLVideoElement).play()}
                      onMouseOut={(e) => {
                        const v = e.target as HTMLVideoElement
                        v.pause()
                        v.currentTime = 0
                      }}
                    />
                  ) : url ? (
                    <img src={url} alt={`Archivo ${i+1}`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20">
                      <ImageIcon className="size-8" />
                    </div>
                  )}
                </div>

                <span className="absolute top-1 left-1 bg-black/70 text-white/80 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                  {isVideo(url) ? <Video className="size-3" /> : <ImageIcon className="size-3" />}
                  #{i + 1}
                </span>

                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 rounded-lg">
                  <div className="flex gap-2">
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 bg-white/20 rounded hover:bg-white/30"
                      title="Ver"
                    >
                      <Eye className="size-4 text-white" />
                    </a>
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="p-1.5 bg-red-500/80 rounded hover:bg-red-600"
                      title="Eliminar"
                    >
                      <X className="size-4 text-white" />
                    </button>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => moveUp(i)}
                      disabled={i === 0}
                      className="p-1.5 bg-white/10 rounded text-white hover:bg-white/20 disabled:opacity-30"
                      title="Mover arriba"
                    >
                      <ArrowUp className="size-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveDown(i)}
                      disabled={i === images.length - 1}
                      className="p-1.5 bg-white/10 rounded text-white hover:bg-white/20 disabled:opacity-30"
                      title="Mover abajo"
                    >
                      <ArrowDown className="size-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}