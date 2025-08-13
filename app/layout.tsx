import './globals.css'
import type { Metadata } from 'next'
import ThemeProvider from '@/providers/ThemeProvider'
import QueryProvider from '@/providers/QueryProvider'
import Header from '@/components/Header'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'POS Supabase',
  description: 'POS con Next.js + Supabase',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="bg-app text-baseclr">
        <ThemeProvider>
          <QueryProvider>
            <Header />
            <main className="container mx-auto px-4 py-6 space-y-6">{children}</main>
            <footer className="container mx-auto px-4 py-6 text-xs text-dim">© POS</footer>
            <Toaster richColors position="top-center" />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
