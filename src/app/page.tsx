import AuthGate from '@/components/AuthGate'
import ProductForm from '@/components/ProductForm'
import ProductList from '@/components/ProductList'

export default function ProductsPage () {
  return (
    <AuthGate>
      <h1 className="text-2xl font-semibold mb-4">Productos</h1>
      <h2> Hola desde vercel</h2>
      <ProductForm />
      <ProductList />
    </AuthGate>
  )
}