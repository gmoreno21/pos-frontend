"use client";
import useAuthGuard from "@/hooks/useAuthGuard";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatMoney } from "@/lib/utils";
import styles from "./sales.module.css";
import {
  Search,
  PlusCircle,
  Trash2,
  Minus,
  Plus,
  Percent,
  Wallet,
  CreditCard,
  Banknote,
  Receipt,
} from "lucide-react";

type Product = {
  id: number;
  description: string;
  sku: string | null;
  price: number;
  status: boolean;
};
type CartLine = { product: Product; qty: number; discount: number };

export default function SalesPage() {
  useAuthGuard();
  const [products, setProducts] = useState<Product[]>([]);
  const [q, setQ] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [ticketDiscount, setTicketDiscount] = useState(0);
  const [payment, setPayment] = useState<"cash" | "card" | "transfer">("cash");

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from("productos")
      .select("*")
      .eq("status", true)
      .order("description");
    if (error) toast.error(error.message);
    else setProducts(data as Product[]);
  };
  useEffect(() => {
    loadProducts();
  }, []);

  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    return products.filter(
      (p) =>
        p.description.toLowerCase().includes(s) ||
        (p.sku ?? "").toLowerCase().includes(s)
    );
  }, [q, products]);

  const add = (p: Product) => {
    setCart((curr) => {
      const idx = curr.findIndex((l) => l.product.id === p.id);
      if (idx >= 0) {
        const c = [...curr];
        c[idx].qty += 1;
        return c;
      }
      return [...curr, { product: p, qty: 1, discount: 0 }];
    });
  };
  const remove = (id: number) =>
    setCart((c) => c.filter((l) => l.product.id !== id));
  const setQty = (id: number, qty: number) =>
    setCart((c) =>
      c.map((l) => (l.product.id === id ? { ...l, qty: Math.max(1, qty) } : l))
    );
  const inc = (id: number) =>
    setCart((c) =>
      c.map((l) => (l.product.id === id ? { ...l, qty: l.qty + 1 } : l))
    );
  const dec = (id: number) =>
    setCart((c) =>
      c.map((l) =>
        l.product.id === id ? { ...l, qty: Math.max(1, l.qty - 1) } : l
      )
    );
  const setLineDisc = (id: number, d: number) =>
    setCart((c) =>
      c.map((l) =>
        l.product.id === id ? { ...l, discount: Math.max(0, d) } : l
      )
    );

  const subtotal = cart.reduce((s, l) => s + l.product.price * l.qty, 0);
  const tax = +(subtotal * 0.16).toFixed(2);
  const discount = ticketDiscount + cart.reduce((s, l) => s + l.discount, 0);
  const total = Math.max(0, subtotal + tax - discount);

  const finalize = async () => {
    if (cart.length === 0) {
      toast.error("Carrito vacío");
      return;
    }
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      toast.error("No autenticado");
      return;
    }

    const { data: venta, error: e1 } = await supabase
      .from("ventas")
      .insert({
        subtotal,
        tax,
        discount,
        total,
        payment_method: payment,
        items_count: cart.reduce((s, l) => s + l.qty, 0),
      })
      .select()
      .single();
    if (e1) {
      toast.error(e1.message);
      return;
    }

    const items = cart.map((l) => ({
      venta_id: venta.id,
      product_id: l.product.id,
      qty: l.qty,
      unit_price: l.product.price,
      discount: l.discount,
      line_total: l.product.price * l.qty - l.discount,
    }));
    const { error: e2 } = await supabase.from("venta_items").insert(items);
    if (e2) {
      toast.error(e2.message);
      return;
    }

    toast.success(`Venta #${venta.id} creada`);
    setCart([]);
    setTicketDiscount(0);
  };

  return (
    <div className={`${styles.grid} fade-in-up`}>
      {/* ---- Productos ---- */}
      <div className="card">
        <div className={`card-header ${styles.header}`}>
          <h2 className="font-semibold">Productos</h2>
          <div className={styles.searchWrap}>
            <Search size={16} className={styles.searchIcon} />
            <Input
              className={styles.searchInput}
              placeholder="Buscar por nombre o SKU..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Buscar productos"
            />
          </div>
        </div>

        <div className="card-content">
          <div className={styles.productGrid}>
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => add(p)}
                className={styles.productBtn}
                aria-label={`Agregar ${p.description}`}
              >
                <div className={styles.productTop}>
                  <span className={styles.productTitle}>{p.description}</span>
                  <PlusCircle size={18} />
                </div>
                <div className={styles.productMeta}>{p.sku ?? "-"}</div>
                <div className={styles.productPrice}>
                  {formatMoney(p.price)}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ---- Carrito ---- */}
      <div className="card">
        <div className="card-header">
          <h2 className="font-semibold">Carrito</h2>
        </div>
        <div className="card-content space-y-3">
          <div className="space-y-2 ">
            {cart.map((l) => (
              <div key={l.product.id} className={styles.line}>
                <div>
                  <div className="font-medium">{l.product.description}</div>
                  <div className="text-xs text-dim">
                    {formatMoney(l.product.price)} c/u
                  </div>
                </div>

                <div className={styles.qty} aria-label="Cantidad">
                  <button
                    className={styles.qtyBtn}
                    type="button"
                    onClick={() => dec(l.product.id)}
                    aria-label="Menos"
                  >
                    <Minus />
                  </button>
                  <Input
                    className={styles.qtyInput}
                    type="number"
                    value={l.qty}
                    onChange={(e) =>
                      setQty(l.product.id, e.target.valueAsNumber)
                    }
                    min={1}
                  />
                  <button
                    className={styles.qtyBtn}
                    type="button"
                    onClick={() => inc(l.product.id)}
                    aria-label="Más"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <div className={styles.disc} aria-label="Descuento de la línea">
                  <Percent size={14} />
                  <Input
                    className={styles.discInput}
                    type="number"
                    step="0.01"
                    value={l.discount}
                    onChange={(e) =>
                      setLineDisc(l.product.id, e.target.valueAsNumber)
                    }
                    placeholder="0.00"
                  />
                </div>

                <Button
                  variant="outline"
                  className={styles.removeBtn}
                  onClick={() => remove(l.product.id)}
                >
                  <Trash2 size={16} className="mr-1" /> Quitar
                </Button>
              </div>
            ))}
          </div>

          <div className="border-t border-soft pt-3">
            <div className={styles.totals}>
              <div className={styles.totalRow}>
      
                <span className="badge" >Subtotal</span>
                <span>{formatMoney(subtotal)}</span>
              </div>
              <div className={styles.totalRow}>
                <span>Impuestos (16%)</span>
                <span>{formatMoney(tax)}</span>
              </div>

              <div className={styles.totalRow}>
                <span>Descuento ticket</span>
                <Input
                  type="number"
                  step="0.01"
                  value={ticketDiscount}
                  onChange={(e) => setTicketDiscount(e.target.valueAsNumber)}
                  className={styles.discInput}
                />
              </div>

              <div className={`${styles.totalRow} ${styles.totalBig}`}>
                <span>Total</span>
                <span>{formatMoney(total)}</span>
              </div>

              <div className="flex flex-wrap gap-2 items-center">
                <select
                  value={payment}
                  onChange={(e) => setPayment(e.target.value as any)}
                  className={`input ${styles.paySelect}`}
                >
                  <option value="cash">Efectivo</option>
                  <option value="card">Tarjeta</option>
                  <option value="transfer">Transferencia</option>
                </select>
                <span >  &nbsp; &nbsp; </span>
                {/* Pista visual del método de pago */}
                {payment === "cash" && (
                  <span className="text-dim inline-flex items-center gap-1 text-sm">
                    <Banknote size={16} /> Efectivo
                  </span>
                )}
                {payment === "card" && (
                  <span className="text-dim inline-flex items-center gap-1 text-sm">
                    <CreditCard size={16} /> Tarjeta
                  </span>
                )}
                {payment === "transfer" && (
                  <span className="text-dim inline-flex items-center gap-1 text-sm">
                    <Wallet size={16} /> Transferencia
                  </span>
                )}
              </div>

              <div>
                <Button onClick={finalize}>
                  <Receipt size={16} className="mr-2" /> Finalizar venta
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
