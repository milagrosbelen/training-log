# MiLogit - Registro de Entrenamientos

Aplicación web para registrar y seguir tu progreso de entrenamientos.

## 📁 Estructura del Proyecto

Este proyecto está **separado en dos partes principales**:

```
registro-entrenamiento/
│
├── backend/          ← Servidor Node.js + Express + SQL Server
├── frontend/         ← Interfaz React + Vite + Tailwind
│
└── README_GENERAL.md ← Lee esto primero para entender todo
```

## 🚀 Inicio Rápido

### 1. Backend (Servidor)

```bash
cd backend
npm install    # Solo la primera vez
npm start      # Inicia el servidor en http://localhost:3000
```

### 2. Frontend (Interfaz)

En **otra terminal**:

```bash
cd frontend
npm install    # Solo la primera vez
npm run dev    # Inicia en http://localhost:5173
```

### 3. Abrir la Aplicación

Abre tu navegador en: `http://localhost:5173`

## 📚 Documentación

- **`README_GENERAL.md`** → Explica cómo funcionan juntos frontend y backend
- **`backend/README_BACKEND.md`** → Documentación completa del backend
- **`frontend/README_FRONTEND.md`** → Documentación completa del frontend

## 🎯 ¿Qué es cada parte?

### Backend
- **Qué es**: El servidor que maneja la lógica y se conecta a la base de datos
- **Puerto**: 3000
- **Tecnologías**: Node.js, Express, SQL Server
- **Ubicación**: `backend/`

### Frontend
- **Qué es**: La interfaz visual que el usuario ve y usa
- **Puerto**: 5173
- **Tecnologías**: React, Vite, Tailwind CSS
- **Ubicación**: `frontend/`

## ⚙️ Requisitos

- Node.js instalado
- SQL Server instalado y corriendo
- Base de datos `MiLogit` creada (ejecuta `backend/database.sql`)

## 📖 Para Aprender Más

Si eres principiante, lee en este orden:

1. **`README_GENERAL.md`** → Entiende el panorama general
2. **`backend/README_BACKEND.md`** → Aprende sobre el backend
3. **`frontend/README_FRONTEND.md`** → Aprende sobre el frontend

---

**¿Problemas?** Revisa la documentación específica de cada parte o los logs en la terminal.
