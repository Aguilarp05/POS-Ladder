const DEFAULTS = {
  categorias: [],
  productos: [],
  extras: [],
  pedidos: [],
  ingredientes: [],
  historialIngredientes: [],
  metodosPago: [
    { id: '1', nombre: 'Efectivo', activo: true },
    { id: '2', nombre: 'Tarjeta',  activo: true },
  ],
  password: '1234',
  gastos: [],
}

function load() {
  try {
    const data = localStorage.getItem('pos-data')
    return data ? JSON.parse(data) : { ...DEFAULTS }
  } catch {
    return { ...DEFAULTS }
  }
}

function save(data) {
  localStorage.setItem('pos-data', JSON.stringify(data))
}

// Categorias
export function getCategorias() {
  return load().categorias
}

export function addCategoria(nombre) {
  const data = load()
  data.categorias.push({ id: Date.now().toString(), nombre })
  save(data)
}

export function deleteCategoria(id) {
  const data = load()
  data.categorias = data.categorias.filter(c => c.id !== id)
  data.productos = data.productos.filter(p => p.categoriaId !== id)
  data.extras = data.extras.filter(e => e.categoriaId !== id)
  save(data)
}

// Productos
export function getProductos() {
  return load().productos
}

export function addProducto(nombre, precio, categoriaId, precioEmpleado) {
  const data = load()
  data.productos.push({
    id: Date.now().toString(),
    nombre,
    precio: parseFloat(precio),
    precioEmpleado: precioEmpleado ? parseFloat(precioEmpleado) : null,
    categoriaId,
    receta: []
  })
  save(data)
}

export function editProducto(id, nombre, precio, precioEmpleado) {
  const data = load()
  data.productos = data.productos.map(p =>
    p.id === id ? {
      ...p,
      nombre,
      precio: parseFloat(precio),
      precioEmpleado: precioEmpleado ? parseFloat(precioEmpleado) : null
    } : p
  )
  save(data)
}

export function editReceta(productoId, receta) {
  const data = load()
  data.productos = data.productos.map(p =>
    p.id === productoId ? { ...p, receta } : p
  )
  save(data)
}

export function deleteProducto(id) {
  const data = load()
  data.productos = data.productos.filter(p => p.id !== id)
  save(data)
}

// Extras
export function getExtras() {
  return load().extras
}

export function addExtra(nombre, precio, categoriaId) {
  const data = load()
  data.extras.push({
    id: Date.now().toString(),
    nombre,
    precio: parseFloat(precio) || 0,
    categoriaId,
    receta: []
  })
  save(data)
}

export function editExtra(id, nombre, precio) {
  const data = load()
  data.extras = data.extras.map(e =>
    e.id === id ? { ...e, nombre, precio: parseFloat(precio) || 0 } : e
  )
  save(data)
}

export function editRecetaExtra(extraId, receta) {
  const data = load()
  data.extras = data.extras.map(e =>
    e.id === extraId ? { ...e, receta } : e
  )
  save(data)
}

export function deleteExtra(id) {
  const data = load()
  data.extras = data.extras.filter(e => e.id !== id)
  save(data)
}

// Ingredientes
export function getIngredientes() {
  return load().ingredientes || []
}

export function addIngrediente(nombre, tipo, cantidad, cantidadMin, unidadPeso, peso, pesoMin) {
  const data = load()
  if (!data.ingredientes) data.ingredientes = []
  const ing = {
    id: Date.now().toString(),
    nombre,
    tipo,
  }
  if (tipo === 'cantidad' || tipo === 'ambos') {
    ing.cantidad = parseFloat(cantidad) || 0
    ing.cantidadMin = parseFloat(cantidadMin) || 0
  }
  if (tipo === 'peso' || tipo === 'ambos') {
    ing.unidadPeso = unidadPeso || 'g'
    ing.peso = parseFloat(peso) || 0
    ing.pesoMin = parseFloat(pesoMin) || 0
  }
  data.ingredientes.push(ing)

  // Registrar creación en historial
  if (!data.historialIngredientes) data.historialIngredientes = []
  data.historialIngredientes.push({
    id: Date.now().toString() + '_c',
    ingredienteId: ing.id,
    nombreIng: nombre,
    cambios: ['Ingrediente creado'],
    fecha: new Date().toISOString(),
  })

  save(data)
}

export function editIngrediente(id, nombre, tipo, cantidad, cantidadMin, unidadPeso, peso, pesoMin) {
  const data = load()
  const anterior = data.ingredientes.find(i => i.id === id)
  const cambios = []

  if (anterior) {
    if (anterior.nombre !== nombre) cambios.push(`Nombre: "${anterior.nombre}" → "${nombre}"`)
    if ((tipo === 'cantidad' || tipo === 'ambos') && (anterior.cantidad || 0) !== (parseFloat(cantidad) || 0)) {
      cambios.push(`Stock (pz): ${anterior.cantidad || 0} → ${parseFloat(cantidad) || 0}`)
    }
    if ((tipo === 'peso' || tipo === 'ambos') && (anterior.peso || 0) !== (parseFloat(peso) || 0)) {
      cambios.push(`Stock (${unidadPeso}): ${anterior.peso || 0} → ${parseFloat(peso) || 0}`)
    }
    if ((tipo === 'cantidad' || tipo === 'ambos') && (anterior.cantidadMin || 0) !== (parseFloat(cantidadMin) || 0)) {
      cambios.push(`Mínimo (pz): ${anterior.cantidadMin || 0} → ${parseFloat(cantidadMin) || 0}`)
    }
    if ((tipo === 'peso' || tipo === 'ambos') && (anterior.pesoMin || 0) !== (parseFloat(pesoMin) || 0)) {
      cambios.push(`Mínimo (${unidadPeso}): ${anterior.pesoMin || 0} → ${parseFloat(pesoMin) || 0}`)
    }
  }

  data.ingredientes = data.ingredientes.map(i => {
    if (i.id !== id) return i
    const ing = { ...i, nombre, tipo }
    if (tipo === 'cantidad' || tipo === 'ambos') {
      ing.cantidad = parseFloat(cantidad) || 0
      ing.cantidadMin = parseFloat(cantidadMin) || 0
    }
    if (tipo === 'peso' || tipo === 'ambos') {
      ing.unidadPeso = unidadPeso || 'g'
      ing.peso = parseFloat(peso) || 0
      ing.pesoMin = parseFloat(pesoMin) || 0
    }
    return ing
  })

  if (cambios.length > 0) {
    if (!data.historialIngredientes) data.historialIngredientes = []
    data.historialIngredientes.push({
      id: Date.now().toString(),
      ingredienteId: id,
      nombreIng: nombre,
      cambios,
      fecha: new Date().toISOString(),
    })
  }

  save(data)
}

export function deleteIngrediente(id) {
  const data = load()
  data.ingredientes = data.ingredientes.filter(i => i.id !== id)
  save(data)
}

// Historial de ingredientes
export function getHistorialIngrediente(ingredienteId) {
  const data = load()
  if (!data.historialIngredientes) return []
  return data.historialIngredientes
    .filter(h => h.ingredienteId === ingredienteId)
    .reverse()
}

// Descontar inventario al vender
export function descontarInventario(orden) {
  const data = load()
  if (!data.ingredientes) return

  function descontarReceta(receta, multiplicador) {
    receta?.forEach(r => {
      const ing = data.ingredientes.find(i => i.id === r.ingredienteId)
      if (!ing) return
      if (r.unidadTipo === 'cantidad') {
        ing.cantidad = Math.max(0, (ing.cantidad || 0) - r.cantidad * multiplicador)
      } else if (r.unidadTipo === 'peso') {
        ing.peso = Math.max(0, (ing.peso || 0) - r.cantidad * multiplicador)
      }
    })
  }

  orden.forEach(o => {
    const producto = data.productos.find(p => p.id === o.producto.id)
    descontarReceta(producto?.receta, o.qty)
    o.extrasDetalle?.forEach(e => {
      const extra = data.extras.find(ex => ex.id === e.id)
      descontarReceta(extra?.receta, e.qty)
    })
  })

  save(data)
}

// Pedidos
export function guardarPedido(orden, total, metodoPago, montoDidi) {
  const data = load()
  if (!data.pedidos) data.pedidos = []
  const pedido = {
    id: Date.now().toString(),
    fecha: new Date().toISOString(),
    orden,
    total,
    metodoPago,
  }
  if (montoDidi !== undefined) pedido.montoDidi = montoDidi
  data.pedidos.push(pedido)
  save(data)
}

export function getPedidos() {
  return load().pedidos || []
}

// Métodos de pago
export function getMetodosPago() {
  const data = load()
  if (!data.metodosPago || data.metodosPago.length === 0) {
    return DEFAULTS.metodosPago
  }
  return data.metodosPago
}

export function addMetodoPago(nombre) {
  const data = load()
  if (!data.metodosPago) data.metodosPago = getMetodosPago()
  data.metodosPago.push({ id: Date.now().toString(), nombre, activo: true })
  save(data)
}

export function toggleMetodoPago(id) {
  const data = load()
  if (!data.metodosPago) data.metodosPago = getMetodosPago()
  data.metodosPago = data.metodosPago.map(m =>
    m.id === id ? { ...m, activo: !m.activo } : m
  )
  save(data)
}

export function deleteMetodoPago(id) {
  const data = load()
  if (!data.metodosPago) data.metodosPago = getMetodosPago()
  data.metodosPago = data.metodosPago.filter(m => m.id !== id)
  save(data)
}

// Contraseña
export function checkPassword(input) {
  return load().password === input
}

export function changePassword(nueva) {
  const data = load()
  data.password = nueva
  save(data)
}

export function getIngredientesBajos() {
  const data = load()
  if (!data.ingredientes) return []
  return data.ingredientes.filter(i => {
    if (i.tipo === 'cantidad' || i.tipo === 'ambos') {
      if (i.cantidadMin > 0 && (i.cantidad || 0) <= i.cantidadMin) return true
    }
    if (i.tipo === 'peso' || i.tipo === 'ambos') {
      if (i.pesoMin > 0 && (i.peso || 0) <= i.pesoMin) return true
    }
    return false
  })
}

// Turnos
export function getTurnoActual() {
  const hora = new Date().getHours()
  const minutos = new Date().getMinutes()
  const totalMinutos = hora * 60 + minutos

  // Apertura: 11:00 (660) a 18:30 (1110)
  // Cierre: 18:30 (1110) a 02:30 (150 del día siguiente)
  if (totalMinutos >= 660 && totalMinutos < 1110) {
    return 'Apertura'
  } else if (totalMinutos >= 1110 || totalMinutos < 150) {
    return 'Cierre'
  }
  return null // Fuera de horario
}

export function getJornadaActual() {
  const data = load()
  if (!data.jornadas) return null
  return data.jornadas.find(j => !j.cerrada) || null
}

export function abrirJornada(fondoInicial = 0) {
  const data = load()
  if (!data.jornadas) data.jornadas = []
  if (data.jornadas.some(j => !j.cerrada)) return
  data.jornadas.push({
    id: Date.now().toString(),
    turno: getTurnoActual(),
    inicio: new Date().toISOString(),
    cerrada: false,
    totalVentas: 0,
    numPedidos: 0,
    fondoInicial: parseFloat(fondoInicial) || 0,
  })
  save(data)
}

export function registrarGasto(concepto, monto) {
  const data = load()
  if (!data.gastos) data.gastos = []
  data.gastos.push({
    id: Date.now().toString(),
    fecha: new Date().toISOString(),
    concepto: concepto.trim(),
    monto: parseFloat(monto) || 0,
  })
  save(data)
}

export function getGastosByFecha(fecha) {
  const data = load()
  if (!data.gastos) return []
  return data.gastos.filter(g =>
    new Date(g.fecha).toISOString().split('T')[0] === fecha
  )
}

export function cerrarJornada() {
  const data = load()
  if (!data.jornadas) return
  const hoy = new Date().toISOString().split('T')[0]
  const turno = getTurnoActual()
  const pedidosJornada = (data.pedidos || []).filter(p => {
    const fechaPedido = new Date(p.fecha).toISOString().split('T')[0]
    return fechaPedido === hoy
  })
  const total = pedidosJornada.reduce((s, p) => s + p.total, 0)

  data.jornadas = data.jornadas.map(j => {
    if (!j.cerrada) {
      return {
        ...j,
        cerrada: true,
        cierre: new Date().toISOString(),
        totalVentas: total,
        numPedidos: pedidosJornada.length,
      }
    }
    return j
  })
  save(data)
}

export function getJornadas() {
  const data = load()
  return data.jornadas || []
}

export function getPedidosPorTurno(fecha, turno) {
  const data = load()
  const pedidos = data.pedidos || []
  return pedidos.filter(p => {
    const fechaPedido = new Date(p.fecha).toISOString().split('T')[0]
    if (fechaPedido !== fecha) return false
    const hora = new Date(p.fecha).getHours()
    const minutos = new Date(p.fecha).getMinutes()
    const totalMinutos = hora * 60 + minutos
    if (turno === 'Apertura') return totalMinutos >= 660 && totalMinutos < 1110
    if (turno === 'Cierre') return totalMinutos >= 1110 || totalMinutos < 150
    return true
  })
}

