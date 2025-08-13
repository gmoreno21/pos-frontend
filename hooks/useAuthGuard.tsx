'use client'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function useAuthGuard(){
  const router = useRouter()
  const pathname = usePathname()
  useEffect(()=>{
    supabase.auth.getSession().then(({ data })=>{
      const hasSession = !!data.session
      if (!hasSession && pathname !== '/login') router.replace('/login')
      if (hasSession && pathname === '/login') router.replace('/products')
    })
  }, [router, pathname])
}
