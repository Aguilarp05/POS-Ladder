import styles from './Sidebar.module.css'

export default function Sidebar({ pantallaActual, onNavigate, onClose }) {
  const opciones = [
    { key: 'caja',      label: 'Caja'      },
    { key: 'historial', label: 'Historial' },
    { key: 'admin',     label: 'Admin'     },
  ]

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.sidebar}>
        <div className={styles.header}>
          <p className={styles.appName}>POS Restaurante</p>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <nav className={styles.nav}>
          {opciones.map(op => (
            <button
              key={op.key}
              className={`${styles.navBtn} ${pantallaActual === op.key ? styles.navActive : ''}`}
              onClick={() => onNavigate(op.key)}
            >
              {op.label}
            </button>
          ))}
        </nav>
      </div>
    </>
  )
}