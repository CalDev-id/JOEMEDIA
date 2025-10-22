'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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

export default function HomePage() {
  const router = useRouter()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [userFullName, setUserFullName] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single()

        setUserFullName(profile?.full_name ?? null)
      }
    }

    fetchUser()
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
        created_at,
        articles_author_id_fkey ( full_name )
      `)
      .eq('published', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching articles:', error)
    } else {
      // ✅ Normalisasi agar relasi aman (tidak null & tidak array)
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

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUserFullName(null)
    router.refresh()
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">News Articles</h1>

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
            onClick={() => router.push('/login')}
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Log in
          </button>
        )}
      </div>

      {/* Articles list */}
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
  )
}
