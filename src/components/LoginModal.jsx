import React, { useState } from 'react'
import { checkPassword } from '../data/store'
import styles from './LoginModal.module.css'

export default function LoginModal({ onSuccess, onClose }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  function handleSubmit() {
    if (checkPassword(password)) {
      setPassword('')
      setError(false)
      onSuccess()
    } else {
      setError(true)
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <p className={styles.title}>Acceso Admin</p>
        <input
          className={`${styles.input} ${error ? styles.inputError : ''}`}
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => { setPassword(e.target.value); setError(false) }}
          onKeyDown={handleKey}
          autoFocus
        />
        {error && <p className={styles.error}>Contraseña incorrecta</p>}
        <button className={styles.btn} onClick={handleSubmit}>Entrar</button>
        <button className={styles.cancelBtn} onClick={onClose}>Cancelar</button>
      </div>
    </div>
  )
}