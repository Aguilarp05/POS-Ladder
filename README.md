# Ladder POS

A fully-featured, offline-first point of sale desktop application built for a real restaurant. Handles the full cashier workflow — from order taking to shift closing and cash flow tracking.

> **Currently in production use** at a restaurant in Mexico.

## Features

- **Order Taking** — Product grid by category, extras per item, optional notes, quantity controls, and inline order editing
- **Multiple Payment Methods** — Split payments across methods in a single transaction; includes a dedicated DiDi Efectivo flow with independent pricing
- **Inventory Control** — Ingredient tracking with recipes per product/extra, automatic stock deduction after each sale, and low-stock alerts
- **Employee Mode** — Special employee pricing and free meal registration
- **Shift Management** — Opening/closing shifts with automatic detection based on time of day; opening cash float registration
- **Expense Tracking** — Register cash outflows (rent, utilities, etc.) tied to the current shift
- **Cash Flow View** — Per-day breakdown: opening float + cash sales + DiDi income − expenses = expected cash in register
- **Sales History & Statistics** — Order history with filters by date, shift, and payment method; sales analytics by day/week/month/year with hourly charts
- **Admin Mode** — Password-protected mode that unlocks full historical data and the management panel; cashiers only see today's data
- **Data Portability** — Export/import all data as JSON for backups and machine migrations

## Tech Stack

| | |
|---|---|
| **React 18** | UI and state management |
| **Electron 29** | Desktop app wrapper |
| **Vite 5** | Build tool |
| **localStorage** | Local data persistence — no internet, no server, no database |

## Getting Started

### Prerequisites

- Node.js 18+

### Development

```bash
git clone https://github.com/aguilarp05/POS-Ladder.git
cd POS-Ladder
npm install
npm run dev
```

### Build

```bash
npm run build
```

Generates the installer in `dist-electron/` — `.exe` on Windows, `.dmg` on Mac.

> **Note for Mac:** First launch after install requires right-click → Open to bypass Gatekeeper (app is not notarized).

## Default Admin Password

`1234` — changeable from within the admin panel.

## Architecture

All data lives in a single `localStorage` key (`pos-data`). The data layer (`src/data/store.js`) exposes pure read/write functions — no global state, no context, no reducers. Every function loads, mutates, and saves on each call.

Navigation is managed by a `pantalla` state in `App.jsx` with an `onNavigate` prop pattern — no router library.

## License

Copyright © 2026 aguilarp05 — All rights reserved.
