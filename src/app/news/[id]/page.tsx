'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Loader from '@/components/common/Loader'

interface Article {
  id: string
  title: string
  body: string
  image_path: string
  published: boolean
  created_at: string
  articles_author_id_fkey: { full_name: string | null }[]
}

export default function NewsDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { id } = params
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchArticle(id as string)
    }
  }, [id])

  const fetchArticle = async (articleId: string) => {
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
      .eq('id', articleId)
      .single()

    if (error) {
      console.error('❌ Error fetching article:', error)
    } else {
      setArticle(data)
    }

    setLoading(false)
  }

  if (loading) {
    return (
      <Loader />
    )
  }

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-gray-500">
        Article not found.
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <button
        onClick={() => router.push('/')}
        className="text-blue-600 hover:underline mb-4"
      >
        ← Back to News
      </button>

      {article.image_path && (
        <img
          src={article.image_path}
          alt={article.title}
          className="w-full h-80 object-cover rounded-2xl shadow-md mb-6"
        />
      )}

      <h1 className="text-4xl font-bold mb-4">{article.title}</h1>

      <p className="text-sm text-gray-500 mb-6">
        By {article.articles_author_id_fkey?.[0]?.full_name || 'Unknown Author'} •{' '}
        {new Date(article.created_at).toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })}
      </p>

      <div className="prose max-w-none text-gray-800 leading-relaxed">
        {article.body.split('\n').map((paragraph, index) => (
          <p key={index} className="mb-4">
                                <div
  className=""
  dangerouslySetInnerHTML={{ __html: paragraph }}
/>
          </p>
        ))}
      </div>
    </div>
  )
}
