import { db, Producto, Venta, VentaItem } from "./db";
import { supabase } from "@/lib/supabaseClient"; // Ajusta la ruta si tu proyecto difiere

function nowISO() {
  return new Date().toISOString();
}

async function getMeta(key: string) {
  const m = await db.meta.get({ key });
  return m?.value ?? null;
}

async function setMeta(key: string, value: any) {
  await db.meta.put({ key, value });
}

/** PULL: trae cambios del servidor a IndexedDB (por updated_at) */
export async function pullFromServer() {
  // PRODUCTOS
  const lastSyncProd: string | null = await getMeta("lastSync_productos");
  let qProd = supabase
    .from("productos")
    .select("*")
    .order("updated_at", { ascending: true })
    .limit(500);
  if (lastSyncProd) qProd = qProd.gt("updated_at", lastSyncProd);
  const pRes = await qProd;
  if (pRes.data) {
    await db.transaction("rw", db.productos, db.meta, async () => {
      for (const row of pRes.data!) {
        await db.productos.put({ ...row, _dirty: false, tempId: undefined });
      }
      if (pRes.data!.length > 0) {
        await setMeta(
          "lastSync_productos",
          pRes.data![pRes.data!.length - 1].updated_at
        );
      }
    });
  }

  // VENTAS (opcional: si quieres ver ventas creadas en otro dispositivo)
  const lastSyncVentas: string | null = await getMeta("lastSync_ventas");
  let qVen = supabase
    .from("ventas")
    .select("*")
    .order("updated_at", { ascending: true })
    .limit(500);
  if (lastSyncVentas) qVen = qVen.gt("updated_at", lastSyncVentas);
  const vRes = await qVen;
  if (vRes.data) {
    await db.transaction("rw", db.ventas, db.meta, async () => {
      for (const row of vRes.data!) {
        await db.ventas.put({ ...row, _dirty: false, tempId: undefined });
      }
      if (vRes.data!.length > 0) {
        await setMeta(
          "lastSync_ventas",
          vRes.data![vRes.data!.length - 1].updated_at
        );
      }
    });
  }
}

/** PUSH: procesa la outbox y sube pendientes */
export async function pushOutbox() {
  const pending = await db.outbox.orderBy("createdAt").toArray();

  for (const item of pending) {
    try {
      if (item.op === "UPSERT_PRODUCTO") {
        const prod: Producto = item.payload;
        const { error } = await supabase
          .from("productos")
          .upsert(
            {
              id: prod.id,
              description: prod.description,
              sku: prod.sku,
              price: prod.price,
              status: prod.status,
            },
            { onConflict: "sku" }
          );

        if (error) throw error;

        await db.productos
          .where({ tempId: prod.tempId })
          .modify({ _dirty: false });
        await db.outbox.delete(item.id!);
      }

      if (item.op === "CREATE_VENTA") {
        const { venta, items }: { venta: Venta; items: VentaItem[] } =
          item.payload;

        const { data: venta_id, error } = await supabase.rpc(
          "create_venta_with_items",
          {
            p_subtotal: venta.subtotal,
            p_tax: venta.tax,
            p_discount: venta.discount,
            p_total: venta.total,
            p_payment_method: venta.payment_method,
            p_items_count: venta.items_count,
            p_items: items.map((it) => ({
              product_id: it.product_id,
              qty: it.qty,
              unit_price: it.unit_price,
              discount: it.discount,
              line_total: it.line_total,
            })),
          }
        );

        if (error) throw error;

        await db.transaction(
          "rw",
          db.ventas,
          db.venta_items,
          db.outbox,
          async () => {
            await db.ventas
              .where({ tempId: venta.tempId })
              .modify({ id: venta_id, _dirty: false });
            const relatedItems = await db.venta_items
              .where({ venta_tempId: venta.tempId })
              .toArray();
            for (const li of relatedItems) {
              await db.venta_items.update(li.id!, {
                venta_id: venta_id as unknown as number,
                _dirty: false,
              });
            }
            await db.outbox.delete(item.id!);
          }
        );
      }
    } catch (err) {
      await db.outbox.update(item.id!, { tries: (item.tries ?? 0) + 1 });
      break; // evita reintentos agresivos en loop
    }
  }
}

/** Orquestador: ejecuta push luego pull */
export async function syncAll() {
  await pushOutbox();
  await pullFromServer();
}
