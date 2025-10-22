'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

interface Profile {
  id: string
  full_name: string
  email: string
  role: string
  avatar_url: string | null
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newFullName, setNewFullName] = useState('')
  const [newAvatar, setNewAvatar] = useState<File | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role, avatar_url')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('❌ Error fetching profile:', error)
      } else {
        setProfile({
          id: user.id,
          email: user.email ?? '',
          full_name: data?.full_name ?? '',
          role: data?.role ?? '',
          avatar_url: data?.avatar_url ?? null,
        })
        setNewFullName(data?.full_name ?? '')
      }

      setLoading(false)
    }

    fetchProfile()
  }, [router])

  const handleSave = async () => {
    if (!profile) return

    // Upload avatar (optional)
    let avatarUrl = profile.avatar_url
    if (newAvatar) {
      const fileExt = newAvatar.name.split('.').pop()
      const fileName = `${profile.id}.${fileExt}`
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, newAvatar, { upsert: true })

      if (uploadError) {
        console.error('❌ Upload error:', uploadError)
      } else {
        const { data: publicUrlData } = supabase
          .storage
          .from('avatars')
          .getPublicUrl(data?.path ?? '')

        avatarUrl = publicUrlData?.publicUrl ?? null
      }
    }

    // Update profile
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: newFullName,
        avatar_url: avatarUrl,
      })
      .eq('id', profile.id)

    if (error) {
      alert('❌ Gagal update profil!')
      console.error(error)
    } else {
      alert('✅ Profil berhasil diperbarui!')
      setProfile({ ...profile, full_name: newFullName, avatar_url: avatarUrl })
      setIsModalOpen(false)
    }
  }

  if (loading) return <p className="text-gray-500 p-6">Loading profile...</p>

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      {profile ? (
        <div className="bg-white shadow rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-4">
            <img
              src={profile.avatar_url || '/default-avatar.png'}
              alt="Avatar"
              className="w-20 h-20 rounded-full border object-cover"
            />
            <div>
              <h2 className="text-xl font-semibold">{profile.full_name}</h2>
              <p className="text-gray-600">{profile.email}</p>
              <p className="text-sm text-gray-500 capitalize">Role: {profile.role}</p>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Edit Profile
          </button>
        </div>
      ) : (
        <p className="text-gray-500">No profile data found.</p>
      )}

      {/* Modal Edit Profile */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 relative shadow-xl">
            <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>

            <label className="block mb-3">
              <span className="text-gray-700 text-sm font-medium">Full Name</span>
              <input
                type="text"
                value={newFullName}
                onChange={(e) => setNewFullName(e.target.value)}
                className="mt-1 w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <label className="block mb-3">
              <span className="text-gray-700 text-sm font-medium">Avatar</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setNewAvatar(e.target.files?.[0] ?? null)}
                className="mt-1 w-full"
              />
            </label>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
