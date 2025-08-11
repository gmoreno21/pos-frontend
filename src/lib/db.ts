import Dexie, { Table } from 'dexie'

export type Product = {
  id?: number
  name: string
  price: number
  user_id?: string // dueño del registro
  _tempId?: string // id temporal para sync
  _op?: 'create' | 'update' | 'delete' // operación pendiente
}

class AppDB extends Dexie {
  products!: Table<Product, number>
  outbox!: Table<Product, number>
  constructor () {
    super('next_supabase_offline_pos')
    this.version(1).stores({
      products: '++id,name,user_id',
      outbox: '++id' // cola de operaciones para sincronizar
    })
  }
}

export const db = new AppDB()