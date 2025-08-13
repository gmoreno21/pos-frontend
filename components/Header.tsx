'use client'
import Link from 'next/link'
import ThemeToggle from './ThemeToggle'
import { Button } from './ui/button'
import { supabase } from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'
import { LogOut } from 'lucide-react'
import { toast } from 'sonner'
import Nav from './Nav'

export default function Header() {
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user?.email ?? null)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const logout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) toast.error(error.message)
    else toast.success('Sesión cerrada')
  }

  return (
    <header className="border-b border-soft sticky top-0 z-40 bg-card/90 backdrop-blur">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Nav  />
      </div>
    </header>
  )
}
