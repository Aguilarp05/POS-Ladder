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

  useEffect(() => {
    const bajos = getIngredientesBajos()
    if (bajos.length > 0) setAlertaInicio(bajos)
  }, [])

  function handleNavigate(destino) {
    if (destino === 'admin') {
      setShowLogin(true)
    } else {
      setPantalla(destino)
    }
  }

  function handleLoginExitoso() {
    setShowLogin(false)
    setPantalla('admin')
  }

  function handleSalir() {
    setPantalla('caja')
  }

  function irAAdmin() {
    setPantalla('admin')
  }

  return (
    <div className={styles.app}>
      {pantalla === 'caja' && <POS onIrAdmin={irAAdmin} onNavigate={handleNavigate} />}
      {pantalla === 'historial' && <Historial onVolver={handleSalir} onNavigate={handleNavigate} />}
      {pantalla === 'admin' && <Admin onSalir={handleSalir} onNavigate={handleNavigate} />}
      {pantalla === 'estadisticas' && <Estadisticas onNavigate={handleNavigate} />}

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