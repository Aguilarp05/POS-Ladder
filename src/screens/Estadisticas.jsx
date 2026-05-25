import { useState, useMemo } from 'react'
import { getPedidos, getPedidosPorTurno } from '../data/store'
import FAB from '../components/FAB'
import styles from './Estadisticas.module.css'

const PERIODOS = [
  { key: 'dia',    label: 'Hoy'    },
  { key: 'semana', label: 'Semana' },
  { key: 'mes',    label: 'Mes'    },
  { key: 'anio',   label: 'Año'    },
  { key: 'todo',   label: 'Total'  },
]

const TURNOS = [
  { key: 'ambos',    label: 'Ambos turnos' },
  { key: 'Apertura', label: 'Apertura'     },
  { key: 'Cierre',   label: 'Cierre'       },
]

function getInicioPeriodo(periodo) {
  const ahora = new Date()
  switch (periodo) {
    case 'dia':
      return new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate())
    case 'semana': {
      const d = new Date(ahora)
      d.setDate(d.getDate() - d.getDay())
      d.setHours(0, 0, 0, 0)
      return d
    }
    case 'mes':
      return new Date(ahora.getFullYear(), ahora.getMonth(), 1)
    case 'anio':
      return new Date(ahora.getFullYear(), 0, 1)
    case 'todo':
      return new Date(0)
    default:
      return new Date(0)
  }
}

function esTurno(fecha, turno) {
  const hora = new Date(fecha).getHours()
  const minutos = new Date(fecha).getMinutes()
  const totalMinutos = hora * 60 + minutos
  if (turno === 'Apertura') return totalMinutos >= 660 && totalMinutos < 1110
  if (turno === 'Cierre') return totalMinutos >= 1110 || totalMinutos < 150
  return true
}

export default function Estadisticas({ onNavigate }) {
  const [periodo, setPeriodo] = useState('dia')
  const [turno, setTurno] = useState('ambos')

  const todosPedidos = getPedidos()

  const pedidos = useMemo(() => {
    const inicio = getInicioPeriodo(periodo)
    return todosPedidos.filter(p => {
      if (new Date(p.fecha) < inicio) return false
      if (turno !== 'ambos') return esTurno(p.fecha, turno)
      return true
    })
  }, [periodo, turno, todosPedidos.length])

  const totalVendido = pedidos.reduce((s, p) => s + p.total, 0)
  const numPedidos = pedidos.length
  const promedio = numPedidos > 0 ? totalVendido / numPedidos : 0

  // Top productos
  const productosMap = {}
  pedidos.forEach(p => {
    p.orden.forEach(o => {
      const key = o.producto.nombre
      if (!productosMap[key]) productosMap[key] = { nombre: key, cantidad: 0, total: 0 }
      productosMap[key].cantidad += o.qty
      productosMap[key].total += o.subtotal
    })
  })
  const topProductos = Object.values(productosMap).sort((a, b) => b.cantidad - a.cantidad)

  // Top extras
  const extrasMap = {}
  pedidos.forEach(p => {
    p.orden.forEach(o => {
      o.extrasDetalle?.forEach(e => {
        if (!extrasMap[e.nombre]) extrasMap[e.nombre] = { nombre: e.nombre, cantidad: 0 }
        extrasMap[e.nombre].cantidad += e.qty
      })
    })
  })
  const topExtras = Object.values(extrasMap).sort((a, b) => b.cantidad - a.cantidad)

  // Ventas por método de pago
  const metodosMap = {}
  pedidos.forEach(p => {
    const m = p.metodoPago || 'Sin metodo'
    if (!metodosMap[m]) metodosMap[m] = { nombre: m, total: 0, cantidad: 0 }
    metodosMap[m].total += p.total
    metodosMap[m].cantidad += 1
  })
  const metodos = Object.values(metodosMap).sort((a, b) => b.total - a.total)

  // Ventas por hora
  const horasMap = {}
  for (let i = 0; i < 24; i++) horasMap[i] = 0
  pedidos.forEach(p => {
    const hora = new Date(p.fecha).getHours()
    horasMap[hora] += p.total
  })
  const maxHora = Math.max(...Object.values(horasMap), 1)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Estadisticas</h1>
      </div>

      <div className={styles.periodos}>
        {PERIODOS.map(p => (
          <button
            key={p.key}
            className={`${styles.periodoBtn} ${periodo === p.key ? styles.periodoActive : ''}`}
            onClick={() => setPeriodo(p.key)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className={styles.periodos}>
        {TURNOS.map(t => (
          <button
            key={t.key}
            className={`${styles.periodoBtn} ${turno === t.key ? styles.periodoActive : ''}`}
            onClick={() => setTurno(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {pedidos.length === 0 ? (
        <p className={styles.empty}>No hay pedidos en este periodo</p>
      ) : (
        <>
          <div className={styles.tarjetas}>
            <div className={styles.tarjeta}>
              <p className={styles.tarjetaLabel}>Total vendido</p>
              <p className={styles.tarjetaVal}>${totalVendido.toFixed(2)}</p>
            </div>
            <div className={styles.tarjeta}>
              <p className={styles.tarjetaLabel}>Pedidos</p>
              <p className={styles.tarjetaVal}>{numPedidos}</p>
            </div>
            <div className={styles.tarjeta}>
              <p className={styles.tarjetaLabel}>Promedio por pedido</p>
              <p className={styles.tarjetaVal}>${promedio.toFixed(2)}</p>
            </div>
          </div>

          <div className={styles.grid}>
            <div className={styles.card}>
              <p className={styles.cardTitle}>Productos mas vendidos</p>
              {topProductos.length === 0
                ? <p className={styles.cardEmpty}>Sin datos</p>
                : topProductos.map(p => (
                  <div key={p.nombre} className={styles.rankRow}>
                    <span className={styles.rankNombre}>{p.nombre}</span>
                    <span className={styles.rankCantidad}>{p.cantidad}x</span>
                    <span className={styles.rankTotal}>${p.total.toFixed(2)}</span>
                  </div>
                ))
              }
            </div>

            <div className={styles.card}>
              <p className={styles.cardTitle}>Extras mas pedidos</p>
              {topExtras.length === 0
                ? <p className={styles.cardEmpty}>Sin extras en este periodo</p>
                : topExtras.map(e => (
                  <div key={e.nombre} className={styles.rankRow}>
                    <span className={styles.rankNombre}>{e.nombre}</span>
                    <span className={styles.rankCantidad}>{e.cantidad}x</span>
                  </div>
                ))
              }
            </div>

            <div className={styles.card}>
              <p className={styles.cardTitle}>Por metodo de pago</p>
              {metodos.map(m => (
                <div key={m.nombre} className={styles.rankRow}>
                  <span className={styles.rankNombre}>{m.nombre}</span>
                  <span className={styles.rankCantidad}>{m.cantidad}x</span>
                  <span className={styles.rankTotal}>${m.total.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className={styles.card}>
              <p className={styles.cardTitle}>Ventas por hora</p>
              <div className={styles.grafica}>
                {Object.entries(horasMap).map(([hora, total]) => (
                  total > 0 && (
                    <div key={hora} className={styles.barraCol}>
                      <span className={styles.barraMonto}>${Math.round(total)}</span>
                      <div className={styles.barraWrapper}>
                        <div
                          className={styles.barra}
                          style={{ height: `${(total / maxHora) * 100}%` }}
                        />
                      </div>
                      <span className={styles.barraHora}>{hora}h</span>
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      <FAB
        pantallaActual="estadisticas"
        onNavigate={onNavigate}
      />
    </div>
  )
}