'use client'
import { useState } from 'react'
import { addProductLocal } from '@/lib/sync'

export default function ProductForm () {
  const [name, setName] = useState('')
  const [price, setPrice] = useState<number | ''>('')
  const [saving, setSaving] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || price === '') return
    setSaving(true)
    await addProductLocal({ name, price: Number(price) })
    setName('')
    setPrice('')
    setSaving(false)
  }

  return (
    <form onSubmit={submit} className="flex gap-2 items-end">
      <div>
        <label className="block text-sm">Nombre</label>
        <input className="border p-2 rounded w-48" value={name} onChange={e=>setName(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm">Precio</label>
        <input type="number" step="0.01" className="border p-2 rounded w-32" value={price} onChange={e=>setPrice(e.target.value as any)} />
      </div>
      <button disabled={saving} className="px-3 py-2 rounded bg-black text-white disabled:opacity-50">
        {saving ? 'Guardando…' : 'Agregar'}
      </button>
    </form>
  )
}