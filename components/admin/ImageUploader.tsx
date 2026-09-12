'use client'

import { useState, useRef } from 'react'
import { Upload, X, Link as LinkIcon, Image as ImageIcon, Loader2 } from 'lucide-react'

const SUPABASE_URL = 'https://izvllvunpjryeowponti.supabase.co'
const SUPABASE_KEY = 'sb_publishable_acJOTZ5reUCVCpJ_vK36ZA_q2bEIhIo'
const BUCKET = 'renovactiva-images'

interface ImageUploaderProps {
  images: string[]
  onChange: (images: string[]) => void
  folder: string
  maxImages?: number
}

export default function ImageUploader({ images, onChange, folder, maxImages = 20 }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [mode, setMode] = useState<'upload' | 'url'>('upload')
  const [urlInput, setUrlInput] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    const newImages: string[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

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
    onChange(images.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      {/* Selector de modo */}
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

      {/* Input según modo */}
      {mode === 'upload' ? (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
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
                <p className="text-white/60 text-sm">Subiendo imágenes...</p>
              </>
            ) : images.length >= maxImages ? (
              <>
                <ImageIcon className="size-8 text-white/30" />
                <p className="text-white/40 text-sm">Límite alcanzado ({maxImages} imágenes)</p>
              </>
            ) : (
              <>
                <Upload className="size-8 text-[#d7bd77]" />
                <p className="text-white/80 text-sm font-medium">Haz clic o arrastra imágenes aquí</p>
                <p className="text-white/40 text-xs">Máximo {maxImages} imágenes · 50MB cada una</p>
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
            placeholder="https://images.unsplash.com/..."
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

      {/* Galería de imágenes */}
      {images.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-white/60 text-sm">📷 {images.length} imagen{images.length !== 1 ? 'es' : ''} de {maxImages}</p>
            {images.length >= maxImages && (
              <p className="text-yellow-400 text-xs">Límite alcanzado</p>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((img, i) => (
              <div key={i} className="relative group aspect-square">
                <div className="w-full h-full bg-white/5 rounded-lg overflow-hidden border border-white/10">
                  {img ? (
                    <img src={img} alt={`Imagen ${i+1}`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20">
                      <ImageIcon className="size-8" />
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-lg">
                  <a
                    href={img}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 bg-white/20 rounded hover:bg-white/30"
                  >
                    <ImageIcon className="size-4 text-white" />
                  </a>
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="p-1.5 bg-red-500/80 rounded hover:bg-red-600"
                  >
                    <X className="size-4 text-white" />
                  </button>
                </div>
                <span className="absolute top-1 left-1 bg-black/70 text-white/80 text-[10px] px-1.5 py-0.5 rounded">
                  #{i+1}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}