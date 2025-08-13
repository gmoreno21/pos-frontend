'use client'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { Button } from './ui/button'

export default function ThemeToggle(){
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'
  return (
    <Button variant="ghost" aria-label="Cambiar tema" onClick={()=> setTheme(isDark ? 'light' : 'dark')}>
      {isDark ? <Sun size={18}/> : <Moon size={18}/>}
    </Button>
  )
}
