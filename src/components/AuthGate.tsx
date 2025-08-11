'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { setupOnlineSync } from '@/lib/sync'
import Link from 'next/link'

export default function AuthGate ({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
      if (data.session) setupOnlineSync()
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, sess) => {
      setSession(sess)
      if (sess) setupOnlineSync()
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  if (loading) return <div className="p-6">Cargando…</div>
  if (!session) return (
    <div className="p-6 space-y-4">
      <p>Necesitas iniciar sesión.</p>
      <Link className="underline" href="/login">Ir a Login</Link>
    </div>
  )
  return <>{children}</>
}