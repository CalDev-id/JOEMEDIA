'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user: authUser }, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      alert(error.message)
      return
    }

    if (!authUser) {
      alert('❌ Login failed, no user returned.')
      return
    }

    // Ambil role dari profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authUser.id)
      .single()

    if (profileError || !profile) {
      alert('❌ Cannot find user profile.')
      return
    }

    // Redirect berdasarkan role
    if (profile.role === 'admin') {
      router.push('/admin')
    } else {
      router.push('/home')
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) alert(error.message)
    else alert('✅ Account created! Please check your email.')
  }

  return (
    <div className="max-w-sm mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full rounded"
          required
        />
        <div className="flex gap-2">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            Login
          </button>
          <button
            type="button"
            onClick={handleSignup}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Sign Up
          </button>
        </div>
      </form>
    </div>
  )
}
