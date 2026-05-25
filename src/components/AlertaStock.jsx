import styles from './AlertaStock.module.css'

export default function AlertaStock({ ingredientes, onClose, titulo }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <p className={styles.title}>⚠ {titulo}</p>
        </div>
        <div className={styles.lista}>
          {ingredientes.map(i => {
            const parts = []
            if (i.tipo === 'cantidad' || i.tipo === 'ambos') parts.push(`${i.cantidad} pz (mín: ${i.cantidadMin})`)
            if (i.tipo === 'peso' || i.tipo === 'ambos') parts.push(`${i.peso} ${i.unidadPeso} (mín: ${i.pesoMin})`)
            return (
              <div key={i.id} className={styles.row}>
                <span className={styles.nombre}>{i.nombre}</span>
                <span className={styles.stock}>{parts.join(' / ')}</span>
              </div>
            )
          })}
        </div>
        <button className={styles.cerrarBtn} onClick={onClose}>Entendido</button>
      </div>
    </div>
  )
}