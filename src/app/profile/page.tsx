'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import DefaultLayout from '@/components/Layouts/DefaultLayout'
import Loader from '@/components/common/Loader'
import Navbar from '@/components/Navbar/page'

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
      const {
        data: { user },
      } = await supabase.auth.getUser()

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
    if (!profile) {
      console.warn('⚠️ Profile belum siap')
      return
    }

    console.log('🧩 Memulai update profil...')
    console.log('Nama baru:', newFullName)
    console.log('Avatar file:', newAvatar)

    let avatarUrl = profile.avatar_url

    try {
      if (newAvatar) {
        const fileExt = newAvatar.name.split('.').pop()
        const fileName = `${profile.id}-${Date.now()}.${fileExt}`
        const filePath = `avatars/${fileName}`

        console.log('📤 Akan upload ke bucket: news-images →', filePath)

        const { error: uploadError } = await supabase.storage
          .from('news-images')
          .upload(filePath, newAvatar, {
            cacheControl: '3600',
            upsert: true,
            contentType: newAvatar.type,
          })

        if (uploadError) {
          console.error('❌ Upload error:', uploadError.message)
          alert('Gagal mengunggah foto profil!')
          return
        }

        const { data: publicUrlData } = supabase.storage
          .from('news-images')
          .getPublicUrl(filePath)

        avatarUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`
      } else {
        console.log('⚠️ Tidak ada avatar baru, hanya update nama.')
      }

      console.log('🟢 Update profil di database...')
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: newFullName,
          avatar_url: avatarUrl,
        })
        .eq('id', profile.id)

      if (updateError) {
        console.error('❌ DB update error:', updateError.message)
        alert('Gagal memperbarui profil di database!')
        return
      }

      alert('✅ Profil berhasil diperbarui!')
      setProfile({ ...profile, full_name: newFullName, avatar_url: avatarUrl })
      setIsModalOpen(false)
    } catch (err) {
      console.error('❌ Error umum saat update profil:', err)
      alert('Terjadi kesalahan saat memperbarui profil.')
    }
  }

  // ✅ upload otomatis saat file dipilih
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    console.log('📸 File dipilih:', file)
    if (!file) return
    setNewAvatar(file)

    if (!profile) {
      alert('Profil belum siap.')
      return
    }

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      console.log('📤 Upload ke bucket: news-images →', filePath)

      const { error: uploadError } = await supabase.storage
        .from('news-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type,
        })

      if (uploadError) {
        console.error('❌ Upload error:', uploadError)
        alert('Gagal mengunggah foto profil!')
        return
      }

      const { data: publicUrlData } = supabase.storage
        .from('news-images')
        .getPublicUrl(filePath)

      const avatarUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`
      console.log('✅ URL publik:', avatarUrl)

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', profile.id)

      if (updateError) {
        console.error('❌ DB update error:', updateError)
        alert('Gagal memperbarui profil di database!')
        return
      }

      setProfile({ ...profile, avatar_url: avatarUrl })
      alert('✅ Foto profil berhasil diperbarui!')
    } catch (err) {
      console.error('❌ Error umum:', err)
      alert('Terjadi kesalahan saat upload foto.')
    }
  }

  if (loading)
    return <Loader />

  const ProfileContent = (
    <div className="h-screen">
      {profile?.role != 'admin' ? (<Navbar active="profile" />) : null}
      
      <div className='max-w-242.5 mx-auto flex justify-center items-center pt-20'>
        <div className="overflow-hidden rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        {/* Cover Section */}
        <div className="relative z-20 h-35 md:h-65">
          <Image
            src="/images/cover/cover-01.png"
            alt="profile cover"
            className="h-full w-full rounded-tl-sm rounded-tr-sm object-cover object-center"
            width={970}
            height={260}
          />
        </div>

        {/* Profile Info */}
        <div className="px-4 pb-6 text-center lg:pb-8 xl:pb-11.5">
          <div className="relative z-30 mx-auto -mt-22 h-30 w-full max-w-30 rounded-full bg-white/20 p-1 backdrop-blur sm:h-44 sm:max-w-44 sm:p-3">
            <div className="relative drop-shadow-2">
              <Image
                key={profile?.avatar_url}
                src={profile?.avatar_url || '/images/logo/user.png'}
                width={160}
                height={160}
                className="rounded-full object-cover"
                alt="profile"
              />
              <label
                htmlFor="profile"
                className="absolute bottom-0 right-0 flex h-8.5 w-8.5 cursor-pointer items-center justify-center rounded-full bg-primary text-white hover:bg-opacity-90 sm:bottom-2 sm:right-2"
              >
                <svg
                  className="fill-current"
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M4.76464 1.42638C4.87283 1.2641 5.05496 1.16663 5.25 1.16663H8.75C8.94504 1.16663 9.12717 1.2641 9.23536 1.42638L10.2289 2.91663H12.25C12.7141 2.91663 13.1592 3.101 13.4874 3.42919C13.8156 3.75738 14 4.2025 14 4.66663V11.0833C14 11.5474 13.8156 11.9925 13.4874 12.3207C13.1592 12.6489 12.7141 12.8333 12.25 12.8333H1.75C1.28587 12.8333 0.840752 12.6489 0.512563 12.3207C0.184375 11.9925 0 11.5474 0 11.0833V4.66663C0 4.2025 0.184374 3.75738 0.512563 3.42919C0.840752 3.101 1.28587 2.91663 1.75 2.91663H3.77114L4.76464 1.42638Z"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M7.00004 5.83329C6.03354 5.83329 5.25004 6.61679 5.25004 7.58329C5.25004 8.54979 6.03354 9.33329 7.00004 9.33329C7.96654 9.33329 8.75004 8.54979 8.75004 7.58329C8.75004 6.61679 7.96654 5.83329 7.00004 5.83329ZM4.08337 7.58329C4.08337 5.97246 5.38921 4.66663 7.00004 4.66663C8.61087 4.66663 9.91671 5.97246 9.91671 7.58329C9.91671 9.19412 8.61087 10.5 7.00004 10.5C5.38921 10.5 4.08337 9.19412 4.08337 7.58329Z"
                  />
                </svg>
                <input
                  type="file"
                  id="profile"
                  className="sr-only"
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
              </label>
            </div>
          </div>

          {/* Name + Role */}
          <div className="mt-4">
            <h3 className="mb-1.5 text-2xl font-semibold text-black dark:text-white">
              {profile?.full_name || 'User Tanpa Nama'}
            </h3>
            <p className="font-medium text-gray-500">{profile?.email}</p>
            <p className="text-sm text-gray-400 capitalize mt-1">
              Role: {profile?.role || 'user'}
            </p>
          </div>

          {/* Edit Button */}
          <div className="mt-6">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>
      </div>

      {/* Modal Edit */}
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
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <>
      {profile?.role === 'admin' ? (
        <DefaultLayout>{ProfileContent}</DefaultLayout>
      ) : (
        ProfileContent
      )}
    </>
  )
}
