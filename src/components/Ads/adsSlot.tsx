'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type AdSlotProps = {
  slot: 'home_banner' | 'news_sidebar'
  className?: string
}

export default function AdSlot({ slot, className = '' }: AdSlotProps) {
  const [ad, setAd] = useState<{ image_url: string; redirect_url: string } | null>(null)

  useEffect(() => {
    const fetchAd = async () => {
      const { data, error } = await supabase
        .from('ads')
        .select('image_url, redirect_url')
        .eq('slot_name', slot)
        .maybeSingle()

      if (error) console.error(error)
      else setAd(data)
    }

    fetchAd()
  }, [slot])

  if (!ad?.image_url) return null // tidak tampil jika belum ada iklan

  return (
    <div className={`flex justify-center ${className}`}>
      <a href={ad.redirect_url || '#'} target="_blank" rel="noopener noreferrer">
        <img
          src={ad.image_url}
          alt={slot}
          className={`rounded-lg shadow-sm object-contain
            ${slot === 'home_banner' ? 'w-full max-h-48' : 'w-60 max-h-[500px]'}`}
        />
      </a>
    </div>
  )
}
