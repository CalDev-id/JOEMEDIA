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

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        router.push('/login') // redirect kalau belum login
        return
      }

      // ambil role dari profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', authUser.id)
        .single()

      if (!profile || profile.role !== 'admin') {
        router.push('/') // redirect kalau bukan admin
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
        articles_author_id_fkey (
          full_name
        )
      `)
      .order('created_at', { ascending: false })

    if (error) console.error('❌ Error fetching articles:', error)
    else setArticles(data || [])

    setLoading(false)
  }

  return (
    <DefaultLayout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <p className="mb-4 text-gray-600">Welcome, {userFullName} ({userRole})</p>

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
