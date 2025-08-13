'use client'
import useAuthGuard from '@/hooks/useAuthGuard'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Input } from '@/components/ui/input'
import { formatMoney } from '@/lib/utils'
import styles from './reports.module.css'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from 'recharts'
import { CalendarRange, TrendingUp, Receipt, ShoppingCart } from 'lucide-react'

type Venta = { id:number, created_at:string, total:number, payment_method:string, items_count:number }

type RangeKey = '7d' | '30d' | '90d' | 'custom'

export default function ReportsPage() {
  useAuthGuard()
  const [from, setFrom] = useState<string>(() => new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().slice(0, 10))
  const [to, setTo] = useState<string>(() => new Date().toISOString().slice(0, 10))
  const [range, setRange] = useState<RangeKey>('30d')
  const [data, setData] = useState<Venta[]>([])

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('ventas')
        .select('*')
        .gte('created_at', from)
        .lte('created_at', to + 'T23:59:59Z')
        .order('created_at', { ascending: true })
      if (!error) setData((data ?? []) as Venta[])
    }
    load()
  }, [from, to])

  // Rango rápido
  const setQuickRange = (rk: RangeKey) => {
    setRange(rk)
    if (rk === 'custom') return
    const days = rk === '7d' ? 7 : rk === '30d' ? 30 : 90
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - days)
    setFrom(start.toISOString().slice(0, 10))
    setTo(end.toISOString().slice(0, 10))
  }

  // Agrupación por día (YYYY-MM-DD)
  const byDay = useMemo(() => {
    const map: Record<string, { date: string; total: number; tickets: number }> = {}
    for (const v of data) {
      const d = v.created_at.slice(0, 10)
      if (!map[d]) map[d] = { date: d, total: 0, tickets: 0 }
      map[d].total += Number(v.total)
      map[d].tickets += 1
    }
    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date))
  }, [data])

  // KPIs y por método
  const totalVentas = useMemo(() => data.reduce((s, v) => s + Number(v.total), 0), [data])
  const tickets = data.length
  const ticketProm = tickets ? totalVentas / tickets : 0

  const porMetodo = useMemo(() => {
    const m: Record<string, number> = {}
    data.forEach(v => { m[v.payment_method] = (m[v.payment_method] ?? 0) + Number(v.total) })
    return m
  }, [data])

  const pmData = useMemo(() => Object.entries(porMetodo).map(([name, value]) => ({ name, value })), [porMetodo])

  const currencyTick = (n: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n)

  // Colores suaves para pie
  const PIE_COLORS = [
    'hsl(250 95% 82%)', // card/pastel
    'hsl(190 90% 75%)',
    'hsl(140 70% 78%)',
    'hsl(30 90% 80%)',
    'hsl(0 80% 78%)',
  ]

  return (
    <div className={`${styles.page} fade-in-up`}>
      {/* ===== Filtros ===== */}
      <div className="card">
        <div className="card-header"><h2 className="font-semibold">Filtros</h2></div>
        <div className={`card-content ${styles.filters}`}>
          <CalendarRange size={16} className="text-dim" />
          <label>De</label>
          <Input type="date" value={from} onChange={e => { setFrom(e.target.value); setRange('custom') }} className="max-w-xs" />
          <label>A</label>
          <Input type="date" value={to} onChange={e => { setTo(e.target.value); setRange('custom') }} className="max-w-xs" />

          <div className={styles.rangeChips}>
            <button className={`${styles.chip} ${range==='7d' ? styles.chipActive : ''}`} onClick={() => setQuickRange('7d')}>7 días</button>
            <button className={`${styles.chip} ${range==='30d' ? styles.chipActive : ''}`} onClick={() => setQuickRange('30d')}>30 días</button>
            <button className={`${styles.chip} ${range==='90d' ? styles.chipActive : ''}`} onClick={() => setQuickRange('90d')}>90 días</button>
          </div>
        </div>
      </div>

      {/* ===== KPIs ===== */}
      <div className={styles.kpis}>
        <div className="card">
          <div className="card-content">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-dim" />
              <div className={styles.kpiHead}>Ventas totales</div>
            </div>
            <div className={styles.kpiValue}>{formatMoney(totalVentas)}</div>
          </div>
        </div>
        <div className="card">
          <div className="card-content">
            <div className="flex items-center gap-2">
              <Receipt size={16} className="text-dim" />
              <div className={styles.kpiHead}>Tickets</div>
            </div>
            <div className={styles.kpiValue}>{tickets}</div>
          </div>
        </div>
        <div className="card">
          <div className="card-content">
            <div className="flex items-center gap-2">
              <ShoppingCart size={16} className="text-dim" />
              <div className={styles.kpiHead}>Ticket promedio</div>
            </div>
            <div className={styles.kpiValue}>{formatMoney(ticketProm)}</div>
          </div>
        </div>
      </div>

      {/* ===== Gráficas ===== */}
      <div className={styles.chartGrid}>
        {/* Ventas por día (Barras + línea de tickets) */}
        <div className="card">
          <div className="card-header"><h3 className="font-semibold">Ventas por día</h3></div>
          <div className="card-content">
            {byDay.length === 0 ? (
              <div className={styles.empty}>Sin datos para el rango seleccionado</div>
            ) : (
              <div className={styles.chartWrap}>
                <ResponsiveContainer>
                  <BarChart data={byDay}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="date" tickMargin={8} />
                    <YAxis tickFormatter={currencyTick} width={80} />
                    <Tooltip
                      formatter={(value: any, name) =>
                        name === 'total' ? formatMoney(Number(value)) : value
                      }
                      labelFormatter={l => `Día: ${l}`}
                    />
                    <Legend />
                    <Bar dataKey="total" name="Total" />
                    <Line type="monotone" dataKey="tickets" name="Tickets" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Ventas por método de pago (Pie) */}
        <div className="card">
          <div className="card-header"><h3 className="font-semibold">Métodos de pago</h3></div>
          <div className="card-content">
            {pmData.length === 0 ? (
              <div className={styles.empty}>Sin datos para el rango seleccionado</div>
            ) : (
              <>
                <div className={styles.chartWrap} style={{ height: 260 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={pmData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={60}
                        outerRadius={90}
                      >
                        {pmData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: any) => formatMoney(Number(v))} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className={styles.pmLegend}>
                  {pmData.map((d, i) => (
                    <div key={d.name} className={styles.pmItem}>
                      <span className="inline-flex items-center gap-2">
                        <span
                          aria-hidden
                          style={{
                            display: 'inline-block',
                            width: 10,
                            height: 10,
                            borderRadius: 9999,
                            background: PIE_COLORS[i % PIE_COLORS.length]
                          }}
                        />
                        {d.name}
                      </span>
                      <b>{formatMoney(d.value)}</b>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
