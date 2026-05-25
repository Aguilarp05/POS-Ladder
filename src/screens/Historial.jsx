import { useState } from 'react'
import { getPedidos, getPedidosPorTurno, getMetodosPago } from '../data/store'
import FAB from '../components/FAB'
import styles from './Historial.module.css'

export default function Historial({ onVolver, onNavigate }) {
  const hoy = new Date().toISOString().split('T')[0]
  const [fechaSeleccionada, setFechaSeleccionada] = useState(hoy)
  const [vistaMode, setVistaMode] = useState('dia')
  const [filtroMetodo, setFiltroMetodo] = useState('todos')

  const metodosPago = getMetodosPago()

  const pedidosFecha = vistaMode === 'dia'
    ? getPedidos().filter(p => new Date(p.fecha).toISOString().split('T')[0] === fechaSeleccionada).reverse()
    : getPedidosPorTurno(fechaSeleccionada, vistaMode === 'apertura' ? 'Apertura' : 'Cierre').reverse()

  const pedidosFiltrados = pedidosFecha.filter(p => {
    if (filtroMetodo === 'todos') return true
    return p.metodoPago?.toLowerCase().includes(filtroMetodo.toLowerCase())
  })

  const totalFecha = pedidosFiltrados.reduce((s, p) => s + p.total, 0)

  function formatHora(fechaISO) {
    return new Date(fechaISO).toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function formatFecha(fechaISO) {
    return new Date(fechaISO + 'T12:00:00').toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  function cambiarDia(delta) {
    const d = new Date(fechaSeleccionada + 'T12:00:00')
    d.setDate(d.getDate() + delta)
    setFechaSeleccionada(d.toISOString().split('T')[0])
  }

  return (
    <div className={styles.historial}>
      <div className={styles.header}>
        <h1 className={styles.title}>Historial</h1>
        <button className={styles.volverBtn} onClick={onVolver}>← Volver a caja</button>
      </div>

      <div className={styles.fechaRow}>
        <button className={styles.fechaBtn} onClick={() => cambiarDia(-1)}>←</button>
        <div className={styles.fechaCentro}>
          <span className={styles.fechaLabel}>{formatFecha(fechaSeleccionada)}</span>
          <input
            className={styles.fechaInput}
            type="date"
            value={fechaSeleccionada}
            max={hoy}
            onChange={e => setFechaSeleccionada(e.target.value)}
          />
        </div>
        <button
          className={styles.fechaBtn}
          disabled={fechaSeleccionada === hoy}
          onClick={() => cambiarDia(1)}
        >
          →
        </button>
      </div>

      <div className={styles.vistaSelector}>
        {[
          { key: 'dia',      label: 'Dia completo' },
          { key: 'apertura', label: 'Apertura'     },
          { key: 'cierre',   label: 'Cierre'       },
        ].map(v => (
          <button
            key={v.key}
            className={`${styles.vistaBtn} ${vistaMode === v.key ? styles.vistaBtnActive : ''}`}
            onClick={() => setVistaMode(v.key)}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div className={styles.filtroMetodos}>
        <button
          className={`${styles.filtroBtn} ${filtroMetodo === 'todos' ? styles.filtroBtnActive : ''}`}
          onClick={() => setFiltroMetodo('todos')}
        >
          Todos
        </button>
        {metodosPago.map(m => (
          <button
            key={m.id}
            className={`${styles.filtroBtn} ${filtroMetodo === m.nombre ? styles.filtroBtnActive : ''}`}
            onClick={() => setFiltroMetodo(m.nombre)}
          >
            {m.nombre}
          </button>
        ))}
      </div>

      <div className={styles.resumen}>
        <div className={styles.resumenCard}>
          <p className={styles.resumenLabel}>Pedidos</p>
          <p className={styles.resumenVal}>{pedidosFiltrados.length}</p>
        </div>
        <div className={styles.resumenCard}>
          <p className={styles.resumenLabel}>Total</p>
          <p className={styles.resumenVal}>${totalFecha.toFixed(2)}</p>
        </div>
      </div>

      <div className={styles.lista}>
        {pedidosFiltrados.length === 0 ? (
          <p className={styles.empty}>No hay pedidos en este periodo</p>
        ) : (
          pedidosFiltrados.map(p => (
            <div key={p.id} className={styles.pedido}>
              <div className={styles.pedidoHeader}>
                <span className={styles.pedidoHora}>{formatHora(p.fecha)}</span>
                <span className={styles.pedidoMetodo}>{p.metodoPago}</span>
                <span className={styles.pedidoTotal}>${p.total.toFixed(2)}</span>
              </div>
              <div className={styles.pedidoItems}>
                {p.orden.map(o => (
                  <span key={o.uid} className={styles.pedidoItem}>
                    {o.qty}x {o.producto.nombre}
                    {o.extrasDetalle?.length > 0 && ` (+ ${o.extrasDetalle.map(e => `${e.qty}x ${e.nombre}`).join(', ')})`}
                    {o.nota && ` — ${o.nota}`}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <FAB
        pantallaActual="historial"
        onNavigate={onNavigate}
      />
    </div>
  )
}