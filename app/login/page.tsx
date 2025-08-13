'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { LogIn } from 'lucide-react'
import { useRouter } from 'next/navigation'
import useAuthGuard from '@/hooks/useAuthGuard'
import { Label } from '@/components/ui/label'
import styles from './login.module.css'

export default function LoginPage() {
  useAuthGuard()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) toast.error(error.message)
    else { toast.success('Bienvenido'); router.replace('/products') }
  }

  const signUp = async () => {
    if (!email || !password) { toast.error('Ingresa email y contraseña'); return }
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    setLoading(false)
    if (error) toast.error(error.message)
    else toast.success('Revisa tu correo para confirmar.')
  }

  return (
    <div className={styles.login}>
    <section className={`${styles.loginCard} ${styles.fadeInUp}`}>
      <h1 className={styles.loginTitle}>Inicia sesión</h1>
  
      <form onSubmit={submit} className={styles.loginForm}>
        <div className={styles.field}>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        </div>
  
        <div className={styles.field}>
          <Label htmlFor="password">Contraseña</Label>
          <Input id="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        </div>
  
        <div className={styles.actions}>
          <Button type="submit" disabled={loading}>
            <LogIn className="mr-2" size={16}/> Entrar
          </Button>
        </div>
      </form>
    </section>
  </div>
  )
}
