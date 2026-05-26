import { useState, useEffect } from 'react'
import POS from './screens/POS'
import Admin from './screens/Admin'
import Historial from './screens/Historial'
import Estadisticas from './screens/Estadisticas'
import LoginModal from './components/LoginModal'
import AlertaStock from './components/AlertaStock'
import styles from './App.module.css'
import { getIngredientesBajos } from './data/store'

export default function App() {
  const [pantalla, setPantalla] = useState('caja')
  const [showLogin, setShowLogin] = useState(false)
  const [alertaInicio, setAlertaInicio] = useState([])
  const [modoAdmin, setModoAdmin] = useState(false)
  const [loginParaPanel, setLoginParaPanel] = useState(false)

  useEffect(() => {
    const bajos = getIngredientesBajos()
    if (bajos.length > 0) setAlertaInicio(bajos)
  }, [])

  function handleNavigate(destino) {
    if (destino === 'admin') {
      if (modoAdmin) {
        setPantalla('admin')
      } else {
        setLoginParaPanel(false)
        setShowLogin(true)
      }
    } else {
      setPantalla(destino)
    }
  }

  function handleLoginExitoso() {
    setShowLogin(false)
    setModoAdmin(true)
    if (loginParaPanel) {
      setPantalla('admin')
      setLoginParaPanel(false)
    }
  }

  function handleVolver() {
    setPantalla('caja')
  }

  function handleDesactivarAdmin() {
    setModoAdmin(false)
  }

  function irAAdmin() {
    if (modoAdmin) {
      setPantalla('admin')
    } else {
      setLoginParaPanel(true)
      setShowLogin(true)
    }
  }

  return (
    <div className={styles.app}>
      {pantalla === 'caja' && <POS onIrAdmin={irAAdmin} onNavigate={handleNavigate} modoAdmin={modoAdmin} onDesactivarAdmin={handleDesactivarAdmin} />}
      {pantalla === 'historial' && <Historial onVolver={handleVolver} onNavigate={handleNavigate} modoAdmin={modoAdmin} onDesactivarAdmin={handleDesactivarAdmin} />}
      {pantalla === 'admin' && <Admin onSalir={handleVolver} onNavigate={handleNavigate} />}
      {pantalla === 'estadisticas' && <Estadisticas onNavigate={handleNavigate} modoAdmin={modoAdmin} onDesactivarAdmin={handleDesactivarAdmin} />}

      {showLogin && (
        <LoginModal
          onSuccess={handleLoginExitoso}
          onClose={() => setShowLogin(false)}
        />
      )}

      {alertaInicio.length > 0 && (
        <AlertaStock
          ingredientes={alertaInicio}
          titulo="Ingredientes bajos al iniciar"
          onClose={() => setAlertaInicio([])}
        />
      )}
    </div>
  )
}