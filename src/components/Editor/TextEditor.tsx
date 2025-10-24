'use client'

import React, { useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css'
import { supabase } from '@/lib/supabaseClient'

// Dynamic import biar aman di Next.js
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })

interface TextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

const TextEditor: React.FC<TextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Tulis konten di sini...',
  className = '',
}) => {
  const quillRef = useRef<any>(null)

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ align: [] }],
      ['link', 'image', 'video'],
      ['blockquote', 'code-block'],
      ['clean'],
    ],
  }

  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'color',
    'background',
    'list',
    'bullet',
    'align',
    'link',
    'image',
    'video',
    'blockquote',
    'code-block',
  ]

  // Custom image upload handler → upload ke Supabase Storage
  const imageHandler = async () => {
    const input = document.createElement('input')
    input.setAttribute('type', 'file')
    input.setAttribute('accept', 'image/*')
    input.click()

    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return

      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `article-images/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('news-images')
        .upload(filePath, file)

      if (uploadError) {
        console.error('❌ Upload failed:', uploadError)
        return
      }

      const { data: publicUrlData } = supabase.storage
        .from('news-images')
        .getPublicUrl(filePath)

      const quill = quillRef.current
      const range = quill?.getSelection()
      quill?.insertEmbed(range?.index || 0, 'image', publicUrlData.publicUrl)
    }
  }

  // Setup toolbar handler
  useEffect(() => {
    const interval = setInterval(() => {
      const editorEl = document.querySelector('.ql-editor')
      if (editorEl && (window as any).Quill) {
        const Quill = (window as any).Quill
        const quillInstance = Quill.find(editorEl)
        if (quillInstance) {
          quillRef.current = quillInstance
          quillInstance.getModule('toolbar').addHandler('image', imageHandler)
          clearInterval(interval)
        }
      }
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className={`bg-white rounded border border-stroke ${className}`}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        style={{ height: '300px', marginBottom: '42px' }}
      />
    </div>
  )
}

export default TextEditor
