# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server + Electron (requires both to be running)
npm run build     # Build React app with Vite, then package with electron-builder → dist-electron/
npm run preview   # Preview the Vite build in browser only (no Electron)
```

There are no tests and no linter configured.

## Architecture

**Ladder** is an offline-first restaurant POS desktop app — React UI embedded in Electron, with all data stored in `localStorage`.

### Data layer (`src/data/store.js`)

The entire data layer is one file. Every exported function calls `load()` (reads `localStorage['pos-data']`) and `save()` (writes it back) on every operation — there is no in-memory cache or React context. IDs are generated with `Date.now().toString()`. The stored object shape:

```
{ categorias, productos, extras, pedidos, ingredientes,
  historialIngredientes, metodosPago, jornadas, password }
```

Key behaviors:
- **Inventory deduction** happens in `descontarInventario()`, called after each sale — it walks the `receta` array on each product/extra and subtracts from ingredient stock.
- **Shifts** (`getTurnoActual`) are determined by hardcoded time ranges: Apertura = 11:00–18:30, Cierre = 18:30–02:30.
- `getIngredientesBajos()` is checked on app launch (App.jsx) and after each completed sale (POS.jsx) to trigger the `AlertaStock` modal.

### Screen navigation

`App.jsx` owns a `pantalla` state (`'caja' | 'admin' | 'historial' | 'estadisticas'`). Screens receive an `onNavigate(destino)` prop. Navigating to `'admin'` always goes through a `LoginModal` first; all other transitions are direct. There is no router library.

### Screens (`src/screens/`)

| File | Purpose |
|------|---------|
| `POS.jsx` | Main cashier screen — product grid, extras, order cart, multi-payment flow, shift/employee modes |
| `Admin.jsx` | Full menu & inventory management — categories, products, extras, ingredients, recipes, payment methods, password |
| `Historial.jsx` | Order history filtered by date, shift, and payment method |
| `Estadisticas.jsx` | Sales analytics by day/week/month/year/shift with hourly breakdown |

### Styling

Each screen and component has a co-located CSS Module (`.module.css`). Global base styles are in `src/index.css`.

### Electron

`electron/main.js` is minimal: in dev it loads `http://localhost:5173`; in production it loads `dist/index.html`. `contextIsolation: true`, `nodeIntegration: false` — no IPC bridge exists; the renderer has no Node.js access.

### UI language

All UI text, variable names, and state identifiers are in Spanish (e.g., `pantalla`, `pedidos`, `ingredientes`, `jornada`, `turno`).
