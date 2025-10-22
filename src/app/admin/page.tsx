'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DefaultLayout from '@/components/Layouts/DefaultLayout'
import { supabase } from '@/lib/supabaseClient'

interface Article {
  id: string
  title: string
  body: string
  image_path: string | null
  published: boolean
  created_at: string
  articles_author_id_fkey: {
    full_name: string | null
  } | null
}

const AdminPage = () => {
  const router = useRouter()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userFullName, setUserFullName] = useState<string>('')
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    imageFile: null as File | null,
    published: true,
  })
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', authUser.id)
        .single()

      if (!profile || profile.role !== 'admin') {
        router.push('/')
        return
      }

      setUserRole(profile.role)
      setUserFullName(profile.full_name ?? '')
      fetchArticles()
    }

    checkAdmin()
  }, [router])

  const fetchArticles = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('articles')
      .select(`
        id,
        title,
        body,
        image_path,
        published,
        created_at,
        articles_author_id_fkey(full_name)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching articles:', error)
    } else {
      const normalizedData: Article[] = (data || []).map((item: any) => ({
        ...item,
        articles_author_id_fkey:
          item.articles_author_id_fkey && !Array.isArray(item.articles_author_id_fkey)
            ? item.articles_author_id_fkey
            : item.articles_author_id_fkey?.[0] || { full_name: null },
      }))
      setArticles(normalizedData)
    }

    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)

    try {
      let imagePath: string | null = null

      if (formData.imageFile) {
        const fileExt = formData.imageFile.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        const filePath = `articles/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('news-images')
          .upload(filePath, formData.imageFile, {
            contentType: formData.imageFile.type,
            cacheControl: '3600',
            upsert: false,
          })

        if (uploadError) throw uploadError

        const { data: publicUrlData } = supabase.storage
          .from('news-images')
          .getPublicUrl(filePath)

        imagePath = publicUrlData.publicUrl
      }

      const { data: { user: authUser } } = await supabase.auth.getUser()

      // pastikan kolom foreign key benar (biasanya 'author_id')
      const { error: insertError } = await supabase.from('articles').insert([
        {
          title: formData.title,
          body: formData.body,
          image_path: imagePath,
          published: formData.published,
          author_id: authUser?.id, // foreign key ke profiles.id
        },
      ])

      if (insertError) throw insertError

      alert('✅ Article created successfully!')
      setFormData({ title: '', body: '', imageFile: null, published: true })
      fetchArticles()
    } catch (error: any) {
      console.error('❌ Error creating article:', error)
      alert('Failed to create article.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <DefaultLayout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <p className="mb-4 text-gray-600">
          Welcome, {userFullName} ({userRole})
        </p>

        {/* CREATE ARTICLE FORM */}
        <form
          onSubmit={handleSubmit}
          className="mb-10 border p-5 rounded-lg shadow-sm bg-gray-50 space-y-4"
        >
          <h2 className="text-xl font-semibold">Create New Article</h2>

          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full border rounded p-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Body</label>
            <textarea
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              className="w-full border rounded p-2 h-28"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setFormData({ ...formData, imageFile: e.target.files?.[0] || null })
              }
              className="w-full"
            />
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {uploading ? 'Uploading...' : 'Create Article'}
          </button>
        </form>

        {/* ARTICLE LIST */}
        {loading ? (
          <p className="text-gray-500">Loading articles...</p>
        ) : articles.length === 0 ? (
          <p className="text-gray-500">No articles yet.</p>
        ) : (
          <div className="space-y-6">
            {articles.map((article) => (
              <div key={article.id} className="border rounded-xl p-4 shadow-sm">
                {article.image_path && (
                  <img
                    src={article.image_path}
                    alt={article.title}
                    className="rounded-lg mb-3"
                  />
                )}
                <h2 className="text-2xl font-semibold">{article.title}</h2>
                <p className="text-gray-700 mt-2 line-clamp-3">{article.body}</p>
                <p className="text-sm text-gray-500 mt-3">
                  By {article.articles_author_id_fkey?.full_name || 'Unknown Author'} •{' '}
                  {new Date(article.created_at).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </DefaultLayout>
  )
}

export default AdminPage
