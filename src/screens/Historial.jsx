import { useState, useEffect } from 'react'
import { getPedidos, getPedidosPorTurno, getMetodosPago, getGastosByFecha, getJornadas } from '../data/store'
import FAB from '../components/FAB'
import styles from './Historial.module.css'

export default function Historial({ onVolver, onNavigate, modoAdmin, onDesactivarAdmin }) {
  const hoy = new Date().toISOString().split('T')[0]
  const [fechaSeleccionada, setFechaSeleccionada] = useState(hoy)

  useEffect(() => {
    if (!modoAdmin) {
      setFechaSeleccionada(hoy)
      onVolver()
    }
  }, [modoAdmin])
  const [vistaMode, setVistaMode] = useState('dia')
  const [filtroMetodo, setFiltroMetodo] = useState('todos')

  const metodosPago = getMetodosPago()

  const pedidosFecha = vistaMode === 'dia' || vistaMode === 'flujo'
    ? getPedidos().filter(p => new Date(p.fecha).toISOString().split('T')[0] === fechaSeleccionada).reverse()
    : getPedidosPorTurno(fechaSeleccionada, vistaMode === 'apertura' ? 'Apertura' : 'Cierre').reverse()

  const pedidosFiltrados = pedidosFecha.filter(p => {
    if (filtroMetodo === 'todos') return true
    return p.metodoPago?.toLowerCase().includes(filtroMetodo.toLowerCase())
  })

  const totalFecha = pedidosFiltrados.reduce((s, p) => s + p.total, 0)

  // Datos para flujo de caja
  const jornadasDia = getJornadas().filter(j =>
    new Date(j.inicio).toISOString().split('T')[0] === fechaSeleccionada
  )
  const gastosDia = getGastosByFecha(fechaSeleccionada)
  const fondoTotal = jornadasDia.reduce((s, j) => s + (j.fondoInicial || 0), 0)

  const ventasPorMetodo = {}
  pedidosFecha.forEach(p => {
    const metodo = p.metodoPago || 'Sin método'
    if (!ventasPorMetodo[metodo]) ventasPorMetodo[metodo] = { total: 0, efectivo: 0 }
    ventasPorMetodo[metodo].total += p.total
    if (metodo === 'DiDi Efectivo') {
      ventasPorMetodo[metodo].efectivo += p.montoDidi || 0
    } else if (metodo.toLowerCase().includes('efectivo')) {
      ventasPorMetodo[metodo].efectivo += p.total
    }
  })

  const efectivoVentas = Object.values(ventasPorMetodo).reduce((s, m) => s + m.efectivo, 0)
  const totalGastos = gastosDia.reduce((s, g) => s + g.monto, 0)
  const efectivoEsperado = fondoTotal + efectivoVentas - totalGastos

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

  const vistas = [
    { key: 'dia',      label: 'Día completo' },
    { key: 'apertura', label: 'Apertura'     },
    { key: 'cierre',   label: 'Cierre'       },
    ...(modoAdmin ? [{ key: 'flujo', label: 'Flujo de caja' }] : []),
  ]

  return (
    <div className={styles.historial}>
      <div className={styles.header}>
        <h1 className={styles.title}>Historial</h1>
        <button className={styles.volverBtn} onClick={onVolver}>← Volver a caja</button>
      </div>

      <div className={styles.fechaRow}>
        {modoAdmin && (
          <button className={styles.fechaBtn} onClick={() => cambiarDia(-1)}>←</button>
        )}
        <div className={styles.fechaCentro}>
          <span className={styles.fechaLabel}>{formatFecha(fechaSeleccionada)}</span>
          {modoAdmin && (
            <input
              className={styles.fechaInput}
              type="date"
              value={fechaSeleccionada}
              max={hoy}
              onChange={e => setFechaSeleccionada(e.target.value)}
            />
          )}
        </div>
        {modoAdmin && (
          <button
            className={styles.fechaBtn}
            disabled={fechaSeleccionada === hoy}
            onClick={() => cambiarDia(1)}
          >
            →
          </button>
        )}
      </div>

      <div className={styles.vistaSelector}>
        {vistas.map(v => (
          <button
            key={v.key}
            className={`${styles.vistaBtn} ${vistaMode === v.key ? styles.vistaBtnActive : ''}`}
            onClick={() => setVistaMode(v.key)}
          >
            {v.label}
          </button>
        ))}
      </div>

      {vistaMode === 'flujo' ? (
        <div className={styles.flujo}>
          <div className={styles.flujoSeccion}>
            <p className={styles.flujoTitulo}>Fondo inicial</p>
            {jornadasDia.length === 0 ? (
              <p className={styles.flujoVacio}>Sin jornadas registradas</p>
            ) : (
              jornadasDia.map(j => (
                <div key={j.id} className={styles.flujoFila}>
                  <span className={styles.flujoLabel}>{j.turno}</span>
                  <span className={styles.flujoVal}>${(j.fondoInicial || 0).toFixed(2)}</span>
                </div>
              ))
            )}
            <div className={`${styles.flujoFila} ${styles.flujoSubtotal}`}>
              <span>Total fondo</span>
              <span>${fondoTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className={styles.flujoSeccion}>
            <p className={styles.flujoTitulo}>Ventas del día</p>
            {Object.entries(ventasPorMetodo).length === 0 ? (
              <p className={styles.flujoVacio}>Sin ventas</p>
            ) : (
              Object.entries(ventasPorMetodo).map(([metodo, datos]) => (
                <div key={metodo} className={styles.flujoFila}>
                  <span className={styles.flujoLabel}>{metodo}</span>
                  <div className={styles.flujoValGroup}>
                    <span className={styles.flujoVal}>${datos.total.toFixed(2)}</span>
                    {datos.efectivo > 0 && datos.efectivo !== datos.total && (
                      <span className={styles.flujoSub}>efectivo: ${datos.efectivo.toFixed(2)}</span>
                    )}
                  </div>
                </div>
              ))
            )}
            <div className={`${styles.flujoFila} ${styles.flujoSubtotal}`}>
              <span>Efectivo recibido</span>
              <span>${efectivoVentas.toFixed(2)}</span>
            </div>
          </div>

          <div className={styles.flujoSeccion}>
            <p className={styles.flujoTitulo}>Gastos</p>
            {gastosDia.length === 0 ? (
              <p className={styles.flujoVacio}>Sin gastos registrados</p>
            ) : (
              gastosDia.map(g => (
                <div key={g.id} className={styles.flujoFila}>
                  <span className={styles.flujoLabel}>{g.concepto}</span>
                  <span className={styles.flujoValNeg}>−${g.monto.toFixed(2)}</span>
                </div>
              ))
            )}
            {gastosDia.length > 0 && (
              <div className={`${styles.flujoFila} ${styles.flujoSubtotal}`}>
                <span>Total gastos</span>
                <span className={styles.flujoValNeg}>−${totalGastos.toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className={styles.flujoTotal}>
            <span>Efectivo esperado en caja</span>
            <span className={efectivoEsperado >= 0 ? styles.flujoTotalPos : styles.flujoTotalNeg}>
              ${efectivoEsperado.toFixed(2)}
            </span>
          </div>
        </div>
      ) : (
        <>
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
            <button
              className={`${styles.filtroBtn} ${filtroMetodo === 'DiDi Efectivo' ? styles.filtroBtnActive : ''}`}
              onClick={() => setFiltroMetodo('DiDi Efectivo')}
            >
              DiDi Efectivo
            </button>
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
                    <span className={styles.pedidoTotal}>
                      ${p.total.toFixed(2)}
                      {p.montoDidi !== undefined && (
                        <span className={styles.didiMonto}> · DiDi ${p.montoDidi.toFixed(2)}</span>
                      )}
                    </span>
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
        </>
      )}

      <FAB
        pantallaActual="historial"
        onNavigate={onNavigate}
        modoAdmin={modoAdmin}
        onDesactivarAdmin={onDesactivarAdmin}
      />
    </div>
  )
}
