// components/Nav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'
import {
  Store as PosIcon,
  Package,
  Boxes,
  Users,
  BarChart3,
  Shield,
  Menu,
  X,
  LogIn,
  LogOut,
  Icon,
} from "lucide-react";
import { useState } from "react";

const items = [
  { href: "/login", label: "Iniciar sesión", icon: LogIn },
  { href: "/sales", label: "Punto de venta", icon: PosIcon },
  { href: "/products", label: "Productos", icon: Package },
//  { href: "/inventory", label: "Inventario", icon: Boxes },
 // { href: "/clients", label: "Clientes", icon: Users },
  { href: "/reports", label: "Reportes", icon: BarChart3 },
//  { href: "/users", label: "Usuarios", icon: Shield },
  //{ href: "/close", label: "Cerrar Sesion", icon: LogOut },
];

const logout = async ()=>{
  const { error } = await supabase.auth.signOut()
  if (error) toast.error(error.message)
  else toast.success('Sesión cerrada')
}

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="nav">
      {/* Mobile toggle */}
      <button
        className="nav-toggle"
        aria-expanded={open}
        aria-controls="main-nav"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
        <span className="sr-only">Abrir menú</span>
      </button>

      <ul id="main-nav" className={`nav-list ${open ? "is-open" : ""}`}>
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                className={`nav-pill ${active ? "is-active" : ""}`}
                aria-current={active ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                <span className="nav-ico">
                  <Icon size={18} strokeWidth={2} />
                </span>
                <span className="nav-text">{label}</span>
                {/* Shine effect */}
                <span aria-hidden className="nav-shine" />
              </Link>
            </li>
          );
        })}

<li key="close">
  
              <Link
                href="/"
                className={`nav-pill is-active"`}
                aria-current= "page"
                onClick={logout}
              >
                <span className="nav-ico">
                <LogOut size={18} strokeWidth={2} />
                </span>
                <span className="nav-text">Salir</span>
                {/* Shine effect */}
                <span aria-hidden className="nav-shine" />
              </Link>
            </li>
      </ul>

    </nav>
  );
}
