"use client";
import useAuthGuard from "@/hooks/useAuthGuard";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/table";
import { toast } from "sonner";
import { z } from "zod";
import styles from "./products.module.css";

type Product = {
  id: number;
  created_at: string;
  updated_at: string;
  description: string;
  sku: string | null;
  price: number;
  status: boolean;
};

const schema = z.object({
  id: z.coerce.number(),
  description: z.string().min(2, "Descripción mínima de 2 caracteres"),
  sku: z
    .string()
    .max(64)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  price: z.coerce.number().positive("Precio debe ser > 0"),
  status: z.boolean().default(true),
});

export default function ProductsPage() {
  useAuthGuard();
  const [items, setItems] = useState<Product[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    id: 0,
    description: "",
    sku: "",
    price: 0,
    status: true,
  });

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("productos")
      .select("*")
      .eq("status", true)
      .order("id", { ascending: false });
    setLoading(false);
    if (error) toast.error(error.message);
    else setItems(data as Product[]);
  };
  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    return items.filter(
      (it) =>
        it.description.toLowerCase().includes(s) ||
        (it.sku ?? "").toLowerCase().includes(s)
    );
  }, [q, items]);

  const save = async () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.message);
      return;
    }
    const payload = {
      description: parsed.data.description,
      sku: parsed.data.sku,
      price: parsed.data.price,
      status: parsed.data.status,
    };

    if (form.id) {
      const { error } = await supabase
        .from("productos")
        .update(payload)
        .eq("id", form.id);
      if (error) toast.error(error.message);
      else {
        toast.success("Actualizado");
        setForm({ id: 0, description: "", sku: "", price: 0, status: true });
        load();
      }
    } else {
      const { error } = await supabase
        .from("productos")
        .insert(payload)
        .select();
      if (error) toast.error(error.message);
      else {
        toast.success("Creado");
        setForm({ id: 0, description: "", sku: "", price: 0, status: true });
        load();
      }
    }
  };

  const edit = (p: Product) =>
    setForm({
      id: p.id,
      description: p.description,
      sku: p.sku ?? "",
      price: p.price,
      status: p.status,
    });
  const toggle = async (p: Product) => {
    const { error } = await supabase
      .from("productos")
      .update({ status: !p.status })
      .eq("id", p.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Estado actualizado");
      load();
    }
  };

  return (
    <div className={`${styles.container}`}>
      {/* --- Formulario --- */}
      <div className={`card ${styles.card}`}>
        <div className={`card-header ${styles.header}`}>
          <h2 className="font-semibold">Producto</h2>
        </div>

        <div className={`card-content ${styles.form}`}>
          <div className={styles.field}>
            <label className="text-sm text-dim">Descripción</label>
            <Input
              placeholder="Ingresa descripcion de producto"
              value={form.description}
              onChange={(e) =>
                setForm((s) => ({ ...s, description: e.target.value }))
              }
            />
          </div>

          <div className={styles.row2}>
            <div className={styles.field}>
              <label className="text-sm text-dim">SKU (opcional)</label>
              <Input
                placeholder="Ingresa sku de producto"
                value={form.sku}
                onChange={(e) =>
                  setForm((s) => ({ ...s, sku: e.target.value }))
                }
              />
            </div>
            <div className={styles.field}>
              <label className="text-sm text-dim">Precio</label>
              <Input
                placeholder="Ingresa precio unitario de producto"
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) =>
                  setForm((s) => ({ ...s, price: e.target.valueAsNumber }))
                }
              />
            </div>
          </div>

          <div className={styles.checkRow}>
            <input
              id="status"
              type="checkbox"
              checked={form.status}
              onChange={(e) =>
                setForm((s) => ({ ...s, status: e.target.checked }))
              }
            />
            <label htmlFor="status" className="text-sm text-dim">
              Listo para venta
            </label>
          </div>

          <div className={styles.actions}>
            <Button onClick={save}>{form.id ? "Actualizar" : "Crear"}</Button>
            {form.id ? (
              <Button
                variant="outline"
                onClick={() =>
                  setForm({
                    id: 0,
                    description: "",
                    sku: "",
                    price: 0,
                    status: true,
                  })
                }
              >
                Cancelar
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {/* --- Listado --- */}
      <div className={`card ${styles.card}`}>
        <div className={`card-header ${styles.header}`}>
          <h2 className="font-semibold">Listado</h2>
          <Input
            className={styles.search}
            placeholder="Buscar..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div className="card-content">
          {loading ? (
            <div className={styles.skeleton} />
          ) : (
            <div className={styles.tableWrap}>
              <Table>
                <THead>
                  <tr>
                    <TH className={styles.thNarrow}>ID</TH>
                    <TH>Descripción</TH>
                    <TH>SKU</TH>
                    <TH>Precio</TH>
                    <TH>Estado</TH>
                    <TH>Acciones</TH>
                  </tr>
                </THead>
                <TBody>
                  {filtered.map((p) => (
                    <TR key={p.id}>
                      <TD>{p.id}</TD>
                      <TD>{p.description}</TD>
                      <TD>{p.sku ?? "-"}</TD>
                      <TD className={styles.money}>${p.price.toFixed(2)}</TD>
                      <TD >
                        <span
                          className={`${styles.badge} ${
                            p.status ? styles.badgeActive : styles.badgeInactive
                          }`}
                        >
                          {p.status ? "Activo" : "Inactivo"}
                        </span>
                      </TD>
                      <TD>
                        <div className={styles.actions}>
                          <Button variant="outline" onClick={() => edit(p)}>
                            Editar
                          </Button>
                          <Button
                            variant={p.status ? "outline" : "outline"}
                            onClick={() => toggle(p)}
                          >
                            {p.status ? "Desactivar" : "Activar"}
                          </Button>
                        </div>
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
