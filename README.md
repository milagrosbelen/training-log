# MiLogit - Registro de Entrenamientos

Aplicación web para registrar y seguir tu progreso de entrenamientos. **Frontend puro** con React, Vite y Tailwind CSS.

## 🚀 Inicio Rápido

```bash
npm install
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

## 📦 Stack

- **React** – UI
- **Vite** – Build
- **Tailwind CSS** – Estilos
- **Recharts** – Gráficos
- **Framer Motion** – Animaciones
- **React Router** – Navegación

## 📁 Estructura

```
src/
├── components/     # Componentes reutilizables
├── pages/          # Login, Register, etc.
├── utils/          # Utilidades
├── data/           # Datos estáticos (rutinas)
├── App.jsx
└── main.jsx
```

## 💾 Datos

- **Sin backend:** Los entrenamientos se guardan en **localStorage**.
- **Con backend:** Laravel + PostgreSQL en `backend/`. Ver **[LARAVEL.md](LARAVEL.md)** para documentación completa.

## 📜 Scripts

| Comando      | Descripción              |
|-------------|--------------------------|
| `npm run dev`    | Servidor de desarrollo   |
| `npm run build`  | Build para producción    |
| `npm run preview`| Vista previa del build   |
| `npm run lint`   | Ejecutar ESLint          |
