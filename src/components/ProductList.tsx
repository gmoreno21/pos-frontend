'use client'
import { useEffect, useState } from 'react'
import { db } from '@/lib/db'
import { deleteProductLocal, updateProductLocal } from '@/lib/sync'

export default function ProductList () {
  const [rows, setRows] = useState<any[]>([])

  useEffect(() => {
    const reload = async () => setRows(await db.products.toArray())
    reload()
    const sub = db.products.hook('creating', () => {}) // fuerza import
    const interval = setInterval(reload, 1000)
    return () => { clearInterval(interval); db.products.hook('creating').unsubscribe(sub) }
  }, [])

  return (
    <div className="mt-4">
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">ID</th>
            <th className="p-2 text-left">Nombre</th>
            <th className="p-2 text-left">Precio</th>
            <th className="p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(p => (
            <tr key={p.id} className="border-t">
              <td className="p-2">{p.id}</td>
              <td className="p-2">
                <input defaultValue={p.name} className="border p-1 rounded w-full" onBlur={e=>updateProductLocal(p.id, { name: e.target.value })} />
              </td>
              <td className="p-2">
                <input type="number" step="0.01" defaultValue={p.price} className="border p-1 rounded w-24" onBlur={e=>updateProductLocal(p.id, { price: Number(e.target.value) })} />
              </td>
              <td className="p-2 text-center">
                <button className="underline" onClick={()=>deleteProductLocal(p.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}