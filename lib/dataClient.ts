import { db, Producto, Venta, VentaItem } from "./offline/db";
import { isOnline } from "./offline/net";
import { enqueue } from "./offline/outbox";
import { syncAll } from "./offline/sync";
import { nanoid } from "nanoid";
import { supabase } from "@/lib/supabaseClient"; // Ajusta la ruta si tu proyecto difiere

/** -------- Productos -------- */

export async function getProductos(): Promise<Producto[]> {
  const local = await db.productos.orderBy("description").toArray();
  if (isOnline()) syncAll().catch(() => {});
  return local;
}

export async function upsertProducto(
  p: Omit<Producto, "id"> & Partial<Pick<Producto, "id">>
) {
  const payload: Producto = { ...p };

  if (isOnline()) {
    const { data, error } = await supabase
      .from("productos")
      .upsert(
        {
          id: payload.id,
          description: payload.description,
          sku: payload.sku,
          price: payload.price,
          status: payload.status,
        },
        { onConflict: "sku" }
      )
      .select()
      .single();

    if (error) throw error;

    await db.productos.put({ ...data, _dirty: false, tempId: undefined });
    return data;
  } else {
    const tempId = payload.tempId ?? nanoid();
    await db.productos.put({
      ...payload,
      tempId,
      _dirty: true,
      updated_at: new Date().toISOString(),
    });
    await enqueue("UPSERT_PRODUCTO", { ...payload, tempId });
    return { ...payload, tempId };
  }
}

/** -------- Ventas + Items -------- */

export async function createVentaWithItems(
  venta: Omit<Venta, "id">,
  items: VentaItem[]
) {
  if (isOnline()) {
    const { data: venta_id, error } = await supabase.rpc(
      "create_venta_with_items",
      {
        p_subtotal: venta.subtotal,
        p_tax: venta.tax,
        p_discount: venta.discount,
        p_total: venta.total,
        p_payment_method: venta.payment_method,
        p_items_count: venta.items_count,
        p_items: items.map((i) => ({
          product_id: i.product_id,
          qty: i.qty,
          unit_price: i.unit_price,
          discount: i.discount,
          line_total: i.line_total,
        })),
      }
    );

    if (error) throw error;

    await db.transaction("rw", db.ventas, db.venta_items, async () => {
      await db.ventas.put({ ...venta, id: venta_id as unknown as number, _dirty: false });
      for (const li of items) {
        await db.venta_items.add({ ...li, venta_id: venta_id as unknown as number, _dirty: false });
      }
    });
    return venta_id;
  } else {
    const tempId = nanoid();
    await db.transaction("rw", db.ventas, db.venta_items, async () => {
      await db.ventas.add({
        ...venta,
        tempId,
        _dirty: true,
        updated_at: new Date().toISOString(),
      });
      for (const li of items) {
        await db.venta_items.add({ ...li, venta_tempId: tempId, _dirty: true });
      }
    });
    await enqueue("CREATE_VENTA", { venta: { ...venta, tempId }, items });
    return tempId;
  }
}

export async function getVentasLocal(limit = 50) {
  return db.ventas.orderBy("created_at").reverse().limit(limit).toArray();
}
