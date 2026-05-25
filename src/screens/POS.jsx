import React, { useState, useEffect } from 'react'
import { getCategorias, getProductos, getExtras, guardarPedido, getMetodosPago, descontarInventario, getIngredientesBajos, getJornadaActual, getTurnoActual } from '../data/store'
import AlertaStock from '../components/AlertaStock'
import FAB from '../components/FAB'
import styles from './POS.module.css'

let uidCounter = 0

export default function POS({ onIrAdmin, onNavigate }) {
  const [categorias, setCategorias] = useState([])
  const [productos, setProductos] = useState([])
  const [extras, setExtras] = useState([])
  const [metodosPago, setMetodosPago] = useState([])
  const [cat, setCat] = useState(null)
  const [pendingItem, setPendingItem] = useState(null)
  const [selectedExtras, setSelectedExtras] = useState({})
  const [nota, setNota] = useState('')
  const [order, setOrder] = useState([])
  const [showPayment, setShowPayment] = useState(false)
  const [pagos, setPagos] = useState([])
  const [pagoMetodo, setPagoMetodo] = useState('')
  const [pagoMonto, setPagoMonto] = useState('')
  const [stepPago, setStepPago] = useState('method')
  const [alertaStock, setAlertaStock] = useState([])
  const [jornada, setJornada] = useState(getJornadaActual())
  const [esEmpleado, setEsEmpleado] = useState(false)
  const [comidaEmpleado, setComidaEmpleado] = useState(false)

  useEffect(() => {
    const cats = getCategorias()
    const prods = getProductos()
    const exts = getExtras()
    const metodos = getMetodosPago().filter(m => m.activo)
    setCategorias(cats)
    setProductos(prods)
    setExtras(exts)
    setMetodosPago(metodos)
    if (cats.length > 0) setCat(cats[0].id)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setJornada(getJornadaActual())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  const productosCat = productos.filter(p => p.categoriaId === cat)
  const extrasCat = extras.filter(e => e.categoriaId === cat)

  const extrasPrecioPreview = Object.entries(selectedExtras).reduce((s, [id, qty]) => {
    const extra = extras.find(e => e.id === id)
    return s + (extra ? extra.precio * qty : 0)
  }, 0)

  // Calcula el precio de un producto según el modo empleado
  function getPrecioProducto(producto) {
    if (comidaEmpleado) return 0
    if (esEmpleado && producto.precioEmpleado != null) return producto.precioEmpleado
    return producto.precio
  }

  const total = comidaEmpleado ? 0 : order.reduce((s, o) => s + o.subtotal, 0)
  const totalQty = order.reduce((s, o) => s + o.qty, 0)

  const totalPagado = pagos.reduce((s, p) => s + p.monto, 0)
  const faltante = total - totalPagado
  const pagoCubierto = totalPagado >= total
  const efectivoPagado = pagos.filter(p => p.metodo === 'Efectivo').reduce((s, p) => s + p.monto, 0)
  const cambio = efectivoPagado > 0 ? Math.max(0, totalPagado - total) : 0

  function handleSelectItem(producto) {
    if (extrasCat.length > 0) {
      setPendingItem(producto)
      setSelectedExtras({})
      setNota('')
    } else {
      addToOrder(producto, {}, '')
    }
  }

  function handleChangeExtraCantidad(extraId, delta) {
    setSelectedExtras(prev => {
      const actual = prev[extraId] || 0
      const nueva = actual + delta
      if (nueva <= 0) {
        const { [extraId]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [extraId]: nueva }
    })
  }

  function handleConfirmExtras() {
    addToOrder(pendingItem, selectedExtras, nota)
    setPendingItem(null)
    setSelectedExtras({})
    setNota('')
  }

  function addToOrder(producto, extrasSeleccionados, nota) {
    const extrasDetalle = Object.entries(extrasSeleccionados).map(([id, qty]) => {
      const extra = extras.find(e => e.id === id)
      return { id, nombre: extra.nombre, precio: extra.precio, qty }
    })
    const precioBase = getPrecioProducto(producto)
    const subtotal = precioBase + extrasDetalle.reduce((s, e) => s + e.precio * e.qty, 0)

    setOrder(prev => {
      const existente = prev.find(o =>
        o.producto.id === producto.id &&
        JSON.stringify(o.extrasDetalle) === JSON.stringify(extrasDetalle) &&
        o.nota === nota
      )
      if (existente) {
        return prev.map(o => o.uid === existente.uid
          ? { ...o, qty: o.qty + 1, subtotal: o.subtotal + subtotal }
          : o
        )
      }
      return [...prev, { uid: uidCounter++, producto, extrasDetalle, nota, qty: 1, subtotal }]
    })
  }

  function handleChangeQty(uid, delta) {
    setOrder(prev =>
      prev.map(o => {
        if (o.uid !== uid) return o
        const nuevaQty = o.qty + delta
        if (nuevaQty <= 0) return null
        const precioUnitario = o.subtotal / o.qty
        return { ...o, qty: nuevaQty, subtotal: precioUnitario * nuevaQty }
      }).filter(Boolean)
    )
  }

  function handleRemove(uid) {
    setOrder(prev => prev.filter(o => o.uid !== uid))
  }

  function handleClear() {
    setOrder([])
    setPendingItem(null)
    setSelectedExtras({})
    setNota('')
    setEsEmpleado(false)
    setComidaEmpleado(false)
  }

  function handleAgregarPago() {
    if (!pagoMetodo || !pagoMonto || parseFloat(pagoMonto) <= 0) return
    const monto = parseFloat(pagoMonto)
    const nuevoFaltante = faltante - monto
    setPagos(prev => [...prev, { metodo: pagoMetodo, monto }])
    setPagoMonto(nuevoFaltante > 0 ? nuevoFaltante.toFixed(2) : '')
    setPagoMetodo('')
  }

  function handleRemovePago(idx) {
    setPagos(prev => prev.filter((_, i) => i !== idx))
  }

  function handleConfirmPago() {
    const metodosUsados = comidaEmpleado
      ? 'Comida empleado'
      : pagos.map(p => p.metodo).join(' + ')
    descontarInventario(order)
    guardarPedido(order, total, metodosUsados)
    const bajos = getIngredientesBajos()
    if (bajos.length > 0) setAlertaStock(bajos)
    handleClear()
    setShowPayment(false)
    setStepPago('method')
    setPagos([])
    setPagoMetodo('')
    setPagoMonto('')
  }

  function handleOpenPayment() {
    setPagos([])
    setPagoMetodo('')
    setPagoMonto(total > 0 ? total.toFixed(2) : '')
    setShowPayment(true)
  }

  function handleClosePayment() {
    setShowPayment(false)
    setStepPago('method')
    setPagos([])
    setPagoMetodo('')
    setPagoMonto('')
  }

  if (categorias.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No hay categorias ni productos aun.</p>
        <button className={styles.adminBtn} onClick={onIrAdmin}>Ir a Admin</button>
        <FAB
          pantallaActual="caja"
          onNavigate={onNavigate}
          onJornadaChange={() => setJornada(getJornadaActual())}
        />
      </div>
    )
  }

  if (!jornada) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyTitle}>Jornada no iniciada</p>
        <p className={styles.emptySubtitle}>
          Turno actual: {getTurnoActual() || 'Fuera de horario'}
        </p>
        <p className={styles.emptyHint}>Abre el menu para iniciar la jornada</p>
        <FAB
          pantallaActual="caja"
          onNavigate={onNavigate}
          onJornadaChange={() => setJornada(getJornadaActual())}
        />
      </div>
    )
  }

  return (
    <div className={styles.pos}>
      <div className={styles.left}>
        <div className={styles.cats}>
          <div className={styles.turnoIndicador}>
            <span className={styles.turnoBadge}>{jornada?.turno}</span>
          </div>
          <div className={styles.catsRow}>
            {categorias.map(c => (
              <button
                key={c.id}
                className={`${styles.catBtn} ${cat === c.id ? styles.catActive : ''}`}
                onClick={() => { setCat(c.id); setPendingItem(null); setSelectedExtras({}); setNota('') }}
              >
                {c.nombre}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.menuArea}>
          <div className={styles.grid}>
            {productosCat.map(p => (
              <button
                key={p.id}
                className={`${styles.card} ${pendingItem?.id === p.id ? styles.cardPending : ''}`}
                onClick={() => handleSelectItem(p)}
              >
                <span className={styles.cardName}>{p.nombre}</span>
                <span className={styles.cardPrice}>
                  ${getPrecioProducto(p)}
                  {esEmpleado && !comidaEmpleado && p.precioEmpleado != null && (
                    <span className={styles.precioEmpTag}> emp</span>
                  )}
                </span>
              </button>
            ))}
          </div>

          {pendingItem && extrasCat.length > 0 && (
            <div className={styles.extrasPanel}>
              <p className={styles.extrasTitle}>EXTRAS — {pendingItem.nombre}</p>
              <div className={styles.extrasList}>
                {extrasCat.map(e => {
                  const qty = selectedExtras[e.id] || 0
                  return (
                    <div key={e.id} className={styles.extraRow}>
                      <span className={styles.extraNombre}>{e.nombre}</span>
                      <span className={styles.extraPrecio}>${e.precio}</span>
                      <div className={styles.extraQtyCtrl}>
                        <button className={styles.extraQtyBtn} onClick={() => handleChangeExtraCantidad(e.id, -1)}>-</button>
                        <span className={styles.extraQtyNum}>{qty}</span>
                        <button className={styles.extraQtyBtn} onClick={() => handleChangeExtraCantidad(e.id, 1)}>+</button>
                      </div>
                    </div>
                  )
                })}
              </div>
              <input
                className={styles.notaInput}
                placeholder="Nota (opcional) — pan dorado, sin cebolla..."
                value={nota}
                onChange={e => setNota(e.target.value)}
              />
              <button className={styles.agregarBtn} onClick={handleConfirmExtras}>Agregar</button>
            </div>
          )}
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.orderHeader}>
          <div>
            <p className={styles.orderTitle}>Orden</p>
            <p className={styles.orderSubtitle}>{totalQty} {totalQty === 1 ? 'producto' : 'productos'}</p>
          </div>
          <button className={styles.clearBtn} onClick={handleClear}>Limpiar</button>
        </div>
        <div className={styles.orderItems}>
          {pendingItem && (
            <div className={styles.orderRowPreview}>
              <div className={styles.orderRowMain}>
                <span className={styles.rowName}>{pendingItem.nombre}</span>
                <span className={styles.rowPrice}>
                  ${comidaEmpleado ? 0 : getPrecioProducto(pendingItem) + extrasPrecioPreview}
                </span>
              </div>
              {Object.entries(selectedExtras).length > 0 && (
                <p className={styles.orderRowExtras}>
                  + {Object.entries(selectedExtras).map(([id, qty]) => {
                    const extra = extras.find(e => e.id === id)
                    return `${qty}x ${extra?.nombre}`
                  }).join(', ')}
                </p>
              )}
              {nota && <p className={styles.orderRowExtras}>{nota}</p>}
            </div>
          )}

          {order.length === 0 && !pendingItem ? (
            <p className={styles.orderEmpty}>Sin productos aun</p>
          ) : (
            order.map(row => (
              <div key={row.uid} className={styles.orderRow}>
                <div className={styles.orderRowMain}>
                  <span className={styles.orderRowName}>{row.producto.nombre}</span>
                  <div className={styles.qtyCtrl}>
                    <button className={styles.qtyBtn} onClick={() => handleChangeQty(row.uid, -1)}>-</button>
                    <span className={styles.qtyNum}>{row.qty}</span>
                    <button className={styles.qtyBtn} onClick={() => handleChangeQty(row.uid, 1)}>+</button>
                  </div>
                  <span className={styles.orderRowPrice}>
                    ${comidaEmpleado ? '0.00' : row.subtotal.toFixed(2)}
                  </span>
                  <button className={styles.delBtn} onClick={() => handleRemove(row.uid)}>x</button>
                </div>
                {row.extrasDetalle.length > 0 && (
                  <p className={styles.orderRowExtras}>
                    + {row.extrasDetalle.map(e => `${e.qty}x ${e.nombre}`).join(', ')}
                  </p>
                )}
                {row.nota && <p className={styles.orderRowExtras}>{row.nota}</p>}
              </div>
            ))
          )}
        </div>
        <div className={styles.orderFooter}>
          {/* Toggles de empleado */}
          <div className={styles.empleadoToggleRow}>
            <label className={styles.empleadoToggle}>
              <input
                type="checkbox"
                checked={esEmpleado}
                onChange={e => {
                  setEsEmpleado(e.target.checked)
                  if (!e.target.checked) setComidaEmpleado(false)
                }}
              />
              <span>Precio empleado</span>
            </label>
            {esEmpleado && (
              <label className={styles.empleadoToggle}>
                <input
                  type="checkbox"
                  checked={comidaEmpleado}
                  onChange={e => setComidaEmpleado(e.target.checked)}
                />
                <span>Comida gratis</span>
              </label>
            )}
          </div>
          <div className={styles.totalRow}>
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <button
            className={styles.cobrarBtn}
            onClick={comidaEmpleado ? handleConfirmPago : handleOpenPayment}
            disabled={order.length === 0}
          >
            {comidaEmpleado ? 'Registrar' : 'Cobrar'}
          </button>
        </div>
      </div>

      {showPayment && (
        <div className={styles.overlay} onClick={handleClosePayment}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            {stepPago === 'method' && (
              <>
                <p className={styles.modalTitle}>Cobro</p>
                <p className={styles.modalTotal}>${total.toFixed(2)}</p>

                {pagos.length > 0 && (
                  <div className={styles.pagosLista}>
                    {pagos.map((p, idx) => (
                      <div key={idx} className={styles.pagoRow}>
                        <span className={styles.pagoMetodo}>{p.metodo}</span>
                        <span className={styles.pagoMonto}>${p.monto.toFixed(2)}</span>
                        <button className={styles.pagoRemove} onClick={() => handleRemovePago(idx)}>x</button>
                      </div>
                    ))}
                    <div className={styles.pagoResumen}>
                      {pagoCubierto ? (
                        cambio > 0 && (
                          <div className={styles.cambioRow}>
                            <span>Cambio</span>
                            <span className={styles.cambioVal}>${cambio.toFixed(2)}</span>
                          </div>
                        )
                      ) : (
                        <div className={styles.faltanteRow}>
                          <span>Falta</span>
                          <span className={styles.faltanteVal}>${faltante.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {!pagoCubierto && (
                  <div className={styles.agregarPagoRow}>
                    <select
                      className={styles.pagoSelect}
                      value={pagoMetodo}
                      onChange={e => setPagoMetodo(e.target.value)}
                    >
                      <option value="">Metodo</option>
                      {metodosPago.map(m => (
                        <option key={m.id} value={m.nombre}>{m.nombre}</option>
                      ))}
                    </select>
                    <input
                      className={styles.pagoInput}
                      type="number"
                      value={pagoMonto}
                      onChange={e => setPagoMonto(e.target.value)}
                      placeholder="0.00"
                    />
                    <button className={styles.pagoAddBtn} onClick={handleAgregarPago}>+</button>
                  </div>
                )}

                {pagoCubierto && (
                  <button className={styles.confirmBtn} onClick={handleConfirmPago}>
                    Confirmar cobro
                  </button>
                )}
                <button className={styles.cancelBtn} onClick={handleClosePayment}>Cancelar</button>
              </>
            )}
          </div>
        </div>
      )}

      {alertaStock.length > 0 && (
        <AlertaStock
          ingredientes={alertaStock}
          titulo="Ingredientes bajos tras la venta"
          onClose={() => setAlertaStock([])}
        />
      )}

      {pendingItem === null && (
        <FAB
          pantallaActual="caja"
          onNavigate={onNavigate}
          onJornadaChange={() => setJornada(getJornadaActual())}
        />
      )}
    </div>
  )
}