'use client'

import React, { useEffect, useState } from 'react'
import { FaPlus, FaEdit, FaTrash, FaTimes } from 'react-icons/fa'
import DefaultLayout from '@/components/Layouts/DefaultLayout'

type UserItem = {
  id: string
  email?: string
  user_metadata?: { full_name?: string; role?: string }
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState({
    id: '',
    full_name: '',
    email: '',
    password: '',
    role: '',
  })
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Fetch users from our server API
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/users')
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || 'Gagal memuat users')
      }
      const data: UserItem[] = await res.json()
      setUsers(data || [])
    } catch (err: any) {
      console.error(err)
      alert('Gagal mengambil daftar pengguna: ' + (err.message || err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // open create modal
  const handleOpenCreate = () => {
    setForm({ id: '', full_name: '', email: '', password: '', role: '' })
    setEditMode(false)
    setShowModal(true)
  }

  // open edit modal
  const handleOpenEdit = (user: UserItem) => {
    setForm({
      id: user.id,
      full_name: user.user_metadata?.full_name || '',
      email: user.email || '',
      password: '',
      role: user.user_metadata?.role || '',
    })
    setEditMode(true)
    setShowModal(true)
  }

  // delete user
  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus user ini?')) return
    try {
      const res = await fetch(`/api/users?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || 'Gagal menghapus user')
      }
      alert('User berhasil dihapus')
      fetchUsers()
    } catch (err: any) {
      console.error(err)
      alert('Gagal menghapus user: ' + (err.message || err))
    }
  }

  // create / update user via API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const method = editMode ? 'PUT' : 'POST'
      const payload = { ...form }
      // password kosong on edit will be handled server-side (ignore)
      const res = await fetch('/api/users', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || 'Gagal menyimpan user')
      }
      alert(editMode ? 'User diperbarui' : 'User dibuat')
      setShowModal(false)
      // reset form password for safety
      setForm((f) => ({ ...f, password: '' }))
      fetchUsers()
    } catch (err: any) {
      console.error(err)
      alert('Gagal menyimpan user: ' + (err.message || err))
    }
  }

  // filter & pagination
  const filtered = users.filter((u) =>
    (u.user_metadata?.full_name || '').toLowerCase().includes(search.toLowerCase())
  )
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1
  const paginatedUsers = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // reset page when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [search])

  return (
    <DefaultLayout>
      <div className="col-span-12 rounded-sm border border-stroke bg-white py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex justify-between px-7.5 mb-6">
          <h4 className="text-xl font-semibold text-black dark:text-white">Daftar Pengguna</h4>
          <button onClick={handleOpenCreate} className="bg-primary text-white px-4 py-2 rounded flex items-center gap-2">
            <FaPlus size={14} /> Tambah User
          </button>
        </div>

        <div className="px-7.5 mb-6">
          <input
            type="text"
            placeholder="Cari berdasarkan nama..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border rounded w-full dark:bg-gray-800 dark:text-white dark:border-gray-600"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 dark:bg-meta-4">
                <th className="py-4 px-4 pl-10 text-left text-sm font-medium text-black dark:text-white">No</th>
                <th className="py-4 px-4 text-left text-sm font-medium text-black dark:text-white">Nama Lengkap</th>
                <th className="py-4 px-4 text-left text-sm font-medium text-black dark:text-white">Email</th>
                <th className="py-4 px-4 text-left text-sm font-medium text-black dark:text-white">Role</th>
                <th className="py-4 px-4 text-center text-sm font-medium text-black dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-6 text-gray-500">Memuat data...</td></tr>
              ) : paginatedUsers.length > 0 ? (
                paginatedUsers.map((user, i) => (
                  <tr key={user.id} className="border-b border-stroke dark:border-strokedark">
                    <td className="py-4 px-4 pl-10 text-sm text-black dark:text-white">{(currentPage - 1) * itemsPerPage + i + 1}</td>
                    <td className="py-4 px-4 text-sm text-black dark:text-white">{user.user_metadata?.full_name || '-'}</td>
                    <td className="py-4 px-4 text-sm text-black dark:text-white">{user.email || '-'}</td>
                    <td className="py-4 px-4 text-sm text-black dark:text-white">{user.user_metadata?.role || '-'}</td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex justify-center gap-3">
                        <button onClick={() => handleOpenEdit(user)}><FaEdit className="text-yellow-500 hover:text-yellow-700 cursor-pointer" /></button>
                        <button onClick={() => handleDelete(user.id)}><FaTrash className="text-red-500 hover:text-red-700 cursor-pointer" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="text-center py-6 text-gray-500">Tidak ada pengguna ditemukan.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-between items-center px-7.5 py-4">
            <div className="text-sm text-gray-500">Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filtered.length)} dari {filtered.length} data</div>
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} onClick={() => setCurrentPage(i + 1)} className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>{i + 1}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-boxdark p-6 rounded-lg w-full max-w-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-black dark:text-white">{editMode ? 'Edit User' : 'Tambah User'}</h3>
              <button onClick={() => setShowModal(false)}><FaTimes className="text-gray-500 hover:text-gray-700" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Lengkap</label>
                <input type="text" value={form.full_name} onChange={(e)=>setForm({...form, full_name: e.target.value})} className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:text-white dark:border-gray-600" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input type="email" value={form.email} onChange={(e)=>setForm({...form, email: e.target.value})} className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:text-white dark:border-gray-600" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password {editMode && '(kosongkan jika tidak ingin ubah)'}</label>
                <input type="password" value={form.password} onChange={(e)=>setForm({...form, password: e.target.value})} className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:text-white dark:border-gray-600" required={!editMode} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                <select value={form.role} onChange={(e)=>setForm({...form, role: e.target.value})} className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:text-white dark:border-gray-600">
                  <option value="">Pilih role (kosong = user)</option>
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                  <option value="editor">editor</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={()=>setShowModal(false)} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800">Batal</button>
                <button type="submit" className="px-4 py-2 rounded bg-primary text-white hover:bg-opacity-90">{editMode ? 'Simpan Perubahan' : 'Simpan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DefaultLayout>
  )
}
