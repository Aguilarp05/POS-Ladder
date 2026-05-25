# Ladder POS

A modern, fully-featured point of sale system for restaurants, built with React and Electron.

## Features

- **Sales Management** — Fast order taking with product categories, extras, and optional notes per item
- **Inventory Control** — Ingredient tracking with recipes per product, stock alerts, and change history
- **Employee Orders** — Special employee pricing and free meal registration
- **Shift Management** — Opening and closing shifts with automatic detection based on time
- **Payment Flexibility** — Support for multiple payment methods in a single transaction (cash + card)
- **Sales History** — Daily and shift-based order history with payment method filters
- **Statistics** — Sales analytics by day, week, month, year, and shift with hourly charts
- **Admin Panel** — Full menu and inventory management protected by password
- **Stock Alerts** — Automatic low-stock warnings on app launch and after each sale

## Tech Stack

- **React** — UI components and state management
- **Electron** — Desktop app wrapper
- **Vite** — Build tool
- **localStorage** — Local data persistence (no internet required)

## Getting Started

### Prerequisites

- Node.js 18+

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ladder.git
cd ladder

# Install dependencies
npm install

# Run in development mode
npm run dev
```

### Build

```bash
# Generate installer (.exe on Windows, .dmg on Mac)
npm run build
```

The installer will be generated in the `dist-electron/` folder.

## Default Credentials

The admin panel is protected by a password. The default password is `1234` and can be changed from within the admin panel.

## Project Structure

```
ladder/
├── electron/
│   └── main.js           # Electron main process
├── src/
│   ├── components/       # Reusable UI components
│   ├── data/
│   │   └── store.js      # Local data layer
│   ├── screens/          # App screens
│   ├── App.jsx
│   └── index.css
├── assets/               # App icons
└── package.json
```

## License

Copyright (c) 2026 — All rights reserved. This software is proprietary and may not be copied, modified, distributed, or used without explicit written permission from the author.