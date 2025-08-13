import Dexie, { Table } from "dexie";

export type Producto = {
  id?: number;
  tempId?: string;
  description: string;
  sku: string | null;
  price: number;
  status: boolean;
  user_id?: string | null;
  created_at?: string;
  updated_at?: string;
  _dirty?: boolean;
  _deleted?: boolean;
};

export type Venta = {
  id?: number;
  tempId?: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  payment_method: string;
  items_count: number;
  user_id?: string | null;
  created_at?: string;
  updated_at?: string;
  _dirty?: boolean;
};

export type VentaItem = {
  id?: number;
  tempId?: string;
  venta_id?: number;
  venta_tempId?: string;
  product_id: number;
  qty: number;
  unit_price: number;
  discount: number;
  line_total: number;
  _dirty?: boolean;
};

export type OutboxItem = {
  id?: number;
  op: "UPSERT_PRODUCTO" | "CREATE_VENTA";
  payload: any;
  createdAt: number;
  tries: number;
};

export type Meta = {
  key: string;
  value: any;
};

class POSDB extends Dexie {
  productos!: Table<Producto, number>;
  ventas!: Table<Venta, number>;
  venta_items!: Table<VentaItem, number>;
  outbox!: Table<OutboxItem, number>;
  meta!: Table<Meta, string>;

  constructor() {
    super("pos_offline_db");
    this.version(1).stores({
      productos: "++id, tempId, sku, updated_at, _dirty, _deleted, status",
      ventas: "++id, tempId, updated_at, _dirty, payment_method, total",
      venta_items: "++id, tempId, venta_id, venta_tempId",
      outbox: "++id, op, createdAt, tries",
      meta: "key",
    });
  }
}

export const db = new POSDB();
