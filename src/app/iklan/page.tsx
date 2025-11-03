'use client'

import { useState, useEffect } from 'react'
import DefaultLayout from '@/components/Layouts/DefaultLayout'
import { supabase } from '@/lib/supabaseClient'

export default function IklanPage() {
  const [ads, setAds] = useState<{ slot_name: string; image_url: string | null; redirect_url: string | null }[]>([])

  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedAd, setSelectedAd] = useState<any>(null)
  const [redirectUrl, setRedirectUrl] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const fetchAds = async () => {
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .in('slot_name', ['home_banner', 'news_sidebar'])
      if (error) console.error(error)
      setAds(data || [])
      setLoading(false)
    }
    fetchAds()
  }, [])

  const handleEdit = (ad: any) => {
    setSelectedAd(ad)
    setRedirectUrl(ad.redirect_url || '')
    setShowModal(true)
  }

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      const file = event.target.files?.[0]
      if (!file) return

      const fileExt = file.name.split('.').pop()
      const fileName = `${selectedAd.slot_name}_${Date.now()}.${fileExt}`
      const filePath = `ads/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('news-images')
        .upload(filePath, file, { upsert: true })
      if (uploadError) throw uploadError

      const { data: publicUrl } = supabase.storage
        .from('news-images')
        .getPublicUrl(filePath)

      await updateAd(publicUrl.publicUrl)
    } catch (err) {
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  const updateAd = async (newImageUrl?: string) => {
    const { error } = await supabase
      .from('ads')
      .update({
        image_url: newImageUrl || selectedAd.image_url,
        redirect_url: redirectUrl,
      })
      .eq('slot_name', selectedAd.slot_name)

    if (error) console.error(error)

    const { data } = await supabase
      .from('ads')
      .select('*')
      .in('slot_name', ['home_banner', 'news_sidebar'])
    setAds(data || [])
    setShowModal(false)
  }

  if (loading) return <DefaultLayout><p>Loading...</p></DefaultLayout>

  return (
    <DefaultLayout>
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-6">Kelola Iklan</h1>

        <div className="grid md:grid-cols-2 gap-6">
          {ads.map((ad: any) => (
            <div key={ad.slot_name} className="border rounded-lg p-4 shadow-sm">
              <h2 className="font-medium mb-2 capitalize">
                {ad.slot_name === 'home_banner' ? 'Iklan Home (Horizontal)' : 'Iklan Berita (Vertical)'}
              </h2>
              {ad.image_url ? (
                <img
                  src={ad.image_url}
                  alt={ad.slot_name}
                  className="w-full max-h-60 object-contain mb-2"
                />
              ) : (
                <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-400">
                  Tidak ada gambar
                </div>
              )}
              <p className="text-sm text-gray-500 mb-2">
                Redirect URL: {ad.redirect_url || '-'}
              </p>
              <button
                onClick={() => handleEdit(ad)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Edit
              </button>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-[90%] max-w-md">
              <h2 className="text-xl font-semibold mb-4">Edit Iklan</h2>

              <label className="block mb-2 text-sm font-medium">Gambar</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                disabled={uploading}
                className="mb-4"
              />

              <label className="block mb-2 text-sm font-medium">Redirect URL</label>
              <input
                type="text"
                value={redirectUrl}
                onChange={(e) => setRedirectUrl(e.target.value)}
                placeholder="https://example.com"
                className="border w-full p-2 rounded mb-4"
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded"
                >
                  Batal
                </button>
                <button
                  onClick={() => updateAd()}
                  disabled={uploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DefaultLayout>
  )
}
