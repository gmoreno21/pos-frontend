'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function LoginPage () {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const signin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) setError(error.message)
    else router.push('/products')
  }

  const signup = async () => {
    setLoading(true); setError('')
    const { error } = await supabase.auth.signUp({ email, password })
    setLoading(false)
    if (error) setError(error.message)
    else alert('Revisa tu correo para confirmar la cuenta.')
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Iniciar sesión</h1>
      <form onSubmit={signin} className="space-y-3">
        <input className="border p-2 rounded w-full" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="border p-2 rounded w-full" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button disabled={loading} className="px-3 py-2 rounded bg-black text-white disabled:opacity-50 w-full">{loading ? 'Entrando…' : 'Entrar'}</button>
      </form>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button className="underline" onClick={signup}>Crear cuenta</button>
    </div>
  )
}