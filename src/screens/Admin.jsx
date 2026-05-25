import { useState, useEffect } from 'react'
import {
  getCategorias, addCategoria, deleteCategoria,
  getProductos, addProducto, editProducto, deleteProducto, editReceta,
  getExtras, addExtra, editExtra, deleteExtra, editRecetaExtra,
  getIngredientes, addIngrediente, editIngrediente, deleteIngrediente,
  getHistorialIngrediente,
  getMetodosPago, addMetodoPago, toggleMetodoPago, deleteMetodoPago,
  checkPassword, changePassword
} from '../data/store'
import styles from './Admin.module.css'

export default function Admin({ onSalir }) {
  const [tab, setTab] = useState('productos')
  const [categorias, setCategorias] = useState([])
  const [productos, setProductos] = useState([])
  const [extras, setExtras] = useState([])
  const [metodos, setMetodos] = useState([])
  const [ingredientes, setIngredientes] = useState([])
  const [busquedaIng, setBusquedaIng] = useState('')
  const [showIngForm, setShowIngForm] = useState(false)
  const [historialIngId, setHistorialIngId] = useState(null)
  const [historialItems, setHistorialItems] = useState([])

  // Productos
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [nuevoPrecio, setNuevoPrecio] = useState('')
  const [nuevoPrecioEmp, setNuevoPrecioEmp] = useState('')
  const [nuevoCat, setNuevoCat] = useState('')
  const [editandoId, setEditandoId] = useState(null)
  const [editNombre, setEditNombre] = useState('')
  const [editPrecio, setEditPrecio] = useState('')
  const [editPrecioEmp, setEditPrecioEmp] = useState('')
  const [editandoRecetaId, setEditandoRecetaId] = useState(null)
  const [recetaTemp, setRecetaTemp] = useState([])
  const [recetaIngId, setRecetaIngId] = useState('')
  const [recetaCantidad, setRecetaCantidad] = useState('')
  const [recetaUnidadTipo, setRecetaUnidadTipo] = useState('cantidad')

  // Categorias
  const [nuevaCat, setNuevaCat] = useState('')

  // Extras
  const [nuevoExtra, setNuevoExtra] = useState('')
  const [nuevoExtraPrecio, setNuevoExtraPrecio] = useState('')
  const [nuevoExtraCat, setNuevoExtraCat] = useState('')
  const [editandoExtraId, setEditandoExtraId] = useState(null)
  const [editExtraNombre, setEditExtraNombre] = useState('')
  const [editExtraPrecio, setEditExtraPrecio] = useState('')
  const [editandoRecetaExtraId, setEditandoRecetaExtraId] = useState(null)
  const [recetaExtraTemp, setRecetaExtraTemp] = useState([])
  const [recetaExtraIngId, setRecetaExtraIngId] = useState('')
  const [recetaExtraCantidad, setRecetaExtraCantidad] = useState('')
  const [recetaExtraUnidadTipo, setRecetaExtraUnidadTipo] = useState('cantidad')

  // Ingredientes
  const [nuevoIng, setNuevoIng] = useState('')
  const [nuevoIngTipo, setNuevoIngTipo] = useState('cantidad')
  const [nuevoIngCantidad, setNuevoIngCantidad] = useState('')
  const [nuevoIngCantidadMin, setNuevoIngCantidadMin] = useState('')
  const [nuevoIngUnidadPeso, setNuevoIngUnidadPeso] = useState('g')
  const [nuevoIngPeso, setNuevoIngPeso] = useState('')
  const [nuevoIngPesoMin, setNuevoIngPesoMin] = useState('')
  const [editandoIngId, setEditandoIngId] = useState(null)
  const [editIngNombre, setEditIngNombre] = useState('')
  const [editIngTipo, setEditIngTipo] = useState('cantidad')
  const [editIngCantidad, setEditIngCantidad] = useState('')
  const [editIngCantidadMin, setEditIngCantidadMin] = useState('')
  const [editIngUnidadPeso, setEditIngUnidadPeso] = useState('g')
  const [editIngPeso, setEditIngPeso] = useState('')
  const [editIngPesoMin, setEditIngPesoMin] = useState('')

  // Métodos
  const [nuevoMetodo, setNuevoMetodo] = useState('')

  // Contraseña
  const [passActual, setPassActual] = useState('')
  const [passNueva, setPassNueva] = useState('')
  const [passConfirm, setPassConfirm] = useState('')
  const [passError, setPassError] = useState('')
  const [passOk, setPassOk] = useState(false)

  useEffect(() => { cargar() }, [])

  function cargar() {
    setCategorias(getCategorias())
    setProductos(getProductos())
    setExtras(getExtras())
    setMetodos(getMetodosPago())
    setIngredientes(getIngredientes())
  }

  // Categorías
  function handleAddCategoria() {
    if (!nuevaCat.trim()) return
    addCategoria(nuevaCat.trim())
    setNuevaCat('')
    cargar()
  }

  function handleDeleteCategoria(id) {
    if (!confirm('Borrar esta categoria y todos sus productos y extras?')) return
    deleteCategoria(id)
    cargar()
  }

  // Productos
  function handleAddProducto() {
    if (!nuevoNombre.trim() || !nuevoPrecio || !nuevoCat) return
    addProducto(nuevoNombre.trim(), nuevoPrecio, nuevoCat, nuevoPrecioEmp)
    setNuevoNombre(''); setNuevoPrecio(''); setNuevoCat(''); setNuevoPrecioEmp('')
    cargar()
  }

  function handleEditStart(p) {
    setEditandoId(p.id)
    setEditNombre(p.nombre)
    setEditPrecio(p.precio.toString())
    setEditPrecioEmp(p.precioEmpleado ? p.precioEmpleado.toString() : '')
  }

  function handleEditSave(id) {
    if (!editNombre.trim() || !editPrecio) return
    editProducto(id, editNombre.trim(), editPrecio, editPrecioEmp)
    setEditandoId(null)
    cargar()
  }

  function handleDeleteProducto(id) {
    if (!confirm('Borrar este producto?')) return
    deleteProducto(id)
    cargar()
  }

  // Receta producto
  function handleEditRecetaStart(p) {
    setEditandoRecetaId(p.id)
    setRecetaTemp(p.receta || [])
    setRecetaIngId('')
    setRecetaCantidad('')
    setRecetaUnidadTipo('cantidad')
  }

  function handleAddRecetaItem() {
    if (!recetaIngId || !recetaCantidad) return
    const ing = ingredientes.find(i => i.id === recetaIngId)
    if (!ing) return
    const unidadLabel = recetaUnidadTipo === 'peso' ? ing.unidadPeso : 'pz'
    setRecetaTemp(prev => [
      ...prev.filter(r => !(r.ingredienteId === recetaIngId && r.unidadTipo === recetaUnidadTipo)),
      { ingredienteId: recetaIngId, nombre: ing.nombre, unidadTipo: recetaUnidadTipo, unidadLabel, cantidad: parseFloat(recetaCantidad) }
    ])
    setRecetaIngId('')
    setRecetaCantidad('')
  }

  function handleRemoveRecetaItem(ingredienteId, unidadTipo) {
    setRecetaTemp(prev => prev.filter(r => !(r.ingredienteId === ingredienteId && r.unidadTipo === unidadTipo)))
  }

  function handleSaveReceta() {
    editReceta(editandoRecetaId, recetaTemp)
    setEditandoRecetaId(null)
    cargar()
  }

  // Extras
  function handleAddExtra() {
    if (!nuevoExtra.trim() || !nuevoExtraCat) return
    addExtra(nuevoExtra.trim(), nuevoExtraPrecio || 0, nuevoExtraCat)
    setNuevoExtra(''); setNuevoExtraPrecio(''); setNuevoExtraCat('')
    cargar()
  }

  function handleEditExtraStart(e) {
    setEditandoExtraId(e.id)
    setEditExtraNombre(e.nombre)
    setEditExtraPrecio((e.precio || 0).toString())
  }

  function handleEditExtraSave(id) {
    if (!editExtraNombre.trim()) return
    editExtra(id, editExtraNombre.trim(), editExtraPrecio || 0)
    setEditandoExtraId(null)
    cargar()
  }

  function handleDeleteExtra(id) {
    deleteExtra(id)
    cargar()
  }

  // Receta extra
  function handleEditRecetaExtraStart(e) {
    setEditandoRecetaExtraId(e.id)
    setRecetaExtraTemp(e.receta || [])
    setRecetaExtraIngId('')
    setRecetaExtraCantidad('')
    setRecetaExtraUnidadTipo('cantidad')
  }

  function handleAddRecetaExtraItem() {
    if (!recetaExtraIngId || !recetaExtraCantidad) return
    const ing = ingredientes.find(i => i.id === recetaExtraIngId)
    if (!ing) return
    const unidadLabel = recetaExtraUnidadTipo === 'peso' ? ing.unidadPeso : 'pz'
    setRecetaExtraTemp(prev => [
      ...prev.filter(r => !(r.ingredienteId === recetaExtraIngId && r.unidadTipo === recetaExtraUnidadTipo)),
      { ingredienteId: recetaExtraIngId, nombre: ing.nombre, unidadTipo: recetaExtraUnidadTipo, unidadLabel, cantidad: parseFloat(recetaExtraCantidad) }
    ])
    setRecetaExtraIngId('')
    setRecetaExtraCantidad('')
  }

  function handleRemoveRecetaExtraItem(ingredienteId, unidadTipo) {
    setRecetaExtraTemp(prev => prev.filter(r => !(r.ingredienteId === ingredienteId && r.unidadTipo === unidadTipo)))
  }

  function handleSaveRecetaExtra() {
    editRecetaExtra(editandoRecetaExtraId, recetaExtraTemp)
    setEditandoRecetaExtraId(null)
    cargar()
  }

  // Ingredientes
  function handleAddIngrediente() {
    if (!nuevoIng.trim()) return
    addIngrediente(nuevoIng.trim(), nuevoIngTipo, nuevoIngCantidad, nuevoIngCantidadMin, nuevoIngUnidadPeso, nuevoIngPeso, nuevoIngPesoMin)
    setNuevoIng(''); setNuevoIngCantidad(''); setNuevoIngCantidadMin(''); setNuevoIngPeso(''); setNuevoIngPesoMin('')
    setShowIngForm(false)
    cargar()
  }

  function handleEditIngStart(i) {
    setEditandoIngId(i.id)
    setEditIngNombre(i.nombre)
    setEditIngTipo(i.tipo)
    setEditIngCantidad((i.cantidad || 0).toString())
    setEditIngCantidadMin((i.cantidadMin || 0).toString())
    setEditIngUnidadPeso(i.unidadPeso || 'g')
    setEditIngPeso((i.peso || 0).toString())
    setEditIngPesoMin((i.pesoMin || 0).toString())
  }

  function handleEditIngSave(id) {
    if (!editIngNombre.trim()) return
    editIngrediente(id, editIngNombre.trim(), editIngTipo, editIngCantidad, editIngCantidadMin, editIngUnidadPeso, editIngPeso, editIngPesoMin)
    setEditandoIngId(null)
    cargar()
  }

  function handleDeleteIngrediente(id) {
    if (!confirm('Borrar este ingrediente?')) return
    deleteIngrediente(id)
    cargar()
  }

  function handleVerHistorial(id) {
    if (historialIngId === id) {
      setHistorialIngId(null)
      setHistorialItems([])
    } else {
      setHistorialIngId(id)
      setHistorialItems(getHistorialIngrediente(id))
    }
  }

  function formatFechaHora(fechaISO) {
    return new Date(fechaISO).toLocaleString('es-MX', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  // Métodos
  function handleAddMetodo() {
    if (!nuevoMetodo.trim()) return
    addMetodoPago(nuevoMetodo.trim())
    setNuevoMetodo('')
    cargar()
  }

  function handleToggleMetodo(id) {
    toggleMetodoPago(id)
    cargar()
  }

  function handleDeleteMetodo(id) {
    if (!confirm('Borrar este metodo de pago?')) return
    deleteMetodoPago(id)
    cargar()
  }

  // Contraseña
  function handleChangePassword() {
    if (!checkPassword(passActual)) { setPassError('Contrasena actual incorrecta'); setPassOk(false); return }
    if (passNueva.length < 4) { setPassError('Minimo 4 caracteres'); setPassOk(false); return }
    if (passNueva !== passConfirm) { setPassError('Las contrasenas no coinciden'); setPassOk(false); return }
    changePassword(passNueva)
    setPassActual(''); setPassNueva(''); setPassConfirm('')
    setPassError(''); setPassOk(true)
  }

  const TABS = ['productos', 'categorias', 'extras', 'ingredientes', 'metodos', 'contrasena']
  function tabLabel(t) {
    const map = { metodos: 'Metodos de pago', contrasena: 'Contrasena', ingredientes: 'Ingredientes' }
    return map[t] || t.charAt(0).toUpperCase() + t.slice(1)
  }

  const ingSeleccionadoReceta = ingredientes.find(i => i.id === recetaIngId)
  const ingSeleccionadoRecetaExtra = ingredientes.find(i => i.id === recetaExtraIngId)
  const ingredientesFiltrados = ingredientes.filter(i =>
    i.nombre.toLowerCase().includes(busquedaIng.toLowerCase())
  )

  function stockLabel(i) {
    const parts = []
    if (i.tipo === 'cantidad' || i.tipo === 'ambos') parts.push(`${i.cantidad} pz`)
    if (i.tipo === 'peso' || i.tipo === 'ambos') parts.push(`${i.peso} ${i.unidadPeso}`)
    return parts.join(' / ')
  }

  function stockBajo(i) {
    if ((i.tipo === 'cantidad' || i.tipo === 'ambos') && i.cantidad <= i.cantidadMin) return true
    if ((i.tipo === 'peso' || i.tipo === 'ambos') && i.peso <= i.pesoMin) return true
    return false
  }

  return (
    <div className={styles.admin}>
      <div className={styles.header}>
        <h1 className={styles.title}>Panel Admin</h1>
        <button className={styles.salirBtn} onClick={onSalir}>← Volver a caja</button>
      </div>

      <div className={styles.tabs}>
        {TABS.map(t => (
          <button key={t} className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`} onClick={() => setTab(t)}>
            {tabLabel(t)}
          </button>
        ))}
      </div>

      <div className={styles.content}>

        {/* Productos */}
        {tab === 'productos' && (
          <div className={styles.section}>
            <div className={styles.list}>
              {productos.length === 0 && <p className={styles.empty}>No hay productos aun</p>}
              {productos.map(p => {
                const cat = categorias.find(c => c.id === p.categoriaId)
                return (
                  <div key={p.id} className={styles.productoBlock}>
                    <div className={styles.row}>
                      {editandoId === p.id ? (
                        <>
                          <input className={styles.input} value={editNombre} onChange={e => setEditNombre(e.target.value)} placeholder="Nombre" />
                          <input className={styles.inputSmall} value={editPrecio} onChange={e => setEditPrecio(e.target.value)} placeholder="Precio" type="number" />
                          <input className={styles.inputSmall} value={editPrecioEmp} onChange={e => setEditPrecioEmp(e.target.value)} placeholder="Precio empleado" type="number" />
                          <button className={styles.saveBtn} onClick={() => handleEditSave(p.id)}>Guardar</button>
                          <button className={styles.cancelEditBtn} onClick={() => setEditandoId(null)}>Cancelar</button>
                        </>
                      ) : (
                        <>
                          <span className={styles.rowName}>{p.nombre}</span>
                          <span className={styles.rowPrice}>${p.precio}</span>
                          {p.precioEmpleado != null && (
                            <span className={styles.rowPrecioEmp}>Emp: ${p.precioEmpleado}</span>
                          )}
                          <span className={styles.rowCat}>{cat?.nombre}</span>
                          <button className={styles.editBtn} onClick={() => handleEditStart(p)}>Editar</button>
                          <button className={styles.recetaBtn} onClick={() => editandoRecetaId === p.id ? setEditandoRecetaId(null) : handleEditRecetaStart(p)}>
                            {editandoRecetaId === p.id ? 'Cerrar' : `Receta (${p.receta?.length || 0})`}
                          </button>
                          <button className={styles.deleteBtn} onClick={() => handleDeleteProducto(p.id)}>Borrar</button>
                        </>
                      )}
                    </div>
                    {editandoRecetaId === p.id && (
                      <div className={styles.recetaPanel}>
                        <p className={styles.recetaTitle}>Receta de {p.nombre}</p>
                        {recetaTemp.length === 0
                          ? <p className={styles.cardEmpty}>Sin ingredientes</p>
                          : recetaTemp.map(r => (
                            <div key={`${r.ingredienteId}-${r.unidadTipo}`} className={styles.recetaRow}>
                              <span className={styles.recetaNombre}>{r.nombre}</span>
                              <span className={styles.recetaCantidad}>{r.cantidad} {r.unidadLabel}</span>
                              <button className={styles.deleteBtn} onClick={() => handleRemoveRecetaItem(r.ingredienteId, r.unidadTipo)}>x</button>
                            </div>
                          ))
                        }
                        <div className={styles.recetaAddRow}>
                          <select className={styles.select} value={recetaIngId} onChange={e => { setRecetaIngId(e.target.value); setRecetaUnidadTipo('cantidad') }}>
                            <option value="">Ingrediente</option>
                            {ingredientes.map(i => <option key={i.id} value={i.id}>{i.nombre}</option>)}
                          </select>
                          {ingSeleccionadoReceta?.tipo === 'ambos' && (
                            <select className={styles.selectSmall} value={recetaUnidadTipo} onChange={e => setRecetaUnidadTipo(e.target.value)}>
                              <option value="cantidad">Piezas</option>
                              <option value="peso">{ingSeleccionadoReceta.unidadPeso}</option>
                            </select>
                          )}
                          <input className={styles.inputSmall} type="number" placeholder="Cantidad" value={recetaCantidad} onChange={e => setRecetaCantidad(e.target.value)} />
                          <button className={styles.addBtn} onClick={handleAddRecetaItem}>+ Agregar</button>
                        </div>
                        <button className={styles.saveBtn} onClick={handleSaveReceta}>Guardar receta</button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            <div className={styles.addRow}>
              <input className={styles.input} placeholder="Nombre del producto" value={nuevoNombre} onChange={e => setNuevoNombre(e.target.value)} />
              <input className={styles.inputSmall} placeholder="Precio" type="number" value={nuevoPrecio} onChange={e => setNuevoPrecio(e.target.value)} />
              <input className={styles.inputSmall} placeholder="Precio empleado" type="number" value={nuevoPrecioEmp} onChange={e => setNuevoPrecioEmp(e.target.value)} />
              <select className={styles.select} value={nuevoCat} onChange={e => setNuevoCat(e.target.value)}>
                <option value="">Categoria</option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
              <button className={styles.addBtn} onClick={handleAddProducto}>+ Agregar</button>
            </div>
          </div>
        )}

        {/* Categorías */}
        {tab === 'categorias' && (
          <div className={styles.section}>
            <div className={styles.list}>
              {categorias.length === 0 && <p className={styles.empty}>No hay categorias aun</p>}
              {categorias.map(c => (
                <div key={c.id} className={styles.row}>
                  <span className={styles.rowName}>{c.nombre}</span>
                  <button className={styles.deleteBtn} onClick={() => handleDeleteCategoria(c.id)}>Borrar</button>
                </div>
              ))}
            </div>
            <div className={styles.addRow}>
              <input className={styles.input} placeholder="Nueva categoria" value={nuevaCat} onChange={e => setNuevaCat(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddCategoria()} />
              <button className={styles.addBtn} onClick={handleAddCategoria}>+ Agregar</button>
            </div>
          </div>
        )}

        {/* Extras */}
        {tab === 'extras' && (
          <div className={styles.section}>
            <div className={styles.list}>
              {extras.length === 0 && <p className={styles.empty}>No hay extras aun</p>}
              {extras.map(e => {
                const cat = categorias.find(c => c.id === e.categoriaId)
                return (
                  <div key={e.id} className={styles.productoBlock}>
                    <div className={styles.row}>
                      {editandoExtraId === e.id ? (
                        <>
                          <input className={styles.input} value={editExtraNombre} onChange={e => setEditExtraNombre(e.target.value)} placeholder="Nombre" />
                          <input className={styles.inputSmall} value={editExtraPrecio} onChange={e => setEditExtraPrecio(e.target.value)} placeholder="Precio" type="number" />
                          <button className={styles.saveBtn} onClick={() => handleEditExtraSave(e.id)}>Guardar</button>
                          <button className={styles.cancelEditBtn} onClick={() => setEditandoExtraId(null)}>Cancelar</button>
                        </>
                      ) : (
                        <>
                          <span className={styles.rowName}>{e.nombre}</span>
                          <span className={styles.rowPrice}>${e.precio || 0}</span>
                          <span className={styles.rowCat}>{cat?.nombre}</span>
                          <button className={styles.editBtn} onClick={() => handleEditExtraStart(e)}>Editar</button>
                          <button className={styles.recetaBtn} onClick={() => editandoRecetaExtraId === e.id ? setEditandoRecetaExtraId(null) : handleEditRecetaExtraStart(e)}>
                            {editandoRecetaExtraId === e.id ? 'Cerrar' : `Receta (${e.receta?.length || 0})`}
                          </button>
                          <button className={styles.deleteBtn} onClick={() => handleDeleteExtra(e.id)}>Borrar</button>
                        </>
                      )}
                    </div>
                    {editandoRecetaExtraId === e.id && (
                      <div className={styles.recetaPanel}>
                        <p className={styles.recetaTitle}>Receta de {e.nombre}</p>
                        {recetaExtraTemp.length === 0
                          ? <p className={styles.cardEmpty}>Sin ingredientes</p>
                          : recetaExtraTemp.map(r => (
                            <div key={`${r.ingredienteId}-${r.unidadTipo}`} className={styles.recetaRow}>
                              <span className={styles.recetaNombre}>{r.nombre}</span>
                              <span className={styles.recetaCantidad}>{r.cantidad} {r.unidadLabel}</span>
                              <button className={styles.deleteBtn} onClick={() => handleRemoveRecetaExtraItem(r.ingredienteId, r.unidadTipo)}>x</button>
                            </div>
                          ))
                        }
                        <div className={styles.recetaAddRow}>
                          <select className={styles.select} value={recetaExtraIngId} onChange={e => { setRecetaExtraIngId(e.target.value); setRecetaExtraUnidadTipo('cantidad') }}>
                            <option value="">Ingrediente</option>
                            {ingredientes.map(i => <option key={i.id} value={i.id}>{i.nombre}</option>)}
                          </select>
                          {ingSeleccionadoRecetaExtra?.tipo === 'ambos' && (
                            <select className={styles.selectSmall} value={recetaExtraUnidadTipo} onChange={e => setRecetaExtraUnidadTipo(e.target.value)}>
                              <option value="cantidad">Piezas</option>
                              <option value="peso">{ingSeleccionadoRecetaExtra.unidadPeso}</option>
                            </select>
                          )}
                          <input className={styles.inputSmall} type="number" placeholder="Cantidad" value={recetaExtraCantidad} onChange={e => setRecetaExtraCantidad(e.target.value)} />
                          <button className={styles.addBtn} onClick={handleAddRecetaExtraItem}>+ Agregar</button>
                        </div>
                        <button className={styles.saveBtn} onClick={handleSaveRecetaExtra}>Guardar receta</button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            <div className={styles.addRow}>
              <input className={styles.input} placeholder="Nombre del extra" value={nuevoExtra} onChange={e => setNuevoExtra(e.target.value)} />
              <input className={styles.inputSmall} placeholder="Precio" type="number" value={nuevoExtraPrecio} onChange={e => setNuevoExtraPrecio(e.target.value)} />
              <select className={styles.select} value={nuevoExtraCat} onChange={e => setNuevoExtraCat(e.target.value)}>
                <option value="">Categoria</option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
              <button className={styles.addBtn} onClick={handleAddExtra}>+ Agregar</button>
            </div>
          </div>
        )}

        {/* Ingredientes */}
        {tab === 'ingredientes' && (
          <div className={styles.section}>
            <div className={styles.ingTopBar}>
              <input className={styles.buscador} placeholder="Buscar ingrediente..." value={busquedaIng} onChange={e => setBusquedaIng(e.target.value)} />
              <button className={styles.toggleFormBtn} onClick={() => setShowIngForm(prev => !prev)}>
                {showIngForm ? 'x Cancelar' : '+ Nuevo'}
              </button>
            </div>

            {showIngForm && (
              <div className={styles.ingAddForm}>
                <div className={styles.addRow}>
                  <input className={styles.input} placeholder="Nombre del ingrediente" value={nuevoIng} onChange={e => setNuevoIng(e.target.value)} />
                  <select className={styles.select} value={nuevoIngTipo} onChange={e => setNuevoIngTipo(e.target.value)}>
                    <option value="cantidad">Solo cantidad</option>
                    <option value="peso">Solo peso</option>
                    <option value="ambos">Ambos</option>
                  </select>
                </div>
                {(nuevoIngTipo === 'cantidad' || nuevoIngTipo === 'ambos') && (
                  <div className={styles.addRow}>
                    <span className={styles.ingLabel}>Cantidad (pz)</span>
                    <input className={styles.inputSmall} placeholder="Stock" type="number" value={nuevoIngCantidad} onChange={e => setNuevoIngCantidad(e.target.value)} />
                    <input className={styles.inputSmall} placeholder="Minimo" type="number" value={nuevoIngCantidadMin} onChange={e => setNuevoIngCantidadMin(e.target.value)} />
                  </div>
                )}
                {(nuevoIngTipo === 'peso' || nuevoIngTipo === 'ambos') && (
                  <div className={styles.addRow}>
                    <span className={styles.ingLabel}>Peso</span>
                    <select className={styles.selectSmall} value={nuevoIngUnidadPeso} onChange={e => setNuevoIngUnidadPeso(e.target.value)}>
                      <option value="g">g</option>
                      <option value="kg">kg</option>
                      <option value="ml">ml</option>
                      <option value="L">L</option>
                    </select>
                    <input className={styles.inputSmall} placeholder="Stock" type="number" value={nuevoIngPeso} onChange={e => setNuevoIngPeso(e.target.value)} />
                    <input className={styles.inputSmall} placeholder="Minimo" type="number" value={nuevoIngPesoMin} onChange={e => setNuevoIngPesoMin(e.target.value)} />
                  </div>
                )}
                <button className={styles.addBtn} onClick={handleAddIngrediente}>+ Agregar ingrediente</button>
              </div>
            )}

            <div className={styles.list}>
              {ingredientesFiltrados.length === 0 && <p className={styles.empty}>No se encontraron ingredientes</p>}
              {ingredientesFiltrados.map(i => (
                <div key={i.id} className={styles.productoBlock}>
                  <div className={styles.row}>
                    {editandoIngId === i.id ? (
                      <div className={styles.ingEditForm}>
                        <input className={styles.input} value={editIngNombre} onChange={e => setEditIngNombre(e.target.value)} placeholder="Nombre" />
                        <select className={styles.select} value={editIngTipo} onChange={e => setEditIngTipo(e.target.value)}>
                          <option value="cantidad">Solo cantidad</option>
                          <option value="peso">Solo peso</option>
                          <option value="ambos">Ambos</option>
                        </select>
                        {(editIngTipo === 'cantidad' || editIngTipo === 'ambos') && (
                          <>
                            <input className={styles.inputSmall} value={editIngCantidad} onChange={e => setEditIngCantidad(e.target.value)} placeholder="Stock pz" type="number" />
                            <input className={styles.inputSmall} value={editIngCantidadMin} onChange={e => setEditIngCantidadMin(e.target.value)} placeholder="Min pz" type="number" />
                          </>
                        )}
                        {(editIngTipo === 'peso' || editIngTipo === 'ambos') && (
                          <>
                            <select className={styles.selectSmall} value={editIngUnidadPeso} onChange={e => setEditIngUnidadPeso(e.target.value)}>
                              <option value="g">g</option>
                              <option value="kg">kg</option>
                              <option value="ml">ml</option>
                              <option value="L">L</option>
                            </select>
                            <input className={styles.inputSmall} value={editIngPeso} onChange={e => setEditIngPeso(e.target.value)} placeholder="Stock" type="number" />
                            <input className={styles.inputSmall} value={editIngPesoMin} onChange={e => setEditIngPesoMin(e.target.value)} placeholder="Minimo" type="number" />
                          </>
                        )}
                        <button className={styles.saveBtn} onClick={() => handleEditIngSave(i.id)}>Guardar</button>
                        <button className={styles.cancelEditBtn} onClick={() => setEditandoIngId(null)}>Cancelar</button>
                      </div>
                    ) : (
                      <>
                        <span className={styles.rowName}>{i.nombre}</span>
                        <span className={`${styles.rowStock} ${stockBajo(i) ? styles.rowStockBajo : ''}`}>
                          {stockLabel(i)}
                        </span>
                        {stockBajo(i) && <span className={styles.alertaBajo}>Stock bajo</span>}
                        <button className={styles.historialBtn} onClick={() => handleVerHistorial(i.id)}>
                          {historialIngId === i.id ? 'Cerrar' : 'Historial'}
                        </button>
                        <button className={styles.editBtn} onClick={() => handleEditIngStart(i)}>Editar</button>
                        <button className={styles.deleteBtn} onClick={() => handleDeleteIngrediente(i.id)}>Borrar</button>
                      </>
                    )}
                  </div>

                  {historialIngId === i.id && (
                    <div className={styles.historialPanel}>
                      <p className={styles.recetaTitle}>Historial de {i.nombre}</p>
                      {historialItems.length === 0
                        ? <p className={styles.cardEmpty}>Sin cambios registrados</p>
                        : historialItems.map(h => (
                          <div key={h.id} className={styles.historialRow}>
                            <span className={styles.historialFecha}>{formatFechaHora(h.fecha)}</span>
                            <div className={styles.historialCambios}>
                              {h.cambios.map((c, idx) => (
                                <span key={idx} className={styles.historialCambio}>{c}</span>
                              ))}
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Métodos de pago */}
        {tab === 'metodos' && (
          <div className={styles.section}>
            <div className={styles.list}>
              {metodos.length === 0 && <p className={styles.empty}>No hay metodos de pago aun</p>}
              {metodos.map(m => (
                <div key={m.id} className={styles.row}>
                  <span className={styles.rowName}>{m.nombre}</span>
                  <button className={m.activo ? styles.toggleBtnOn : styles.toggleBtnOff} onClick={() => handleToggleMetodo(m.id)}>
                    {m.activo ? 'Activo' : 'Inactivo'}
                  </button>
                  <button className={styles.deleteBtn} onClick={() => handleDeleteMetodo(m.id)}>Borrar</button>
                </div>
              ))}
            </div>
            <div className={styles.addRow}>
              <input className={styles.input} placeholder="Nombre del metodo" value={nuevoMetodo} onChange={e => setNuevoMetodo(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddMetodo()} />
              <button className={styles.addBtn} onClick={handleAddMetodo}>+ Agregar</button>
            </div>
          </div>
        )}

        {/* Contraseña */}
        {tab === 'contrasena' && (
          <div className={styles.section}>
            <div className={styles.passForm}>
              <input className={styles.input} type="password" placeholder="Contrasena actual" value={passActual} onChange={e => { setPassActual(e.target.value); setPassError(''); setPassOk(false) }} />
              <input className={styles.input} type="password" placeholder="Nueva contrasena" value={passNueva} onChange={e => { setPassNueva(e.target.value); setPassError(''); setPassOk(false) }} />
              <input className={styles.input} type="password" placeholder="Confirmar nueva contrasena" value={passConfirm} onChange={e => { setPassConfirm(e.target.value); setPassError(''); setPassOk(false) }} />
              {passError && <p className={styles.passError}>{passError}</p>}
              {passOk && <p className={styles.passOk}>Contrasena cambiada correctamente</p>}
              <button className={styles.addBtn} onClick={handleChangePassword}>Guardar</button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}