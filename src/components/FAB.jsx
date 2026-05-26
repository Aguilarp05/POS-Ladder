import { useState, useEffect } from 'react'
import { getIngredientesBajos, getJornadaActual, getTurnoActual, abrirJornada, cerrarJornada, registrarGasto } from '../data/store'
import styles from './FAB.module.css'

export default function FAB({ pantallaActual, onNavigate, onJornadaChange, modoAdmin, onDesactivarAdmin }) {
  const [abierto, setAbierto] = useState(false)
  const [bajos, setBajos] = useState(0)
  const [jornada, setJornada] = useState(null)
  const [confirmando, setConfirmando] = useState(null) // 'abrir' | 'cerrar' | 'gasto'
  const [fondoInput, setFondoInput] = useState('')
  const [gastoConcepto, setGastoConcepto] = useState('')
  const [gastoMonto, setGastoMonto] = useState('')

  useEffect(() => {
    setBajos(getIngredientesBajos().length)
    setJornada(getJornadaActual())
  }, [])

  const opciones = [
    { key: 'caja',         label: 'Caja'                              },
    ...(modoAdmin ? [{ key: 'historial', label: 'Historial' }] : []),
    { key: 'estadisticas', label: 'Estadísticas'                      },
    { key: 'admin',        label: modoAdmin ? 'Panel Admin' : 'Admin' },
  ]

  function handleClick(key) {
    setAbierto(false)
    onNavigate(key)
  }

  function handleAbrirJornada() {
    abrirJornada(fondoInput)
    setFondoInput('')
    setJornada(getJornadaActual())
    setConfirmando(null)
    setAbierto(false)
    onJornadaChange?.()
  }

  function handleRegistrarGasto() {
    if (!gastoConcepto.trim() || !gastoMonto || parseFloat(gastoMonto) <= 0) return
    registrarGasto(gastoConcepto, gastoMonto)
    setGastoConcepto('')
    setGastoMonto('')
    setConfirmando(null)
    setAbierto(false)
  }

  function handleCerrarJornada() {
    cerrarJornada()
    setJornada(null)
    setConfirmando(null)
    setAbierto(false)
    onJornadaChange?.()
  }

  return (
    <div className={styles.wrapper}>
      {abierto && (
        <>
          <div className={styles.backdrop} onClick={() => { setAbierto(false); setConfirmando(null) }} />
          <div className={styles.opciones}>
            {confirmando === 'abrir' && (
              <div className={styles.confirmar}>
                <p className={styles.confirmarText}>Abrir jornada de {getTurnoActual()}</p>
                <input
                  className={styles.fondoInput}
                  type="number"
                  placeholder="Fondo inicial $0.00"
                  value={fondoInput}
                  onChange={e => setFondoInput(e.target.value)}
                  autoFocus
                />
                <div className={styles.confirmarBtns}>
                  <button className={styles.confirmarSi} onClick={handleAbrirJornada}>Abrir</button>
                  <button className={styles.confirmarNo} onClick={() => { setConfirmando(null); setFondoInput('') }}>Cancelar</button>
                </div>
              </div>
            )}
            {confirmando === 'cerrar' && (
              <div className={styles.confirmar}>
                <p className={styles.confirmarText}>¿Cerrar jornada de {jornada?.turno}?</p>
                <div className={styles.confirmarBtns}>
                  <button className={styles.confirmarSi} onClick={handleCerrarJornada}>Sí, cerrar</button>
                  <button className={styles.confirmarNo} onClick={() => setConfirmando(null)}>Cancelar</button>
                </div>
              </div>
            )}
            {confirmando === 'gasto' && (
              <div className={styles.confirmar}>
                <p className={styles.confirmarText}>Registrar gasto</p>
                <input
                  className={styles.fondoInput}
                  placeholder="Concepto"
                  value={gastoConcepto}
                  onChange={e => setGastoConcepto(e.target.value)}
                  autoFocus
                />
                <input
                  className={styles.fondoInput}
                  type="number"
                  placeholder="Monto $0.00"
                  value={gastoMonto}
                  onChange={e => setGastoMonto(e.target.value)}
                />
                <div className={styles.confirmarBtns}>
                  <button className={styles.confirmarSi} onClick={handleRegistrarGasto}>Registrar</button>
                  <button className={styles.confirmarNo} onClick={() => { setConfirmando(null); setGastoConcepto(''); setGastoMonto('') }}>Cancelar</button>
                </div>
              </div>
            )}
            {!confirmando && (
              <>
                {opciones.map(op => (
                  <button
                    key={op.key}
                    className={`${styles.opcion} ${pantallaActual === op.key ? styles.opcionActive : ''}`}
                    onClick={() => handleClick(op.key)}
                  >
                    {op.label}
                  </button>
                ))}
                {modoAdmin && (
                  <button
                    className={styles.desactivarAdminBtn}
                    onClick={() => { setAbierto(false); onDesactivarAdmin?.() }}
                  >
                    Desactivar Admin
                  </button>
                )}
                {jornada && (
                  <button className={styles.opcion} onClick={() => setConfirmando('gasto')}>
                    Registrar gasto
                  </button>
                )}
                {!jornada ? (
                  <button className={styles.jornadaBtn} onClick={() => setConfirmando('abrir')}>
                    Iniciar jornada
                  </button>
                ) : (
                  <button className={`${styles.jornadaBtn} ${styles.jornadaBtnCerrar}`} onClick={() => setConfirmando('cerrar')}>
                    Finalizar jornada
                  </button>
                )}
              </>
            )}
          </div>
        </>
      )}
      <div className={styles.fabWrapper}>
        <button
          className={`${styles.fab} ${abierto ? styles.fabAbierto : ''} ${modoAdmin ? styles.fabAdmin : ''}`}
          onClick={() => { setAbierto(!abierto); setConfirmando(null) }}
        >
          {abierto ? '✕' : '☰'}
        </button>
        {modoAdmin && <span className={styles.adminBadge}>A</span>}
        {bajos > 0 && (
          <span className={styles.badge}>{bajos}</span>
        )}
      </div>
    </div>
  )
}