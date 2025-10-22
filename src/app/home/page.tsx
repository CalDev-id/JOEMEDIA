'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'


interface Article {
  id: string
  title: string
  body: string
  image_path: string | null
  published: boolean
  published_at: string | null
  created_at: string
  articles_author_id_fkey: {
    full_name: string | null
  } | null
}

export default function ArticlesPage() {
  const router = useRouter()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    imageFile: null as File | null,
    published: true,
  })
  const [uploading, setUploading] = useState(false)
  const [userFullName, setUserFullName] = useState<string>('')

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      console.log('Auth UID:', authUser?.id)

      if (authUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', authUser.id)
          .single()

        console.log('Profile data:', profile)
        setUserFullName(profile?.full_name ?? '')
      }
    }

    fetchUserProfile()
    fetchArticles()
  }, [])

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
        published_at,
        created_at,
        articles_author_id_fkey (
          full_name
        )
      `)
      .eq('published', true)
      .order('created_at', { ascending: false })


    if (error) console.error('❌ Error fetching articles:', error)
    else setArticles(data || [])

    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUserFullName('')
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

        console.log('Uploading file:', formData.imageFile)
        console.log('To path:', filePath)

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
        console.log('Public URL:', imagePath)
      }

      // Ambil auth user lagi untuk memastikan author_id valid
      const { data: { user: authUser } } = await supabase.auth.getUser()
      console.log('Inserting article with author_id:', authUser?.id)

      const { error: insertError } = await supabase.from('articles').insert([
        {
          title: formData.title,
          body: formData.body,
          image_path: imagePath,
          published: formData.published,
          published_at: formData.published ? new Date().toISOString() : null,
          author_id: authUser?.id,
        },
      ])

      if (insertError) throw insertError

      alert('✅ Article created successfully!')
      setFormData({ title: '', body: '', imageFile: null, published: false })
      fetchArticles()
    } catch (error: any) {
      console.error('❌ Error creating article:', error)
      alert('Failed to create article.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Articles</h1>
{userFullName ? (
  <div className="flex items-center gap-4">
    <span className="font-medium">{userFullName}</span>
    <button
      onClick={handleLogout}
      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
    >
      Logout
    </button>
  </div>
) : (
  <button
    onClick={() => router.push('/login')} // redirect ke halaman login
    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
  >
    Log in
  </button>
)}

      </div>

      <form
        onSubmit={handleSubmit}
        className="mb-10 border p-4 rounded-lg shadow-sm space-y-4 bg-gray-50"
      >
        <h2 className="text-xl font-semibold mb-2">Create New Article</h2>

        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full border rounded p-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Body</label>
          <textarea
            value={formData.body}
            onChange={(e) =>
              setFormData({ ...formData, body: e.target.value })
            }
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

        <div className="items-center gap-2 hidden">
          <input
  type="checkbox"
  checked={formData.published}
  hidden
  readOnly
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
                By {article.articles_author_id_fkey?.full_name || 'Unknown Author'}{' '}
                •{' '}
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
  )
}
