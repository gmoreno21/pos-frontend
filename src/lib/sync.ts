'use client'
import { db, type Product } from './db'
import { supabase } from './supabaseClient'

export async function pullProducts (): Promise<void> {
  const user = (await supabase.auth.getUser()).data.user
  if (!user) return
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', user.id)
  if (error) throw error
  if (data) {
    await db.products.clear()
    await db.products.bulkAdd(data as Product[])
  }
}

export async function pushOutbox (): Promise<void> {
  const user = (await supabase.auth.getUser()).data.user
  if (!user) return
  const ops = await db.outbox.toArray()
  for (const op of ops) {
    try {
      if (op._op === 'create') {
        const { error } = await supabase.from('products').insert({
          name: op.name,
          price: op.price,
          user_id: user.id
        })
        if (error) throw error
      } else if (op._op === 'update' && op.id) {
        const { error } = await supabase.from('products')
          .update({ name: op.name, price: op.price })
          .eq('id', op.id)
          .eq('user_id', user.id)
        if (error) throw error
      } else if (op._op === 'delete' && op.id) {
        const { error } = await supabase.from('products')
          .delete()
          .eq('id', op.id)
          .eq('user_id', user.id)
        if (error) throw error
      }
      await db.outbox.delete(op.id!)
    } catch {
      // si falla, dejamos en outbox para reintento posterior
    }
  }
}

export async function addProductLocal (p: Omit<Product, 'id'|'user_id'>) {
  // Guardar local
  const id = await db.products.add({ ...p })
  // Encolar operación
  await db.outbox.add({ id, ...p, _op: 'create' })
}

export async function updateProductLocal (id: number, p: Partial<Product>) {
  await db.products.update(id, p)
  await db.outbox.add({ id, ...(p as Product), _op: 'update' })
}

export async function deleteProductLocal (id: number) {
  await db.products.delete(id)
  await db.outbox.add({ id, name: '', price: 0, _op: 'delete' })
}

export function setupOnlineSync () {
  // intenta sincronizar cuando vuelve la conexión y al iniciar sesión
  const attemptSync = async () => {
    try {
      await pushOutbox()
      await pullProducts()
    } catch {}
  }
  window.addEventListener('online', attemptSync)
  attemptSync()
}