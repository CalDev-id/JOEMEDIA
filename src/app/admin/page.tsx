'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FaEdit, FaTrash, FaPlus, FaTimes, FaEye } from 'react-icons/fa'
import DefaultLayout from '@/components/Layouts/DefaultLayout'
import { supabase } from '@/lib/supabaseClient'
import TextEditor from '@/components/Editor/TextEditor'

export default function AdminArticles() {
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState<any>(null)
  const [userChecked, setUserChecked] = useState(false) // ✅ tambahkan state ini
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  const itemsPerPage = 10

  const [form, setForm] = useState({
    title: '',
    body: '',
    image_path: '',
    published: true,
  })

  // ✅ Proteksi halaman (cek user login + role admin, tanpa flicker)
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.replace('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'admin') {
        router.replace('/')
        return
      }

      setUser(user)
      setUserChecked(true) // ✅ hanya render setelah lolos verifikasi
      fetchArticles()
    }

    checkUser()
  }, [search])

  const fetchArticles = async () => {
    setLoading(true)
    let query = supabase
      .from('articles')
      .select('*, profiles(full_name)')
      .order('created_at', { ascending: false })

    if (search) query = query.ilike('title', `%${search}%`)

    const { data, error } = await query
    if (!error && data) setArticles(data)
    setLoading(false)
  }

  const handleOpenCreate = () => {
    setForm({ title: '', body: '', image_path: '', published: true })
    setEditMode(false)
    setShowModal(true)
  }

  const handleOpenEdit = (article: any) => {
    setForm({
      title: article.title,
      body: article.body,
      image_path: article.image_path,
      published: true,
    })
    setSelectedArticle(article)
    setEditMode(true)
    setShowModal(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const { data, error } = await supabase.storage
      .from('article-images')
      .upload(`covers/${Date.now()}_${file.name}`, file)

    if (!error && data) {
      const { data: publicUrl } = supabase.storage
        .from('article-images')
        .getPublicUrl(data.path)
      setForm((prev) => ({ ...prev, image_path: publicUrl.publicUrl }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editMode && selectedArticle) {
      await supabase.from('articles').update(form).eq('id', selectedArticle.id)
    } else {
      await supabase.from('articles').insert([form])
    }
    setShowModal(false)
    fetchArticles()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus artikel ini?')) return
    await supabase.from('articles').delete().eq('id', id)
    fetchArticles()
  }

  const totalPages = Math.ceil(articles.length / itemsPerPage)
  const paginatedArticles = articles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // 🚫 Jangan render apapun sampai verifikasi user selesai
  if (!userChecked) return null

  return (
    <DefaultLayout>
      <div className="col-span-12 rounded-sm border border-stroke bg-white py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        {/* Header */}
        <div className="flex justify-between px-7.5 mb-6">
          <h4 className="text-xl font-semibold text-black dark:text-white">Artikel</h4>
          <button
            onClick={handleOpenCreate}
            className="bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90 flex items-center gap-2"
          >
            <FaPlus size={14} />
            Tambah Artikel
          </button>
        </div>

        {/* Search */}
        <div className="px-7.5 mb-6">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              fetchArticles()
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              placeholder="Cari berdasarkan judul..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 border rounded flex-1 dark:bg-gray-800 dark:text-white dark:border-gray-600"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Cari
            </button>
          </form>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 dark:bg-meta-4">
                <th className="py-4 px-4 text-left text-sm font-medium text-black dark:text-white pl-10">
                  No
                </th>
                <th className="py-4 px-4 text-left text-sm font-medium text-black dark:text-white">
                  Judul
                </th>
                <th className="py-4 px-4 text-left text-sm font-medium text-black dark:text-white">
                  Penulis
                </th>
                <th className="py-4 px-4 text-left text-sm font-medium text-black dark:text-white">
                  Tanggal
                </th>
                <th className="py-4 px-4 text-center text-sm font-medium text-black dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-500">
                    Memuat data...
                  </td>
                </tr>
              ) : paginatedArticles.length > 0 ? (
                paginatedArticles.map((article, index) => (
                  <tr key={article.id} className="border-b border-stroke dark:border-strokedark">
                    <td className="py-4 px-4 pl-10 text-sm text-black dark:text-white">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="py-4 px-4 text-sm text-black dark:text-white">
                      {article.title}
                    </td>
                    <td className="py-4 px-4 text-sm text-black dark:text-white">
                      {article.profiles?.full_name || '-'}
                    </td>
                    <td className="py-4 px-4 text-sm text-black dark:text-white">
                      {formatDate(article.created_at)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex justify-center gap-3">
                        <button onClick={() => router.push(`/news/${article.id}`)}>
                          <FaEye className="text-blue-500 hover:text-blue-700 cursor-pointer" />
                        </button>
                        <button onClick={() => handleOpenEdit(article)}>
                          <FaEdit className="text-yellow-500 hover:text-yellow-700 cursor-pointer" />
                        </button>
                        <button onClick={() => handleDelete(article.id)}>
                          <FaTrash className="text-red-500 hover:text-red-700 cursor-pointer" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-500">
                    Tidak ada artikel ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center px-7.5 py-4">
            <div className="text-sm text-gray-500">
              Menampilkan {(currentPage - 1) * itemsPerPage + 1} -{' '}
              {Math.min(currentPage * itemsPerPage, articles.length)} dari {articles.length} data
            </div>
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded ${
                    currentPage === i + 1
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-boxdark p-6 rounded-lg w-full max-w-2xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-black dark:text-white">
                {editMode ? 'Edit Artikel' : 'Tambah Artikel'}
              </h3>
              <button onClick={() => setShowModal(false)}>
                <FaTimes className="text-gray-500 hover:text-gray-700" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Judul
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                  required
                />
              </div>

              {/* Body */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Konten
                </label>
                <TextEditor
                  value={form.body}
                  onChange={(value: string) => setForm({ ...form, body: value })}
                />
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 mt-10">
                  Cover Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full text-sm text-gray-700 dark:text-gray-300"
                />
                {form.image_path && (
                  <img
                    src={form.image_path}
                    alt="cover"
                    className="mt-2 h-32 w-auto rounded border"
                  />
                )}
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-primary text-white hover:bg-opacity-90"
                >
                  {editMode ? 'Simpan Perubahan' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DefaultLayout>
  )
}
