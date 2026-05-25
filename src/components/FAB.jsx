import { useState, useEffect } from 'react'
import { getIngredientesBajos, getJornadaActual, getTurnoActual, abrirJornada, cerrarJornada } from '../data/store'
import styles from './FAB.module.css'

export default function FAB({ pantallaActual, onNavigate, onJornadaChange }) {
  const [abierto, setAbierto] = useState(false)
  const [bajos, setBajos] = useState(0)
  const [jornada, setJornada] = useState(null)
  const [confirmando, setConfirmando] = useState(null) // 'abrir' | 'cerrar'

  useEffect(() => {
    setBajos(getIngredientesBajos().length)
    setJornada(getJornadaActual())
  }, [])

  const opciones = [
    { key: 'caja',         label: 'Caja'         },
    { key: 'historial',    label: 'Historial'    },
    { key: 'estadisticas', label: 'Estadísticas' },
    { key: 'admin',        label: 'Admin'        },
  ]

  function handleClick(key) {
    setAbierto(false)
    onNavigate(key)
  }

  function handleAbrirJornada() {
    abrirJornada()
    setJornada(getJornadaActual())
    setConfirmando(null)
    setAbierto(false)
    onJornadaChange?.()
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
                <p className={styles.confirmarText}>¿Abrir jornada de {getTurnoActual()}?</p>
                <div className={styles.confirmarBtns}>
                  <button className={styles.confirmarSi} onClick={handleAbrirJornada}>Sí, abrir</button>
                  <button className={styles.confirmarNo} onClick={() => setConfirmando(null)}>Cancelar</button>
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
          className={`${styles.fab} ${abierto ? styles.fabAbierto : ''}`}
          onClick={() => { setAbierto(!abierto); setConfirmando(null) }}
        >
          {abierto ? '✕' : '☰'}
        </button>
        {bajos > 0 && (
          <span className={styles.badge}>{bajos}</span>
        )}
      </div>
    </div>
  )
}