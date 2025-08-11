import './globals.css'
import Link from 'next/link'

export const metadata = { title: 'NSO POS' }
export default function RootLayout ({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-white text-gray-900">
        <nav className="p-4 border-b flex gap-4">
          <Link href="/">Inicio</Link>
          <Link href="/products">Productos</Link>
        </nav>
        <main className="p-4 max-w-3xl mx-auto">{children}</main>
      </body>
    </html>
  )
}